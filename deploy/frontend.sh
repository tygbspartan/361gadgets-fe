#!/usr/bin/env bash
#
# 361gadgets frontend deploy. Runs ON THE VPS as user grishan.
#
# Installed at /var/www/gadgets/deploy/frontend.sh and set as the forced
# command of the GitHub Actions deploy key in ~/.ssh/authorized_keys, so that
# key can run this script and nothing else. GitHub Actions sends one of:
#
#   check  <sha>   verify the server is ready to deploy <sha>; changes nothing
#   deploy <sha>   build <sha> in a new release folder, switch to it,
#                  health-check, and roll back automatically if it fails
#
# By hand (ssh in normally, then run it):
#   frontend.sh status              current release + the ones kept on disk
#   frontend.sh rollback [folder]   switch back to the previous (or named) release
#   frontend.sh bootstrap <sha>     one-time: build the first release and create
#                                   the frontend-current link, without touching PM2
#
# Layout (each release is a full build; the live app runs from the symlink):
#   /var/www/gadgets/repos/frontend.git          bare clone, fetch only
#   /var/www/gadgets/frontend-releases/<time>-<sha7>/
#   /var/www/gadgets/frontend-current -> frontend-releases/<live release>
#   /var/www/gadgets/shared/frontend.env.production   linked into every release
#
set -Eeuo pipefail
umask 002

APP_ROOT=/var/www/gadgets
REPO=$APP_ROOT/repos/frontend.git
RELEASES=$APP_ROOT/frontend-releases
CURRENT=$APP_ROOT/frontend-current
SHARED_ENV=$APP_ROOT/shared/frontend.env.production
LOCK_FILE=$APP_ROOT/deploy/frontend.lock
PM2_NAME=gadgets-web
PORT=3001
BRANCH=main
KEEP_RELEASES=4
MIN_FREE_GB=3

export PATH=/usr/local/bin:/usr/bin:/bin
export NEXT_TELEMETRY_DISABLED=1

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
die() { log "ERROR: $*"; exit 1; }

# Arguments come from the SSH forced command, or from the command line by hand.
read -r -a ARGS <<< "${SSH_ORIGINAL_COMMAND:-$*}"
ACTION=${ARGS[0]:-}
TARGET=${ARGS[1]:-}

DEST=""
BUILDING=""
# Runs on any exit: if a build was in progress, delete the half-built release.
on_exit() {
  if [[ -n "$BUILDING" && -n "$DEST" && -d "$DEST" ]]; then
    log "Build failed. Removing the unfinished release $DEST; the live site was not touched."
    rm -rf -- "$DEST"
  fi
}
trap on_exit EXIT

require_sha() {
  [[ "$TARGET" =~ ^[0-9a-f]{40}$ ]] || die "expected a full 40-character commit sha, got '$TARGET'"
}

fetch_and_verify_commit() {
  [[ -d "$REPO" ]] || die "missing bare repo $REPO (one-time setup not done)"
  log "Fetching $BRANCH"
  git --git-dir="$REPO" fetch --quiet --prune origin "+refs/heads/$BRANCH:refs/heads/$BRANCH"
  git --git-dir="$REPO" cat-file -e "$TARGET^{commit}" 2>/dev/null \
    || die "commit $TARGET not found on GitHub"
  git --git-dir="$REPO" merge-base --is-ancestor "$TARGET" "$BRANCH" \
    || die "commit $TARGET is not on $BRANCH; refusing to deploy it"
  log "Commit: $(git --git-dir="$REPO" log -1 --format='%h %s' "$TARGET")"
}

check_disk() {
  local free_kb
  free_kb=$(df --output=avail -k "$APP_ROOT" | tail -1 | tr -d ' ')
  (( free_kb > MIN_FREE_GB * 1024 * 1024 )) || die "less than ${MIN_FREE_GB} GB free under $APP_ROOT"
}

live_release() { readlink -f "$CURRENT" 2>/dev/null || true; }

pm2_cwd() {
  local pid
  pid=$(pm2 pid "$PM2_NAME" 2>/dev/null | tail -1)
  [[ "$pid" =~ ^[0-9]+$ && "$pid" != 0 ]] || return 1
  readlink -f "/proc/$pid/cwd"
}

health_check() {
  local i
  for i in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:$PORT/"; then
      log "Health check passed (attempt $i)"
      return 0
    fi
    sleep 2
  done
  return 1
}

# Point frontend-current at $1 atomically, restart the app, and confirm it is
# really running from that folder and answering.
switch_to() {
  local release=$1
  ln -sfn "$release" "$CURRENT.new"
  mv -Tf "$CURRENT.new" "$CURRENT"
  log "frontend-current -> $(basename "$release")"
  pm2 reload "$PM2_NAME" >/dev/null
  sleep 3
  local cwd
  cwd=$(pm2_cwd || true)
  [[ "$cwd" == "$release" ]] || { log "PM2 is running from '$cwd', expected '$release'"; return 1; }
  health_check
}

build_release() {
  local stamp
  stamp=$(date '+%Y%m%d-%H%M%S')
  DEST="$RELEASES/$stamp-${TARGET:0:7}"
  BUILDING=1
  mkdir -p "$DEST"
  log "Exporting ${TARGET:0:7} to $DEST"
  git --git-dir="$REPO" archive "$TARGET" | tar -x -C "$DEST"
  echo "$TARGET" > "$DEST/REVISION"
  ln -s "$SHARED_ENV" "$DEST/.env.production"

  # Reuse the live release's build cache to speed up next build.
  local prev
  prev=$(live_release)
  if [[ -n "$prev" && -d "$prev/.next/cache" ]]; then
    mkdir -p "$DEST/.next"
    cp -a "$prev/.next/cache" "$DEST/.next/"
  fi

  cd "$DEST"
  log "npm ci"
  npm ci --no-audit --no-fund --loglevel=error
  log "next build"
  npm run build
  [[ -f .next/BUILD_ID ]] || die "build finished without .next/BUILD_ID"
  BUILDING=""
  log "Built $(basename "$DEST")"
}

cleanup_releases() {
  local live keep=0 dir
  live=$(live_release)
  while IFS= read -r dir; do
    [[ -z "$dir" ]] && continue
    if [[ "$dir" == "$live" ]] || (( keep < KEEP_RELEASES )); then
      keep=$((keep + 1))
      continue
    fi
    log "Removing old release $(basename "$dir")"
    rm -rf -- "$dir"
  done < <(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d | sort -r)
}

previous_release() {
  local live dir
  live=$(live_release)
  while IFS= read -r dir; do
    [[ "$dir" < "$live" && -f "$dir/.next/BUILD_ID" ]] && { echo "$dir"; return 0; }
  done < <(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d | sort -r)
  return 1
}

mkdir -p "$APP_ROOT/deploy" "$RELEASES"
exec 9>"$LOCK_FILE"
flock -n 9 || die "another frontend deploy is already running"

case "$ACTION" in
  check)
    require_sha
    fetch_and_verify_commit
    check_disk
    [[ -f "$SHARED_ENV" ]] || die "missing $SHARED_ENV"
    [[ -L "$CURRENT" ]] || die "missing $CURRENT symlink (run bootstrap first)"
    log "Node $(node -v), npm $(npm -v)"
    log "Live release: $(basename "$(live_release)") (rev $(cat "$CURRENT/REVISION" 2>/dev/null || echo '?'))"
    log "PM2 $PM2_NAME runs from: $(pm2_cwd || echo 'not running')"
    log "Check OK: ready to deploy ${TARGET:0:7}. Nothing was changed."
    ;;

  deploy)
    require_sha
    [[ -L "$CURRENT" ]] || die "missing $CURRENT symlink (run bootstrap first)"
    [[ "$(pm2_cwd || true)" == "$(live_release)" ]] \
      || die "PM2 $PM2_NAME is not running from $CURRENT; finish the one-time PM2 switch first"
    fetch_and_verify_commit
    check_disk
    PREV=$(live_release)
    build_release
    if switch_to "$DEST"; then
      cleanup_releases
      log "Deployed ${TARGET:0:7}."
    else
      log "New release failed its checks. Rolling back to $(basename "$PREV")"
      switch_to "$PREV" || log "WARNING: the previous release also failed its health check. Look at: pm2 logs $PM2_NAME"
      die "deploy of ${TARGET:0:7} failed and was rolled back"
    fi
    ;;

  rollback)
    if [[ -n "$TARGET" ]]; then
      to="$RELEASES/$(basename "$TARGET")"
      [[ -f "$to/.next/BUILD_ID" ]] || die "no built release named $(basename "$TARGET")"
    else
      to=$(previous_release) || die "no earlier release to roll back to"
    fi
    switch_to "$to" || die "rolled back to $(basename "$to") but it failed its health check"
    log "Rolled back to $(basename "$to")."
    ;;

  bootstrap)
    require_sha
    [[ ! -e "$CURRENT" ]] || die "$CURRENT already exists; bootstrap is only for the first release"
    [[ -f "$SHARED_ENV" ]] || die "missing $SHARED_ENV"
    fetch_and_verify_commit
    check_disk
    build_release
    ln -sfn "$DEST" "$CURRENT"
    log "Created $CURRENT -> $(basename "$DEST"). PM2 was not touched."
    ;;

  status)
    log "Live: $(basename "$(live_release)") (rev $(cat "$CURRENT/REVISION" 2>/dev/null || echo '?'))"
    log "PM2 $PM2_NAME runs from: $(pm2_cwd || echo 'not running')"
    find "$RELEASES" -mindepth 1 -maxdepth 1 -type d | sort -r | sed 's#.*/#  #'
    ;;

  *)
    die "usage: frontend.sh check|deploy|bootstrap <sha> | rollback [release] | status"
    ;;
esac

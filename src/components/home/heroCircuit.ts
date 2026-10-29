/*
 * Artwork and boot-state shared by the hero (HeroStage) and the root layout.
 *
 * Deliberately a plain module, not a "use client" one: the root layout is a
 * server component, and importing a value from a client module there hands it
 * a client reference instead of the string.
 */

/* Drawn on a 1440-wide board, rendered as two halves (x < 720 and x >= 720)
   that each hug their own screen edge. Indices 0–6 are the left half, 7–13 the
   right. Each half is fitted to the hero's height, so the art is kept short
   (y 20–800, see BOARD_Y) and wide: the runs in from the screen edge are long
   so the board reaches well toward the headline at that scale. */
export const TRACES = [
  // Left
  "M0 120H280L330 170H460",
  "M0 210H190L250 270H400L440 310",
  "M0 400H280L320 360H400",
  "M0 520H220L270 570H380",
  "M0 690H360L410 640H520",
  "M160 770V740L210 690H300",
  "M340 50V70L380 110H500",
  // Right
  "M1440 120H1160L1110 170H980",
  "M1440 210H1250L1190 270H1040L1000 310",
  "M1440 400H1160L1120 360H1040",
  "M1440 520H1220L1170 570H1060",
  "M1440 690H1080L1030 640H920",
  "M1280 770V740L1230 690H1140",
  "M1100 50V70L1060 110H940",
] as const;

/* Vertical extent of the art (with room for the edge-cap nodes). */
export const BOARD_Y = { top: 40, height: 740 } as const;

export const HALF_W = 720;

/* A node at the inner end of every trace, plus caps on the four traces that
   start at the top/bottom edge of the board — the board is inset from the
   hero's edges, so those ends would otherwise stop in mid-air. `trace` ties
   each node to its trace for side and pop timing. */
export const NODES: readonly { x: number; y: number; trace: number }[] = [
  { x: 460, y: 170, trace: 0 },
  { x: 440, y: 310, trace: 1 },
  { x: 400, y: 360, trace: 2 },
  { x: 380, y: 570, trace: 3 },
  { x: 520, y: 640, trace: 4 },
  { x: 300, y: 690, trace: 5 },
  { x: 500, y: 110, trace: 6 },
  { x: 980, y: 170, trace: 7 },
  { x: 1000, y: 310, trace: 8 },
  { x: 1040, y: 360, trace: 9 },
  { x: 1060, y: 570, trace: 10 },
  { x: 920, y: 640, trace: 11 },
  { x: 1140, y: 690, trace: 12 },
  { x: 940, y: 110, trace: 13 },
  // Edge caps
  { x: 160, y: 770, trace: 5 },
  { x: 340, y: 50, trace: 6 },
  { x: 1280, y: 770, trace: 12 },
  { x: 1100, y: 50, trace: 13 },
];

/* The node the spotlight parks on under reduced motion (upper-left cluster). */
export const PARK_NODE = 1;

/* Traces that carry an ambient pulse, with negative delays so they start
   mid-cycle and out of step with each other. */
export const PULSES: readonly { trace: number; delay: string }[] = [
  { trace: 0, delay: "-1s" },
  { trace: 3, delay: "-3s" },
  { trace: 9, delay: "-2s" },
  { trace: 11, delay: "-4s" },
];

/* Position of a trace in the left/right interleaved draw order, 0–13. */
export const drawOrder = (i: number) => {
  const half = TRACES.length / 2;
  return i < half ? i * 2 : (i - half) * 2 + 1;
};

/* The boot sequence plays once per browser session. */
export const HERO_BOOT_KEY = "hero-booted";

/*
 * Run from <head> before first paint: on a reload later in the session the
 * server HTML would otherwise start the boot animation and then snap to the
 * finished state once React hydrates. Client-side navigations back to the
 * homepage are handled in HeroStage instead.
 */
/*
 * Run from <head>: a reload starts at the top of the page. Browsers restore
 * the old scroll position on reload by default; switching that off for this
 * load only (a reload, not back/forward, which keeps restoring as normal) and
 * jumping to the top before first paint avoids the page opening mid-way down.
 * Restoration is switched back on once the page has loaded, so later
 * back/forward navigations inside the app restore as usual.
 */
export const SCROLL_TOP_ON_RELOAD_SCRIPT = `try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"){history.scrollRestoration="manual";scrollTo(0,0);addEventListener("load",function(){scrollTo(0,0);requestAnimationFrame(function(){history.scrollRestoration="auto"})})}}catch(e){}`;

export const HERO_BOOT_SCRIPT =`try{if(sessionStorage.getItem(${JSON.stringify(
  HERO_BOOT_KEY,
)}))document.documentElement.setAttribute("data-hero-booted","")}catch(e){}`;

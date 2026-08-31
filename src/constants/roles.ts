import type { UserRole, User } from "@/types/auth.types";

export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
} as const;

/**
 * Privileged = can reach admin endpoints (vendor OR platform operator).
 * Mirrors the backend `isPrivileged(role)` helper.
 */
export function isPrivileged(role?: UserRole | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
}

/** Platform operator only. Mirrors the backend `isSuper(role)` helper. */
export function isSuper(role?: UserRole | null): boolean {
  return role === ROLES.SUPERADMIN;
}

/** True for any non-superadmin privileged user (i.e. a vendor whose data is scoped). */
export function isScopedVendor(role?: UserRole | null): boolean {
  return isPrivileged(role) && !isSuper(role);
}

/** Convenience guard against a user object. */
export const userIsPrivileged = (user?: Pick<User, "role"> | null) =>
  isPrivileged(user?.role);
export const userIsSuper = (user?: Pick<User, "role"> | null) =>
  isSuper(user?.role);

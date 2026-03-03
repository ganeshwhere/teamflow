import { describe, expect, it } from "vitest";

import { isProtectedPath, isPublicPath, shouldRedirectToLogin } from "./route-access";

describe("route access guards", () => {
  it("identifies public routes", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/register")).toBe(true);
    expect(isPublicPath("/api/auth/session")).toBe(true);
    expect(isPublicPath("/teams")).toBe(false);
  });

  it("identifies protected routes", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/teams/team_1")).toBe(true);
    expect(isProtectedPath("/projects")).toBe(true);
    expect(isProtectedPath("/projects/project_1")).toBe(true);
    expect(isProtectedPath("/invite")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("redirects only when protected and unauthenticated", () => {
    expect(shouldRedirectToLogin("/dashboard", false)).toBe(true);
    expect(shouldRedirectToLogin("/teams/team_1", false)).toBe(true);
    expect(shouldRedirectToLogin("/projects", false)).toBe(true);
    expect(shouldRedirectToLogin("/login", false)).toBe(false);
    expect(shouldRedirectToLogin("/api/auth/session", false)).toBe(false);
    expect(shouldRedirectToLogin("/dashboard", true)).toBe(false);
  });
});

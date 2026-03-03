import { describe, expect, it } from "vitest";

import { normalizeProjectStatus, projectStatusLabel, projectStatusTone } from "./project-meta";

describe("project-meta", () => {
  it("normalizes unknown statuses to ACTIVE", () => {
    expect(normalizeProjectStatus(undefined)).toBe("ACTIVE");
    expect(normalizeProjectStatus("SOMETHING_ELSE")).toBe("ACTIVE");
  });

  it("returns user-friendly labels and tone classes", () => {
    expect(projectStatusLabel("IN_PROGRESS")).toBe("ACTIVE");
    expect(projectStatusLabel("ARCHIVED")).toBe("ARCHIVED");
    expect(projectStatusTone("COMPLETED")).toContain("emerald");
    expect(projectStatusTone("ARCHIVED")).toContain("zinc");
    expect(projectStatusTone("ACTIVE")).toContain("sky");
  });
});

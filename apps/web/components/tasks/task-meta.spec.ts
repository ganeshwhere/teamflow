import { describe, expect, it } from "vitest";

import { taskPriorityLabel, taskPriorityTone, taskStatusLabel, taskStatusTone } from "./task-meta";

describe("task-meta", () => {
  it("returns readable labels for task status and priority", () => {
    expect(taskStatusLabel("TODO")).toBe("Todo");
    expect(taskStatusLabel("IN_PROGRESS")).toBe("In Progress");
    expect(taskPriorityLabel("URGENT")).toBe("Urgent");
    expect(taskPriorityLabel("MEDIUM")).toBe("Medium");
  });

  it("returns tone classes for status and priority variants", () => {
    expect(taskStatusTone("DONE")).toContain("emerald");
    expect(taskStatusTone("IN_REVIEW")).toContain("amber");
    expect(taskPriorityTone("HIGH")).toContain("amber");
    expect(taskPriorityTone("LOW")).toContain("emerald");
  });
});

import { describe, expect, it } from "vitest";

import { fail } from "./utils";

describe("action error normalization", () => {
  it("returns message for Error instances", () => {
    const result = fail(new Error("validation failed"));
    expect(result).toEqual({ data: null, error: "validation failed" });
  });

  it("returns fallback message for unknown errors", () => {
    const result = fail("unexpected");
    expect(result).toEqual({ data: null, error: "Unexpected error" });
  });
});

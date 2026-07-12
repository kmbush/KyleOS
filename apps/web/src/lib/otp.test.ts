import { describe, expect, it } from "vitest";
import { applyOtpBackspace, applyOtpEntry, OTP_LENGTH } from "./otp";

const empty = () => Array<string>(OTP_LENGTH).fill("");

describe("applyOtpEntry", () => {
  it("stores the digit and advances to the next box", () => {
    expect(applyOtpEntry(empty(), 0, "4")).toEqual({
      digits: ["4", "", "", "", "", ""],
      focus: 1,
    });
  });

  it("keeps only the last numeric character", () => {
    const result = applyOtpEntry(empty(), 2, "7x");
    expect(result.digits[2]).toBe("7");
  });

  it("ignores non-numeric input, leaving the box empty and focus put", () => {
    expect(applyOtpEntry(empty(), 0, "a")).toEqual({ digits: empty(), focus: 0 });
  });

  it("does not advance past the last box", () => {
    const start = ["1", "2", "3", "4", "5", ""];
    expect(applyOtpEntry(start, OTP_LENGTH - 1, "6").focus).toBe(OTP_LENGTH - 1);
  });
});

describe("applyOtpBackspace", () => {
  it("clears the current digit when the box is filled", () => {
    expect(applyOtpBackspace(["1", "2", "", "", "", ""], 1)).toEqual({
      digits: ["1", "", "", "", "", ""],
      focus: 1,
    });
  });

  it("steps back and clears the previous digit when the box is empty", () => {
    expect(applyOtpBackspace(["1", "2", "", "", "", ""], 2)).toEqual({
      digits: ["1", "", "", "", "", ""],
      focus: 1,
    });
  });

  it("stays put at the first box", () => {
    expect(applyOtpBackspace(empty(), 0)).toEqual({ digits: empty(), focus: 0 });
  });
});

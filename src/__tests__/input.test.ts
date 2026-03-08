import { describe, it, expect } from "vitest";
import { parseTimeInput } from "../input";

describe("parseTimeInput", () => {
  it("parses valid H:MM times", () => {
    expect(parseTimeInput("7:30")).toEqual({ h: 7, m: 30 });
    expect(parseTimeInput("12:00")).toEqual({ h: 12, m: 0 });
    expect(parseTimeInput("1:05")).toEqual({ h: 1, m: 5 });
  });

  it("rejects hour 0", () => {
    expect(parseTimeInput("0:30")).toBeNull();
  });

  it("rejects hour > 12", () => {
    expect(parseTimeInput("13:00")).toBeNull();
    expect(parseTimeInput("99:00")).toBeNull();
  });

  it("rejects minutes > 59", () => {
    expect(parseTimeInput("3:60")).toBeNull();
    expect(parseTimeInput("3:99")).toBeNull();
  });

  it("rejects single-digit minutes (requires MM)", () => {
    expect(parseTimeInput("3:5")).toBeNull();
  });

  it("rejects three-digit minutes", () => {
    expect(parseTimeInput("3:005")).toBeNull();
  });

  it("rejects missing colon", () => {
    expect(parseTimeInput("730")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(parseTimeInput("")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseTimeInput("a:bc")).toBeNull();
    expect(parseTimeInput("hello")).toBeNull();
  });

  it("accepts two-digit hours", () => {
    expect(parseTimeInput("10:15")).toEqual({ h: 10, m: 15 });
    expect(parseTimeInput("12:59")).toEqual({ h: 12, m: 59 });
  });

  it("rejects three-digit hours", () => {
    expect(parseTimeInput("123:00")).toBeNull();
  });

  it("handles boundary minutes", () => {
    expect(parseTimeInput("1:00")).toEqual({ h: 1, m: 0 });
    expect(parseTimeInput("1:59")).toEqual({ h: 1, m: 59 });
  });
});

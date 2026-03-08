import { describe, it, expect } from "vitest";
import { formatTime, formatElapsed, escapeHtml } from "../utils";

describe("formatTime", () => {
  it("formats hour and zero minutes", () => {
    expect(formatTime(3, 0)).toBe("3:00");
  });

  it("formats hour and non-zero minutes", () => {
    expect(formatTime(7, 30)).toBe("7:30");
  });

  it("pads single-digit minutes", () => {
    expect(formatTime(12, 5)).toBe("12:05");
  });

  it("handles 12:00", () => {
    expect(formatTime(12, 0)).toBe("12:00");
  });

  it("handles 1:59", () => {
    expect(formatTime(1, 59)).toBe("1:59");
  });
});

describe("formatElapsed", () => {
  it("formats zero", () => {
    expect(formatElapsed(0)).toBe("0:00.0");
  });

  it("formats seconds and tenths", () => {
    expect(formatElapsed(5200)).toBe("0:05.2");
  });

  it("formats minutes and seconds", () => {
    expect(formatElapsed(65300)).toBe("1:05.3");
  });

  it("formats exact minute", () => {
    expect(formatElapsed(120000)).toBe("2:00.0");
  });

  it("truncates sub-100ms digits", () => {
    expect(formatElapsed(1050)).toBe("0:01.0");
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).not.toContain("<script>");
  });

  it("escapes ampersand", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("passes through safe strings", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

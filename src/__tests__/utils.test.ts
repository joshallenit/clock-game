import { describe, it, expect } from "vitest";
import { formatTime, formatElapsed, hourHandAngle, minuteHandAngle } from "../utils";

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

describe("hourHandAngle", () => {
  it("points straight up at 12:00", () => {
    expect(hourHandAngle(12, 0)).toBeCloseTo(-Math.PI / 2);
  });

  it("points right at 3:00", () => {
    expect(hourHandAngle(3, 0)).toBeCloseTo(0);
  });

  it("points down at 6:00", () => {
    expect(hourHandAngle(6, 0)).toBeCloseTo(Math.PI / 2);
  });

  it("points left at 9:00", () => {
    expect(hourHandAngle(9, 0)).toBeCloseTo(Math.PI);
  });

  it("advances partway for non-zero minutes", () => {
    // At 12:30, the hour hand is halfway between 12 and 1
    const angle = hourHandAngle(12, 30);
    expect(angle).toBeGreaterThan(-Math.PI / 2);
    expect(angle).toBeLessThan(-Math.PI / 2 + Math.PI / 6);
  });
});

describe("minuteHandAngle", () => {
  it("points straight up at :00", () => {
    expect(minuteHandAngle(0)).toBeCloseTo(-Math.PI / 2);
  });

  it("points right at :15", () => {
    expect(minuteHandAngle(15)).toBeCloseTo(0);
  });

  it("points down at :30", () => {
    expect(minuteHandAngle(30)).toBeCloseTo(Math.PI / 2);
  });

  it("points left at :45", () => {
    expect(minuteHandAngle(45)).toBeCloseTo(Math.PI);
  });
});

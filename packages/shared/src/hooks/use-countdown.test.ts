// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "./use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns expired state for null target", () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current.isExpired).toBe(true);
    expect(result.current.totalSeconds).toBe(0);
    expect(result.current.label).toBe("0:00");
  });

  it("counts down to target time", () => {
    const now = new Date("2026-04-09T12:00:00Z").getTime();
    vi.setSystemTime(now);

    const target = "2026-04-09T13:30:45Z"; // 1h 30m 45s from now
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.hours).toBe(1);
    expect(result.current.minutes).toBe(30);
    expect(result.current.seconds).toBe(45);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.label).toBe("1:30:45");
  });

  it("updates every second", () => {
    const now = new Date("2026-04-09T12:00:00Z").getTime();
    vi.setSystemTime(now);

    const target = "2026-04-09T12:00:10Z"; // 10 seconds from now
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.totalSeconds).toBe(10);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.totalSeconds).toBe(9);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.totalSeconds).toBe(4);
  });

  it("returns expired when time passes target", () => {
    const now = new Date("2026-04-09T12:00:00Z").getTime();
    vi.setSystemTime(now);

    const target = "2026-04-09T12:00:03Z"; // 3 seconds from now
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.isExpired).toBe(false);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.isExpired).toBe(true);
    expect(result.current.totalSeconds).toBe(0);
  });

  it("formats label without hours when < 1 hour", () => {
    const now = new Date("2026-04-09T12:00:00Z").getTime();
    vi.setSystemTime(now);

    const target = "2026-04-09T12:05:30Z"; // 5m 30s
    const { result } = renderHook(() => useCountdown(target));

    expect(result.current.label).toBe("5:30");
  });
});

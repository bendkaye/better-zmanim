import { useState, useEffect } from "react";

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  label: string;
}

export function useCountdown(targetTime: string | null): CountdownResult {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!targetTime) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      label: "0:00",
    };
  }

  const target = new Date(targetTime).getTime();
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isExpired = diff <= 0;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const label =
    hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${minutes}:${pad(seconds)}`;

  return { hours, minutes, seconds, totalSeconds, isExpired, label };
}

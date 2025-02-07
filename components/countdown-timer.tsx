"use client";
import { useState, useEffect } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};
const calculateTimeLeft = (endTime: string): TimeLeft => {
  const difference = new Date(endTime).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export function CountdownTimer({ endTime }: { endTime: string; }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(endTime)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <span className="text-sm">
      {`${timeLeft.days}:${String(timeLeft.hours).padStart(2, "0")}:${String(
        timeLeft.minutes
      ).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`}
    </span>
  );
}

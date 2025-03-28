"use client";
import { FACECOIN_TOKEN_ADDRESS } from "@/lib/facecoin-token";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
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

export function LargeCountdownTimer({ endTime }: { endTime: string }) {
  const [, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex flex-col items-center text-[14px]">
      <h2 className="text-[16px] font-semibold">
        {/* {`${timeLeft.days ? `${timeLeft.days}:` : ""}${String(
        timeLeft.hours
        ).padStart(2, "0")}:${String(timeLeft.minutes).padStart(2, "0")}:${String(
          timeLeft.seconds
          ).padStart(2, "0")}`}{" "} */}
        Liquidity is live! 🎉
      </h2>
      <Link
        href={`https://dexscreener.com/base/${FACECOIN_TOKEN_ADDRESS}`}
        className="hover:text-blue-700 hover:underline"
      >
        Dexscreener{" "}
        <span>
          <ExternalLinkIcon className="h-4 w-4 inline-block -mt-0.5" />
        </span>
      </Link>
    </div>
  );
}

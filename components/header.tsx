"use client";

import { TTL } from "@/lib/TTL-timestamp";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CountdownTimer } from "./countdown-timer";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const showTTL = !pathname?.includes("onboard");

  return (
    <>
      <header className="w-full bg-theme-primary text-primary-foreground py-2 top-0 fixed overscroll-contain">
        <div
          className={cn(
            "container flex items-center",
            showTTL ? "justify-between" : "justify-center"
          )}
        >
          <Link href="/" className="text-[32px] font-bold w-fit">
            facecoin
          </Link>
          {showTTL && (
            <div className="flex items-center gap-4">
              <CountdownTimer endTime={TTL} />
              <span className="text-sm">Till Liquidity</span>
            </div>
          )}
        </div>
      </header>
      <div className="h-[60px]" />
    </>
  );
}

"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Header() {
  const showTTL = !window.location.href?.includes("onboard");
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
              <span className="text-sm">3:16:09:09</span>
              <span className="text-sm">Till Liquidity</span>
            </div>
          )}
        </div>
      </header>
      <div className="h-[60px]" />
    </>
  );
}

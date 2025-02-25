"use client";

import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  return (
    <header className={"w-full top-0 sticky z-10"}>
      {pathname === "/" && (
        <div className="bg-theme-primary-foreground text-primary-foreground py-1 w-full flex items-center justify-center">
          <Link
            href="https://withmetal.typeform.com/to/n6fdLitN"
            className="text-sm text-black font-bold"
          >
            Looking for community takeover{" "}
            <span className="inline-block underline font-bold">
              <u>
                apply here{" "}
                <ExternalLinkIcon className="inline-block w-3.5 h-3.5 -mt-0.5 " strokeWidth={2.4} />
              </u>
            </span>
          </Link>
        </div>
      )}
      <div
        className={cn(
          "container flex items-center justify-center bg-theme-primary text-primary-foreground py-2"
        )}
      >
        <Link href="/" className="text-[32px] font-bold w-fit" prefetch={false}>
          facecoin
        </Link>
      </div>
    </header>
  );
}

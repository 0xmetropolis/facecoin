import { cn } from "@/lib/utils";
import Link from "next/link";

export function Header() {
  return (
    <>
      <header className="w-full bg-theme-primary text-primary-foreground py-2 top-0 fixed z-10">
        <div className={cn("container flex items-center justify-center")}>
          <Link
            href="/"
            className="text-[32px] font-bold w-fit"
            prefetch={false}
          >
            facecoin
          </Link>
        </div>
      </header>
      <div className="h-[60px]" />
    </>
  );
}

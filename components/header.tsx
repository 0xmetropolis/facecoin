import Link from "next/link";

export function Header() {
  return (
    <header className="w-full bg-theme-primary text-primary-foreground py-2">
      <div className="container flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          facecoin
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm">3:16:09:09</span>
          <span className="text-sm">Till Liquidity</span>
        </div>
      </div>
    </header>
  );
}

import { TokenGrid } from "@/components/token-grid";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Button
          size="lg"
          className="bg-theme-primary text-theme-primary-foreground hover:bg-theme-primary/90"
          asChild
        >
          <Link href="/onboard">Sign Up</Link>
        </Button>
      </div>
      <TokenGrid />
    </div>
  );
}

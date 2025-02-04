import { UserGrid } from "@/components/user-grid";
import { Button } from "@/components/shadcn/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Button asChild variant="default">
          <Link href="/onboard">Sign Up</Link>
        </Button>
      </div>
      <UserGrid />
    </div>
  );
}

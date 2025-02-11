import { Button } from "@/components/shadcn/button";
import { UserGrid } from "@/components/user-grid";
import Link from "next/link";

// render this page on each request (no caching)
// export const dynamic = "force-dynamic";

export default async function Home() {
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

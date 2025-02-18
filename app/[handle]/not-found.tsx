import { Button } from "@/components/shadcn/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <h2 className="text-xl font-semibold">Profile Not Found</h2>
      <p className="text-muted-foreground">
        Could not find the requested profile.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
} 
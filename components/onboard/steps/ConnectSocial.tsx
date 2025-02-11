"use client";

import { Button } from "@/components/shadcn/button";

export function ConnectSocials({
  initFC,
  initTwitter,
}: {
  initFC: (_: unknown) => void;
  initTwitter: (_: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={initTwitter} className="font-bold">
        Sign up with Twitter
      </Button>
      <Button onClick={initFC} className="font-bold">
        Sign up with Farcaster
      </Button>
    </div>
  );
}

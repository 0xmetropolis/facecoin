"use client";

import { Button } from "@/components/shadcn/button";
import { usePrivy } from "@privy-io/react-auth";

export function FarcasterConnect() {
  const { login } = usePrivy();

  const handleLink = (provider: "farcaster" | "twitter") => () =>
    login({ loginMethods: [provider], disableSignup: true });

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleLink("twitter")} className="font-bold">
        Sign up with Twitter
      </Button>
      <Button onClick={handleLink("farcaster")} className="font-bold">
        Sign up with Farcaster
      </Button>
    </div>
  );
}

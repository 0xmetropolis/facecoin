"use client";

import { LoadingIcon } from "@/components/loading-icon";
import { Button } from "@/components/shadcn/button";
import { useLogout } from "@privy-io/react-auth";

export function ConnectSocials({
  initFC,
  initTwitter,
  isLoading,
}: {
  initFC: (_: unknown) => void;
  initTwitter: (_: unknown) => void;
  isLoading: boolean;
}) {
  const { logout } = useLogout();
  if (isLoading) return <LoadingIcon />;

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={initTwitter} className="font-bold">
        Sign up with Twitter
      </Button>
      <Button onClick={initFC} className="font-bold">
        Sign up with Farcaster
      </Button>
      {process.env.NODE_ENV !== "production" && (
        <Button onClick={logout}>logout</Button>
      )}
    </div>
  );
}

import { TTL } from "@/lib/TTL-timestamp";
import { getUserFromRequest } from "@/lib/utils/user";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "../avatar/avatar";
import { LargeCountdownTimer } from "../base/countdown-timer";
import { Button } from "../shadcn/button";

export const RightSide = async () => {
  const user = await getUserFromRequest();

  return user ? (
    <Avatar user={user} containerClasses="w-[60px] h-[60px]" iconOnly />
  ) : (
    <Button asChild variant="default">
      <Link href="/onboard">Sign Up</Link>
    </Button>
  );
};

export const StatusBar = () => {
  return (
    <div className="flex flex-row justify-between items-center px-4 py-2">
      <LargeCountdownTimer endTime={TTL} />
      <Suspense fallback={<div className="w-[60px] h-[60px]" />}>
        <RightSide />
      </Suspense>
    </div>
  );
};

import { TTL } from "@/lib/TTL-timestamp";
import { getUserFromRequest } from "@/lib/utils/user";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "../avatar/avatar";
import { LargeCountdownTimer } from "../base/countdown-timer";
import { Button } from "../shadcn/button";
import prisma from "@/lib/prisma";

export const RightSide = async () => {
  const user = await getUserFromRequest();

  const unreadPokeCount = !user
    ? 0
    : await prisma.pokeEvent
        .findMany({
          where: {
            OR: [{ victimId: user?.id }],
            createdAt: {
              gt: user.lastCheckedProfile,
            },
          },
        })
        .then((res) => {
          console.log(res);
          return res.length;
        });

  return user ? (
    <div className="relative">
      <Avatar user={user} containerClasses="w-[60px] h-[60px]" iconOnly />
      {!!unreadPokeCount && (
        <div className="rounded-full bg-red-600 absolute -top-2 -right-2 text-white text-sm w-5 h-5 flex items-center justify-center">
          {unreadPokeCount}
        </div>
      )}
    </div>
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

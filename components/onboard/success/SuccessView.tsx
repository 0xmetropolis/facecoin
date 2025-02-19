"use client";

import { Avatar } from "@/components/avatar/avatar";
import { InfoSection } from "@/components/base/info-section";
import { Button } from "@/components/shadcn/button";
import { useUser } from "@/lib/queries/user";
import { User } from "@/lib/types";
import Link from "next/link";

function getXLink(user: User): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(
    `I just got ${Number(
      user?.tokenAllocation
    ).toLocaleString()} $facecoin on facecoin.world\n\n`
  )}&url=${encodeURIComponent(`https://facecoin.world/${user.socialHandle}`)}`;
}

function getWPLink(user: User): string {
  //https://warpcast.com/~/compose?text=Hello%20world!&embeds[]=https://farcaster.xyz
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(
    `I just got ${Number(user?.tokenAllocation).toLocaleString()} $facecoin`
  )}&embeds[]=${encodeURIComponent(
    `https://facecoin.world/${user.socialHandle}`
  )}`;
}

export function SuccessView({ userId }: { userId: number }) {
  const { data: user } = useUser({ id: userId });

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto flex-1 justify-between">
      {/* Success Message */}
      <div className="text-center space-y-2">
        <h2>FaceCoin terminal has given you</h2>
        <p className="text-2xl font-bold">
          {user?.tokenAllocation
            ? Number(user.tokenAllocation).toLocaleString()
            : ""}{" "}
          $facecoin
        </p>
      </div>

      {/* Avatar Section */}
      <Avatar user={user} containerClasses="w-48" />

      {/* Bonus Info Section */}
      <InfoSection
        title="Share"
        body={
          <div className="flex flex-col gap-1">
            <p className="text-sm">Share on Twitter/X and Warpcast</p>
            <div className="flex gap-4 w-full justify-center">
              <Link href={user ? getXLink(user) : ""} target="_blank">
                <Button variant={"secondary"}>Twitter →</Button>
              </Link>
              <Link href={user ? getWPLink(user) : ""} target="_blank">
                <Button variant={"secondary"}>Warpcast →</Button>
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}

"use client";

import { Avatar } from "@/components/avatar";
import { InfoSection } from "@/components/info-section";
import { Button } from "@/components/shadcn/button";
import { useUser } from "@/lib/queries/user";
import Link from "next/link";
import { formatEther } from "viem";

export function SuccessView({ userId }: { userId: number }) {
  const { data: user } = useUser({ id: userId });

  return (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto flex-1 justify-between">
      {/* Success Message */}
      <div className="text-center space-y-2">
        <h2>FaceCoin terminal has given you</h2>
        <p className="text-2xl font-bold">
          {user?.tokenAllocation_wei
            ? formatEther(BigInt(user.tokenAllocation_wei))
            : ""}{" "}
          $facecoin
        </p>
      </div>

      {/* Avatar Section */}
      <Avatar userId={userId} />

      {/* Bonus Info Section */}
      <InfoSection
        title="Get 2X more coins"
        body={
          <div className="flex flex-col gap-1">
            <p className="text-sm">
              Share on Twitter/X and Farcaster to earn a bonus
            </p>
            <div className="flex gap-4 w-full justify-center">
              <Link href={"google.com"}>
                <Button variant={"secondary"}>Twitter →</Button>
              </Link>
              <Link href={"google.com"}>
                <Button variant={"secondary"}>Farcaster →</Button>
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}

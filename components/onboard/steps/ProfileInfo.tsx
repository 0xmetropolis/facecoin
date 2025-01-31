"use client";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function ProfileInfo({ onNext }: { onNext: () => void }) {
  const [farcasterID, setFarcasterID] = useState("");
  const { user } = usePrivy();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
        <p className="text-gray-600">Verify your Farcaster details</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={user?.farcaster?.displayName || ""}
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="followers">Follower Count</Label>
          <Input id="followers" value={"5"} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fid">Your Farcaster ID</Label>
          <Input
            id="fid"
            value={farcasterID}
            onChange={(e) => setFarcasterID(e.target.value)}
            placeholder="Enter your Farcaster ID"
          />
        </div>
      </div>

      <Button onClick={onNext} className="w-full">
        Continue
      </Button>
    </div>
  );
}

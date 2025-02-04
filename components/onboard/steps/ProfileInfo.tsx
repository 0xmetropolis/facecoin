"use client";

import { Button } from "@/components/shadcn/button";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

export function ProfileInfo({ onNext }: { onNext: () => void }) {
  const { user } = usePrivy();

  const twitter = user?.twitter;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#4267B2] text-white p-4 text-center">
        <h1 className="text-4xl font-bold">facecoin</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
            <Image
              src={twitter?.profilePictureUrl || "/facebook-avatar.webp"}
              alt={`${twitter?.name} profile picture`}
              fill
              className="object-cover"
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">
              @{twitter?.username || "username"}
            </h2>
            <p className="text-gray-600">
              {twitter?.followers || "3234"} followers
            </p>
          </div>

          <Button className="font-bold">Upload picture</Button>
        </div>

        {/* FaceCoin ID Section */}
        <div className="text-center space-y-2">
          <h3 className="text-xl">Your FaceCoin ID is:</h3>
        </div>

        {/* Bonus Section */}
        <div className="bg-gray-50 p-4 rounded-lg text-center space-y-2">
          <h3 className="text-lg font-semibold text-green-600">
            Get 10X more coins
          </h3>
          <p className="text-gray-700">
            Show your FaceCoin ID to the FaceCoin terminal at the Metal booth
          </p>
        </div>

        <Button onClick={onNext} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}

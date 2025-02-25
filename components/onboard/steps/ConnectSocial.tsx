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
    <div className="flex flex-col gap-10">
      {/* <h2 className="text-xl text-center border-t border-b py-4 border-gray-300">
        Facecoin is a <b className="font-bold">social token</b> that{" "}
        <b className="font-bold">connects you</b> with the people around you.
      </h2> */}
      {/* sign up for facecoin it's free and anyone can join. */}
      <div className="flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-lg">Sign up for Facecoin</p>
          <p className="text-sm text-gray-500">
            It&apos;s free and anyone can join.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={initTwitter} className="font-bold">
            Sign up with Twitter
          </Button>
          <Button onClick={initFC} className="font-bold">
            Sign up with Farcaster
          </Button>
        </div>
      </div>
    </div>
  );
}

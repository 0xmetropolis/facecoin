"use client";

import { CameraDrawer } from "@/components/camera-drawer";
import { InfoSection } from "@/components/info-section";
import { Profile } from "@/components/profile";
import { Button } from "@/components/shadcn/button";
import {
  Drawer,
  DrawerTrigger
} from "@/components/shadcn/drawer";
import { Skeleton } from "@/components/shadcn/skeleton";
import { userQueryId, useUserByPrivyId } from "@/lib/queries/user";
import { User } from "@/lib/types";
import { useUser } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UploadSelfie() {
  const { user: privyUser } = useUser();
  const { data: user } = useUserByPrivyId({ id: privyUser?.id });
  const router = useRouter();
  const queryClient = useQueryClient();

  type ImgUrl = `https://${string}`;

  const [processedImageState, setProcessedImageState] = useState<
    | "init"
    | "processing"
    // or url
    | ImgUrl
    | { error: Error }
  >("init");

  const facecoinId = user?.facecoinCode;
  const socialHandle = user?.socialHandle;
  const followerCount = user?.followerCount;
  const isProcessing = processedImageState === "processing";

  const [dots, setDots] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 800);
    }
    return () => interval && clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="flex-1 flex flex-col items-center gap-4 justify-between">
      <Drawer>
        {processedImageState === "processing" ? (
          <div className="flex-1 flex items-center">
            <h3 className="font-semibold flex items-center">
              <span>FaceCoin is processing your face</span>
              <span className="w-[18px]">{dots}</span>
            </h3>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col gap-4 items-center">
                <div className="flex flex-row items-center space-x-4">
                  <Profile pfp={user?.pfp || "/facebook-avatar.webp"} />
                  <div className="text-left">
                    <h2 className="font-semibold flex items-center gap-1">
                      @
                      {socialHandle || (
                        <Skeleton className="w-14 h-5 inline-flex" />
                      )}
                    </h2>
                    {followerCount ? (
                      <p className="text-sm flex items-center gap-1">
                        {followerCount} followers
                      </p>
                    ) : (
                      <Skeleton className="w-20 h-5" />
                    )}
                  </div>
                </div>
              </div>
              <DrawerTrigger asChild>
                <Button className="font-bold">Upload picture</Button>
              </DrawerTrigger>
            </div>
            {typeof processedImageState === "object" &&
              "error" in processedImageState && (
                <div className="flex flex-col items-center ">
                  <h3 className="text-red-500 font-semibold">
                    An error occured!
                  </h3>
                  <p className="text-red-500 text-sm">
                    {processedImageState.error.message}
                  </p>
                </div>
              )}
            <div className="text-center space-y-2">
              <h3>Your FaceCoin ID is:</h3>
              <p className="text-2xl font-bold">{facecoinId}</p>
            </div>
            <InfoSection
              title="Get 10X more coins"
              body={
                <p className="text-sm">
                  Show your FaceCoin ID to the FaceCoin terminal at the Metal
                  booth
                </p>
              }
            />
          </>
        )}

        <CameraDrawer
          onSnap={async (photo) => {
            if (!user?.id) return;
            setProcessedImageState("processing");
            await fetch("/api/uploadSelfie", {
              method: "POST",
              body: JSON.stringify({ photo }),
            })
              .then(async (response) => ({
                ...response,
                body: (await response.json()) as {
                  message: string;
                  updatedUser: User;
                },
              }))
              .then((res) => {
                if (res.body.message === "OK") {
                  queryClient.setQueryData(
                    userQueryId(user.id),
                    res.body.updatedUser
                  );
                  router.replace(`/onboard/${user.id}/success`);
                } else
                  setProcessedImageState({
                    error: new Error(res.body.message),
                  });
              })
              .catch((error: Error) => {
                console.error(error);
                setProcessedImageState({ error });
              });
          }}
        />
      </Drawer>
    </div>
  );
}

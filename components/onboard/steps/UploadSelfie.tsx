"use client";

import { CameraDrawer } from "@/components/base/camera-drawer";
import { InfoSection } from "@/components/base/info-section";
import { Button } from "@/components/shadcn/button";
import { Drawer, DrawerTrigger } from "@/components/shadcn/drawer";
import { Skeleton } from "@/components/shadcn/skeleton";
import { userQueryId, useUserByPrivyId } from "@/lib/queries/user";
import { User } from "@/lib/types";
import { useUser } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import uploadSelfie from "@/components/onboard/upload-selfie.png";
import generatePfp from "@/components/onboard/generate-pfp.png";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

  const [secondsSinceProcessingStarted, setSecondsSinceProcessingStarted] =
    useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setSecondsSinceProcessingStarted((prev) => prev + 1);
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isProcessing]);

  const dots = Array(secondsSinceProcessingStarted % 4).fill(".");

  return (
    <div className="flex-1 flex flex-col items-center gap-4 justify-between">
      <Drawer>
        {processedImageState === "processing" ? (
          <div className="flex-1 flex items-center flex-col gap-2 justify-center">
            <h3 className="font-semibold flex items-center">
              <span>FaceCoin is processing your face</span>
              <span className="w-[18px]">{dots}</span>
            </h3>

            <p
              className={cn(
                "text-sm text-gray-500 hidden",
                secondsSinceProcessingStarted > 12 && "block"
              )}
            >
              [looks like your face might take a while]
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-col gap-4 items-center">
                <div className="flex flex-row items-center space-x-4">
                  <div className="flex flex-col gap-2 w-[60px]">
                    <div className="relative aspect-square">
                      <Image
                        fill
                        alt="pfp"
                        quality={10}
                        className="aspect-square object-cover"
                        priority
                        placeholder="blur"
                        blurDataURL="/facebook-avatar.webp"
                        src={
                          user?.pfp
                            ? `${user?.pfp}?lastmod=${new Date()}`
                            : "/facebook-avatar.webp"
                        }
                      />
                    </div>
                  </div>
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
            </div>
            <div className="flex items-center gap-2 w-full justify-center">
              <div className="flex flex-col items-center gap-2">
                <p className="font-bold px-2">1. Upload Selfie</p>
                <div className="w-[100px] h-[100px] relative">
                  <Image
                    src={uploadSelfie}
                    alt="upload selfie"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="font-bold px-2">2. Generate PFP</p>
                <div className="w-[100px] h-[100px] relative">
                  <Image
                    src={generatePfp}
                    alt="generate pfp"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="font-bold px-2">3. Earn Facecoin</p>
                <div className="w-[100px] h-[100px] bg-white pointer-events-none flex flex-col items-center justify-center gap-2">
                  <p className="text-3xl">🪂</p>
                  <p className="font-bold">$facecoin</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DrawerTrigger asChild>
                <Button className="font-bold">Take selfie*</Button>
              </DrawerTrigger>
              <p className="text-sm">* you can only upload your photo once</p>
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
            <InfoSection
              title="Wait! Get 2X more coins if you take your photo at the Facecoin booth"
              body={
                <div className="p-4 flex flex-col gap-2">
                  {/* <p className="text-sm">
                    Show your FaceCoin ID to the FaceCoin terminal at the Metal
                    booth
                  </p> */}
                  {/* directions link */}
                  <div className="text-center space-y-2">
                    <h3>Your FaceCoin ID is:</h3>
                    <p className="text-2xl font-bold">{facecoinId}</p>
                  </div>
                  {/* <p className="text-sm font-semibold">
                    Warning! If you upload your photo in the app, you won&apos;t
                    be able to get the 2X bonus at the terminal.
                  </p> */}
                </div>
              }
            />
            <div />
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
                  error?: string;
                  message: string;
                  updatedUser: User;
                },
              }))
              .then(async (res) => {
                if (res.body.message !== "OK")
                  throw new Error(res.body.error || res.body.message);

                await queryClient.refetchQueries({
                  queryKey: userQueryId(),
                });
                router.replace(`/onboard/${user.id}/success`);
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

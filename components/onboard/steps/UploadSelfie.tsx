"use client";

import { InfoSection } from "@/components/info-section";
import { Profile } from "@/components/profile";
import { Button } from "@/components/shadcn/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/shadcn/drawer";
import { Skeleton } from "@/components/shadcn/skeleton";
import { userQueryId, useUserByPrivyId } from "@/lib/queries/user";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUser } from "@privy-io/react-auth";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraType } from "react-camera-pro";

const SelfieSnap = ({ onSnap }: { onSnap: (photo: string) => void }) => {
  const camera = useRef<CameraType>(null);
  const [cameraLoading, setCameraLoading] = useState(true);

  return (
    <DrawerContent className="h-[calc(100%_-_44px)] rounded-none">
      <VisuallyHidden>
        <DrawerDescription>selfie</DrawerDescription>
      </VisuallyHidden>
      <DrawerClose asChild>
        <button className="absolute top-2 left-2 z-10 ">
          <X />
        </button>
      </DrawerClose>
      <VisuallyHidden>
        <DrawerTitle>Selfie</DrawerTitle>
      </VisuallyHidden>
      <div className="h-full w-full flex px-[40.5px] py-[26px] justify-between flex-col">
        <div className="absolute top-0 left-0 w-full h-full animate-pulse bg-primary/30" />
        <div className="flex justify-between w-full">
          <div className="h-[14.5px] w-[14.5px] border-t border-l border-t-white border-l-white z-10" />
          <div className="h-[14.5px] w-[14.5px] border-t border-r border-t-white border-r-white z-10" />
        </div>
        <Camera
          videoReadyCallback={() => setCameraLoading(false)}
          aspectRatio={"cover"}
          ref={camera}
          errorMessages={{
            noCameraAccessible:
              "No camera device accessible. Please connect your camera or try a different browser.",
            permissionDenied:
              "Permission denied. Please refresh and give camera permission.",
            switchCamera:
              "It is not possible to switch camera to different one because there is only one video device accessible.",
            canvas: "Canvas is not supported.",
          }}
        />
        <div className="flex justify-between w-full">
          <div className="h-[14.5px] w-[14.5px] border-b border-l border-b-white border-l-white z-10" />
          <div className="h-[14.5px] w-[14.5px] border-b border-r border-b-white border-r-white z-10" />
        </div>
      </div>
      <div className="flex justify-center items-center h-1/5 w-screen z-10">
        <DrawerClose asChild>
          <button
            disabled={cameraLoading}
            className="bg-white w-[20%] max-w-[100px] aspect-square rounded-full p-1"
            onClick={() => {
              const photo = camera.current!.takePhoto();
              if (photo) onSnap(photo as string);
            }}
          >
            <div
              className={cn(
                "w-full h-full rounded-full bg-white border border-black",
                cameraLoading && "bg-primary/10 border-black/10"
              )}
            />
          </button>
        </DrawerClose>
      </div>
    </DrawerContent>
  );
};

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
                    {JSON.stringify(processedImageState.error)}
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

        <SelfieSnap
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
                } else throw new Error(res.body.message);
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

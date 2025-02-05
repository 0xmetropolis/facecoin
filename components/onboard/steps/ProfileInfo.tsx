"use client";

import { uploadImageAction } from "@/actions/uploadImage";
import { InfoSection } from "@/components/info-section";
import { Profile } from "@/components/profile";
import { Button } from "@/components/shadcn/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/shadcn/drawer";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Camera, CameraType } from "react-camera-pro";

const SelfieSnap = ({ onSnap }: { onSnap: (photo: string) => void }) => {
  const camera = useRef<CameraType>(null);
  const [cameraLoading, setCameraLoading] = useState(true);

  return (
    <DrawerContent
      className="h-[calc(100%_-_44px)] rounded-none"
      aria-describedby="selfie"
    >
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
            className="bg-white w-[20%] aspect-square rounded-full p-1"
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

export function ProfileInfo({ onUpload }: { onUpload: () => void }) {
  const { user } = usePrivy();
  type ImgUrl = `https://${string}`;

  const [processedImageState, setProcessedImageState] = useState<
    | "init"
    | "processing"
    // or url
    | ImgUrl
    | { error: Error }
  >("init");
  const facecoinId = 88888;
  const twitter = user?.twitter;

  return (
    <div className="flex-1 flex flex-col items-center gap-4 justify-between">
      <Drawer>
        {processedImageState === "processing" ? (
          <div className="flex-1 flex items-center">
            <h3 className="font-semibold">
              FaceCoin is processing your face...
            </h3>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 items-center">
              <div className="flex flex-row items-center space-x-4">
                <Profile pfp="/facebook-avatar.webp" />
                <div className="text-left">
                  <h2 className=" font-semibold">
                    @{twitter?.username || "username"}
                  </h2>
                  <p className="text-sm">
                    {twitter?.followers || "3234"} followers
                  </p>
                </div>
              </div>
            </div>
            <DrawerTrigger asChild>
              <Button className="font-bold">Take picture</Button>
            </DrawerTrigger>
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

        <SelfieSnap
          onSnap={async (photo) => {
            setProcessedImageState("processing");
            await uploadImageAction(photo)
              .then(() => onUpload())
              .catch((error: Error) => {
                console.error(error);
                setProcessedImageState({ error });
              });
            // onUpload();
          }}
        />
      </Drawer>
    </div>
  );
}

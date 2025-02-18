import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Camera, CameraType } from "react-camera-pro";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../shadcn/drawer";

export const CameraDrawer = ({
  onSnap,
}: {
  onSnap: (photo: string) => void;
}) => {
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

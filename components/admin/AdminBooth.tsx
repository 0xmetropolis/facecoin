"use client";

import { Button } from "@/components/shadcn/button";
import { Drawer, DrawerTrigger } from "@/components/shadcn/drawer";
import { Input } from "@/components/shadcn/input";
import Image from "next/image";
import { useState } from "react";
import { CameraDrawer } from "../base/camera-drawer";
import { User } from "@/lib/types";

export function AdminBooth() {
  const [facecoinId, setFacecoinId] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isComplete = !!user && !!user.pfp && !isProcessing;

  //
  //// HANDLERS
  const handleIdChange = (value: string) => {
    // Only allow numbers and limit to 5 digits
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    setFacecoinId(cleaned);
    setError("");
  };

  const handlePhotoCapture = async (photo: string) => {
    if (facecoinId.length !== 5) {
      setError("Please enter a valid 5-digit FaceCoin ID");
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      await fetch("/api/uploadSelfie/booth", {
        method: "POST",
        body: JSON.stringify({ photo, facecoinId }),
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
            setUser(res.body.updatedUser);
          } else setError(res.body.message);
        })
        .catch((error: Error) => {
          console.error(error);
          setError(error.message);
        });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setFacecoinId("");
    setUser(null);
    setError("");
  };

  //
  //// RENDER
  return (
    <div className="flex flex-col items-center gap-6 p-4 w-2/3">
      {isComplete ? (
        <div className="flex flex-col items-center gap-2 h-full w-full">
          <div className="relative w-3/5 aspect-[3/2]">
            <Image
              src={
                user.pfp
                  ? `${user.pfp}?lastmod=${user?.updatedAt?.toISOString()}`
                  : "facebook-avatar.webp"
              }
              quality={40}
              alt="Profile Picture"
              fill
              className="object-cover"
            />
          </div>

          <div className="text-center space-y-2">
            <h2>FaceCoin terminal has given you</h2>
            <p className="text-2xl font-bold">
              {user?.tokenAllocation
                ? Number(user.tokenAllocation).toLocaleString()
                : ""}{" "}
              $facecoin
            </p>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 max-w-xs">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Input
            type="text"
            placeholder="Enter FaceCoin ID"
            disabled={isProcessing}
            value={facecoinId}
            onChange={(e) => handleIdChange(e.target.value)}
            className="text-center text-xl"
            inputMode="numeric"
          />
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                className="w-full font-bold"
                disabled={facecoinId.length !== 5 || isProcessing}
              >
                {isProcessing ? "Processing..." : "Take Photo"}
              </Button>
            </DrawerTrigger>

            <CameraDrawer onSnap={handlePhotoCapture} />
          </Drawer>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/shadcn/button";

export function CameraUpload() {
  const [isCapturing, setIsCapturing] = useState(false);

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Upload Picture</h2>
        <div className="text-sm text-muted-foreground">
          <p>@sterlord</p>
          <p>3000 followers</p>
          <p className="mt-2">Your Facecoin ID is:</p>
          <p className="font-mono">88888</p>
        </div>
      </div>

      <div className="aspect-square bg-white rounded-sm shadow-sm overflow-hidden">
        {isCapturing ? (
          <video
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsCapturing(!isCapturing)}
        >
          {isCapturing ? "Capture" : "Scan Face"}
        </Button>
      </div>
    </div>
  );
}

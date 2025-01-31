"use client";

import { Button } from "@/components/shadcn/button";
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import Image from "next/image";

export function SelfieUpload({ onNext }: { onNext: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    // Here you would typically upload the image to blob storage
    // For now, we'll just simulate the upload
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Take a Selfie</h2>
        <p className="text-gray-600">Upload your picture to continue</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {preview ? (
          <div className="relative w-48 h-48">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
        >
          Take Photo
        </Button>

        {preview && (
          <Button onClick={handleUpload} className="w-full">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

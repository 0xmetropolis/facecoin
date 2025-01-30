import { CameraUpload } from "@/components/onboard/camera-upload";

export default function OnboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Sign up with Farcaster</h2>
        <p className="text-sm text-muted-foreground">
          Show this number at the Farcaster Terminal metal booth
        </p>
      </div>
      <CameraUpload />
    </div>
  );
}

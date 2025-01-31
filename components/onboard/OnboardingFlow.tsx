"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaceProcessing } from "./steps/FaceProcessing";
import { FarcasterConnect } from "./steps/FarcasterConnect";
import { ProfileInfo } from "./steps/ProfileInfo";
import { SelfieUpload } from "./steps/SelfieUpload";

const STEPS = ["connect", "profile", "selfie", "processing"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("connect");
  const { ready } = usePrivy();
  const router = useRouter();

  const handleNext = (step: Step) => {
    if (step === "processing") {
      // Simulate processing time before redirect
      setTimeout(() => {
        router.push("/onboard/success");
      }, 3000);
      return;
    }
    const currentIndex = STEPS.indexOf(currentStep);
    setCurrentStep(STEPS[currentIndex + 1]);
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        {currentStep === "connect" && (
          <FarcasterConnect onNext={() => handleNext("connect")} />
        )}
        {currentStep === "profile" && (
          <ProfileInfo onNext={() => handleNext("profile")} />
        )}
        {currentStep === "selfie" && (
          <SelfieUpload onNext={() => handleNext("selfie")} />
        )}
        {currentStep === "processing" && <FaceProcessing />}
      </div>
    </div>
  );
}

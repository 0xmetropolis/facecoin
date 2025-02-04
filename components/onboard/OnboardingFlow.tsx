"use client";

import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaceProcessing } from "./steps/FaceProcessing";
import { FarcasterConnect } from "./steps/FarcasterConnect";
import { ProfileInfo } from "./steps/ProfileInfo";
import { SelfieUpload } from "./steps/SelfieUpload";
import { Button } from "../shadcn/button";

const STEPS = ["init", "connect", "profile", "selfie", "processing"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const { ready, user } = usePrivy();
  const router = useRouter();

  const userIsLoggedIn = ready && user && (user.twitter || user.farcaster);

  useLogin({
    onComplete: (data) => {
      console.log("from hook", data);
    },
    onError: (error) => {
      console.error("from hook", error);
    },
  });

  const { logout } = useLogout();

  useEffect(() => {
    if (!userIsLoggedIn && ready) setCurrentStep("connect");
    if (userIsLoggedIn && ready) setCurrentStep("profile");
  }, [userIsLoggedIn, ready]);

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
    <div className="flex flex-col justify-center items-center flex-1">
      {currentStep === "connect" && <FarcasterConnect />}
      {currentStep === "profile" && (
        <ProfileInfo onNext={() => handleNext("profile")} />
      )}
      {currentStep === "selfie" && (
        <SelfieUpload onNext={() => handleNext("selfie")} />
      )}
      {currentStep === "processing" && <FaceProcessing />}
      <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
      {userIsLoggedIn ? <Button onClick={logout}>Logout</Button> : null}
    </div>
  );
}

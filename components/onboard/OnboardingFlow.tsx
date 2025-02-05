"use client";

import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { Suspense, useEffect, useState } from "react";
import { Button } from "../shadcn/button";
import { FarcasterConnect } from "./steps/FarcasterConnect";
import { ProfileInfo } from "./steps/ProfileInfo";
import { Review } from "./steps/Review";

const STEPS = ["init", "connect", "profile", "review"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const { ready, user } = usePrivy();

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

  const handleNext = (step?: Step) => {
    const currentIndex = STEPS.indexOf(currentStep);
    setCurrentStep(step ?? STEPS[currentIndex + 1]);
  };

  if (!ready) return null;

  return (
    <div className="flex flex-col justify-center items-center flex-1">
      {currentStep === "connect" && <FarcasterConnect />}
      {currentStep === "profile" && (
        <ProfileInfo onUpload={() => handleNext("profile")} />
      )}
      {currentStep === "review" && (
        <Suspense fallback="loading...">
          <Review />
        </Suspense>
      )}
      {/* <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre> */}
      {userIsLoggedIn ? <Button onClick={logout}>Logout</Button> : null}
    </div>
  );
}

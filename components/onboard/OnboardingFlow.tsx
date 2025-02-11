"use client";

import { updateUserFromPrivyAction } from "@/actions";
import {
  useLogin,
  useLoginWithOAuth,
  useLogout,
  usePrivy,
} from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Button } from "../shadcn/button";
import { ConnectSocials } from "./steps/ConnectSocial";
import { UploadSelfie } from "./steps/UploadSelfie";
import { useUserByPrivyId } from "@/lib/queries/user";
import { LoadingIcon } from "../loading-icon";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STEPS = ["init", "connect", "selfie", "review"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow() {
  //
  //// STATE
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const [error, setError] = useState<string | null>(null);

  //
  //// PRIVY HOOKS + FUNCTIONS
  const { ready, user: privyUser } = usePrivy();
  const { logout } = useLogout();
  const { initOAuth, loading: loadingOAuth } = useLoginWithOAuth({
    onComplete: updateUserFromPrivyAction,
    onError: (error) => setError(error.split("_").join(" ")),
  });
  const { login } = useLogin({
    onComplete: updateUserFromPrivyAction,
    onError: (error) => setError(error.split("_").join(" ")),
  });

  //
  //// QUERIES
  const { data: user, isLoading: userIsLoading } = useUserByPrivyId({
    id: privyUser?.id,
  });

  //
  //// HANDLERS
  const initFC = () => {
    login({ loginMethods: ["farcaster"], disableSignup: false });
  };

  const initTwitter = () => {
    initOAuth({ provider: "twitter", disableSignup: false });
  };

  //
  //// DERIVED VALUES
  const userIsLoggedIn = user?.socialPlatform;
  const isLoading = loadingOAuth || userIsLoading;

  //
  //// EFFECTS
  useEffect(() => {
    if (!userIsLoggedIn && ready) setCurrentStep("connect");
    if (userIsLoggedIn && ready) setCurrentStep("selfie");
  }, [userIsLoggedIn, ready]);

  if (!ready || currentStep === "init" || isLoading)
    return (
      <div className="flex flex-col justify-center items-center flex-1">
        <LoadingIcon />
      </div>
    );

  return (
    <div className="flex flex-col justify-center items-center flex-1">
      {error && <div className="text-red-500 capitalize">{error}</div>}
      {currentStep === "connect" && (
        <ConnectSocials
          initFC={initFC}
          initTwitter={initTwitter}
          isLoading={isLoading}
        />
      )}
      {currentStep === "selfie" && <UploadSelfie />}

      {/* <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre> */}
      {userIsLoggedIn ? <Button onClick={logout}>Logout</Button> : null}
    </div>
  );
}

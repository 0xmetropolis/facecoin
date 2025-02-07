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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STEPS = ["init", "connect", "selfie", "review"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingFlow() {
  //
  //// PRIVY HOOKS + FUNCTIONS
  const { ready, user } = usePrivy();
  const { logout } = useLogout();
  const { initOAuth, loading: loadingOAuth } = useLoginWithOAuth({
    onComplete: updateUserFromPrivyAction,
    onError: (error) => setError(error.split("_").join(" ")),
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const { login } = useLogin({
    onComplete: updateUserFromPrivyAction,
    onError: (error) => setError(error.split("_").join(" ")),
  });

  const isLoading = loginLoading || loadingOAuth;

  const initFC = () => {
    setLoginLoading(true);
    login({ loginMethods: ["farcaster"], disableSignup: true, })
  };

  const initTwitter = () =>
    initOAuth({ provider: "twitter", disableSignup: true });

  //
  //// STATE
  const [currentStep, setCurrentStep] = useState<Step>("init");
  const [error, setError] = useState<string | null>(null);

  //
  //// DERIVED VALUES
  const userIsLoggedIn = ready && user && (user.twitter || user.farcaster);

  //
  //// EFFECTS
  useEffect(() => {
    if (!userIsLoggedIn && ready) setCurrentStep("connect");
    if (userIsLoggedIn && ready) setCurrentStep("selfie");
  }, [userIsLoggedIn, ready]);

  if (!ready) return null;

  return (
    <div className="flex flex-col justify-center items-center flex-1">
      {error && <div className="text-red-500 capitalize">{error}</div>}
      {currentStep === "connect" && (
        <ConnectSocials initFC={initFC} initTwitter={initTwitter} isLoading={isLoading} />
      )}
      {currentStep === "selfie" && <UploadSelfie />}

      {/* <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre> */}
      {userIsLoggedIn ? <Button onClick={logout}>Logout</Button> : null}
    </div>
  );
}

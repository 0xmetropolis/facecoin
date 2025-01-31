"use client";

import { Button } from "@/components/shadcn/button";
import { useLogin } from "@privy-io/react-auth";

export function FarcasterConnect({ onNext }: { onNext: () => void }) {
  const { login } = useLogin({
    onComplete: ({
      user,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
      loginAccount,
    }) => {
      console.log(
        user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
        loginAccount
      );
      onNext();
      // Any logic you'd like to execute if the user is/becomes authenticated while this
      // component is mounted
    },
    onError: (error) => {
      console.log(error);
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  });

  const handleConnect = () => login();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">Connect Farcaster</h2>
      <p className="text-gray-600 mb-8">Sign up with Farcaster to continue</p>
      <Button onClick={handleConnect} className="w-full">
        Connect Farcaster Account
      </Button>
    </div>
  );
}

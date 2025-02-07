"use client";

import { colors } from "@/lib/colors";
import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { base } from "viem/chains";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProviderBase
      appId={
        process.env["NEXT_PUBLIC_PRIVY_APP_ID"] ||
        (() => {
          throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
        })()
      }
      config={{
        appearance: {
          theme: "light",
          accentColor: colors.primary.DEFAULT,
          logo: "/facecoin.png",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: base,
        supportedChains: [base],
        loginMethods: ["farcaster", "twitter"],
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}

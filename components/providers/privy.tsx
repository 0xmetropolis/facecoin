"use client";

import { colors } from "@/lib/colors";
import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProviderBase
      appId={
        process.env.NEXT_PUBLIC_PRIVY_APP_ID ||
        (() => {
          throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
        })()
      }
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: colors.primary.DEFAULT,
          logo: "/facecoin.png",
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}

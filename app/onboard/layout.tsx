"use client";

import Providers from "@/components/providers/providers";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <Providers>{children}</Providers>;
}

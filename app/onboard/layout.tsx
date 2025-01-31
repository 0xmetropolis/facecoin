import PrivyProvider from "@/components/providers/privy";

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivyProvider>{children}</PrivyProvider>;
}

"use client";
import { useFacecoinBalance } from "@/lib/queries/user";
import { User } from "@/lib/types";
import { Skeleton } from "../shadcn/skeleton";

export const BalanceInfo = ({ user }: { user?: User }) => {
  const { data: balanceInfo, isLoading } = useFacecoinBalance({
    user,
  });

  if (isLoading) return <Skeleton className="w-24 h-5 inline-flex m-0.5" />;
  if (!balanceInfo) return null;

  return (
    <p className="text-black whitespace-break-spaces text-center">
      {`${Number(balanceInfo.balance).toLocaleString()} $facecoin`}
    </p>
  );
};

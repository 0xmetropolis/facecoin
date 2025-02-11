import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { formatEther } from "viem";
import { Skeleton } from "../shadcn/skeleton";

export const Avatar = ({ user }: { user?: User }) => {
  const isLoading = !user;

  return (
    <div className="flex flex-col gap-2 w-32">
      <div className="relative aspect-square">
        <Image
          className={cn(
            "rounded-full aspect-square object-cover",
            isLoading && "animate-pulse opacity-50"
          )}
          alt={user?.socialHandle || "loading user..."}
          src={
            !isLoading && user?.pfp
              ? `${user.pfp}?lastmod=${new Date().toISOString()}`
              : "/facebook-avatar.webp"
          }
          fill
        />
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center text-black font-semibold">
          <p>@</p>
          {isLoading ? (
            <Skeleton className="w-14 h-4 inline-flex ml-1" />
          ) : (
            <p>{user?.socialHandle}</p>
          )}
        </div>
        <div
          className={cn(
            "flex flex-col items-center gap-1",
            isLoading && "hidden"
          )}
        >
          <p className="text-black whitespace-break-spaces text-center">
            {user?.tokenAllocation_wei
              ? formatEther(BigInt(user.tokenAllocation_wei))
              : "0"}{" "}
            $facecoin
          </p>
          <p className="text-black">($3000)</p>
        </div>
      </div>
    </div>
  );
};

export const LoadingAvatar = () => <Avatar />;

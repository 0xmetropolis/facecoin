import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Skeleton } from "../shadcn/skeleton";

export const Avatar = ({ user }: { user?: User }) => {
  const isLoading = !user;

  return (
    <div className="flex flex-col gap-2 w-32">
      <div className="relative aspect-square">
        <Image
          className={cn("rounded-full aspect-square object-cover")}
          alt={user?.socialHandle || "loading user..."}
          src={
            !isLoading && user?.pfp
              ? `${user.pfp}?lastmod=${new Date().toISOString()}`
              : "/facebook-avatar.webp"
          }
          priority
          fill
        />
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center text-black font-semibold justify-center">
          <p>@</p>
          {isLoading ? (
            <Skeleton className="w-14 h-5 m-0.5 inline-flex" />
          ) : (
            <p>{user?.socialHandle}</p>
          )}
        </div>
        <div className={cn("flex flex-col items-center gap-1")}>
          {isLoading ? (
            <Skeleton className="w-24 h-5 inline-flex m-0.5" />
          ) : user?.tokenAllocation ? (
            <p className="text-black whitespace-break-spaces text-center">
              {`${Number(user.tokenAllocation).toLocaleString()} $facecoin`}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const LoadingAvatar = () => <Avatar />;

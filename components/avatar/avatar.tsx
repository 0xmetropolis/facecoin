import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "../shadcn/skeleton";
import { BalanceInfo } from "./balance-info";

export const Avatar = ({
  user,
  containerClasses,
  iconOnly = false,
}: {
  user?: User;
  containerClasses?: HTMLDivElement["className"];
  iconOnly?: boolean;
}) => {
  const isLoading = !user;

  return (
    <Link href={`/${user?.socialHandle}`} className="hover:opacity-80">
      <div className={cn("flex flex-col gap-2 w-32", containerClasses)}>
        <div className="relative aspect-square">
          <Image
            className={cn("aspect-square object-cover")}
            alt={user?.socialHandle || "loading user..."}
            src={
              !isLoading && user?.pfp
                ? `${user.pfp}?lastmod=${user?.updatedAt?.toISOString?.()}`
                : "/facebook-avatar.webp"
            }
            priority
            fill
          />
        </div>
        {!iconOnly && (
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center text-theme-primary font-semibold justify-center">
              <p>@</p>
              {isLoading ? (
                <Skeleton className="w-14 h-5 m-0.5 inline-flex" />
              ) : (
                <p>{user?.socialHandle}</p>
              )}
            </div>
            <div className={cn("flex flex-col items-center gap-1")}>
              <BalanceInfo user={user} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export const LoadingAvatar = () => <Avatar />;

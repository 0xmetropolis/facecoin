import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "../shadcn/skeleton";
import { BalanceInfo } from "./balance-info";
import { getSocialLink } from "@/lib/socials";
import { ExternalLinkIcon } from "lucide-react";

export const Avatar = ({
  user,
  containerClasses,
  iconOnly = false,
  showLink = false,
}: {
  user?: User;
  containerClasses?: HTMLDivElement["className"];
  iconOnly?: boolean;
  showLink?: boolean;
}) => {
  const isLoading = !user;

  return (
    <div className={cn("flex flex-col gap-2 w-32", containerClasses)}>
      <Link href={`/${user?.socialHandle}`} className="hover:opacity-80">
        <div className="relative aspect-square">
          <Image
            className={cn("aspect-square object-cover")}
            alt={user?.socialHandle || "loading user..."}
            src={
              !isLoading && user?.pfp
                ? `${user.pfp}?lastmod=${user?.updatedAt}`
                : "/facebook-avatar.webp"
            }
            priority
            fill
          />
        </div>
      </Link>
      {!iconOnly && (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center text-theme-primary font-semibold justify-center">
            <p>@</p>
            {isLoading ? (
              <Skeleton className="w-14 h-5 m-0.5 inline-flex" />
            ) : showLink ? (
              <Link
                href={getSocialLink(user.socialPlatform, user.socialHandle)}
                target="_blank"
              >
                <p>
                  {user?.socialHandle}{" "}
                  {showLink && (
                    <span>
                      <ExternalLinkIcon className="h-4 w-4 inline-block -mt-0.5" />
                    </span>
                  )}
                </p>
              </Link>
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
  );
};

export const LoadingAvatar = () => <Avatar />;

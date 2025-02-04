import { User } from "@prisma/client";
import Image from "next/image";

export const Avatar = ({ user }: { user: Partial<User> }) => {
  // const { data: balance, isLoading: isBalanceLoading } = useFacecoinBalance({
  //   userId: user.id,
  // });

  return (
    <div className="flex flex-col gap-2 w-32">
      <div className="relative aspect-square">
        <Image
          className="rounded-full aspect-square object-cover"
          alt={user?.socialHandle || "loading user..."}
          src={user?.pfp || "/facebook-avatar.webp"}
          blurDataURL="/facebook-avatar.webp"
          placeholder="blur"
          fill
        />
      </div>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center text-black font-semibold">
          <p>@</p>
          <p>{user?.socialHandle}</p>
        </div>
        <p className="text-black whitespace-break-spaces text-center">
          {"1,000"} $facecoin
        </p>
        <p className="text-black">($3000)</p>
      </div>
    </div>
  );
};

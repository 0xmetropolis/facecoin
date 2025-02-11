import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import { Suspense } from "react";
import { Avatar, LoadingAvatar } from "./avatar/avatar";

const LoadingUserGrid = () =>
  Array.from({ length: 6 }).map((_, index) => <LoadingAvatar key={index} />);

const ResolvedUserGrid = async () => {
  const users = await prisma.user.findMany({
    skip: 0,
    take: 20,
    orderBy: { followerCount: "desc" },
  });

  return users.map((user: User) => <Avatar key={user.id} user={user} />);
};

export function UserGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[600px] mx-auto justify-items-center">
      <Suspense fallback={<LoadingUserGrid />}>
        <ResolvedUserGrid />
      </Suspense>
    </div>
  );
}

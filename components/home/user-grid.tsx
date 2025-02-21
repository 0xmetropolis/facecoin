import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { Avatar, LoadingAvatar } from "../avatar/avatar";

const LoadingUserGrid = () =>
  Array.from({ length: 4 }).map((_, index) => <LoadingAvatar key={index} />);

const SuspensedUserGrid = async () => {
  const users = await prisma.user.findMany({
    skip: 0,
    take: 20,
    orderBy: { followerCount: "desc" },
  });

  return users.map((user) => <Avatar key={user.id} user={user} />);
};

export function UserGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[600px] mx-auto justify-items-center">
      <Suspense fallback={<LoadingUserGrid />}>
        <SuspensedUserGrid />
      </Suspense>
    </div>
  );
}

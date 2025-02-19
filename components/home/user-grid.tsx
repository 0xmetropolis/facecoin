import { Suspense } from "react";
import { LoadingAvatar } from "../avatar/avatar";
import { ResolvedUserGrid } from "./resolved-user-grid";
import prisma from "@/lib/prisma";

const LoadingUserGrid = () =>
  Array.from({ length: 3 }).map((_, index) => <LoadingAvatar key={index} />);

const SuspensedUserGrid = async () => {
  const users = await prisma.user.findMany({
    skip: 0,
    take: 20,
    orderBy: { followerCount: "desc" },
  });

  return <ResolvedUserGrid users={users} />;
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

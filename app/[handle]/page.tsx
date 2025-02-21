import { Avatar } from "@/components/avatar/avatar";
import { LargeCountdownTimer } from "@/components/base/countdown-timer";
import { PokesSection } from "@/components/profile/pokes-section";
import { ClientSideProfileActions } from "@/components/profile/profile-actions";
import prisma from "@/lib/prisma";
import { TTL } from "@/lib/TTL-timestamp";
import { getUserFromRequest } from "@/lib/utils/user";
import { notFound } from "next/navigation";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ handle: string }>;
}) => {
  const { handle } = await params;

  return {
    title: `@${handle} | facecoin.world`,
    description: `Facecoin - Powered by Metal`,
  };
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  // Remove @ if present in handle
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

  const [user, currentUser] = await Promise.all([
    prisma.user.findUnique({
      where: {
        socialHandle: cleanHandle,
      },
    }),
    getUserFromRequest(),
  ]);

  if (!user) notFound();

  return (
    <>
      <div className="flex flex-col flex-1 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center gap-8 h-2/3 pt-8 pb-2">
          <LargeCountdownTimer endTime={TTL} />
          <Avatar user={user} containerClasses="w-56" />
        </div>
        <ClientSideProfileActions
          isUser={currentUser?.id === user.id}
          currentUser={currentUser}
        />
        <PokesSection user={user} viewingUser={currentUser} />
      </div>
    </>
  );
}

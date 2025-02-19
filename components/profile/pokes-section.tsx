import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PokeButton } from "./poke-button";

const PokesList = async ({
  user,
  viewingUser,
}: {
  user: User;
  viewingUser: User | null;
}) => {
  // Get pokes with latest events and counts
  const pokesResult = await prisma.poke.findMany({
    where: {
      OR: [{ victimId: user.id }, { perpetratorId: user.id }],
    },
    include: {
      perpetrator: true,
      victim: true,
      events: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Sort by follower count
  const pokes = pokesResult.sort(
    (a, b) =>
      (b.perpetrator.followerCount ?? 0) - (a.perpetrator.followerCount ?? 0)
  );

  return (
    <div className="flex flex-col gap-2">
      {pokes.map((poke) => {
        const viewingUserIsVictim = viewingUser?.id === poke.victimId;
        const viewingUserIsPerpetrator = viewingUser?.id === poke.perpetratorId;
        const canPokeBack =
          viewingUser &&
          !viewingUserIsPerpetrator &&
          viewingUser.id !== poke.victimId;

        // Determine which user to show (the other person in the interaction)
        const otherUser =
          user.id === poke.perpetratorId ? poke.victim : poke.perpetrator;
        const lastEvent = poke.events[0];
        const isLatestPerpetrator = lastEvent?.perpetratorId === otherUser.id;

        return (
          <div
            key={poke.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 gap-4"
          >
            <Link href={`/${otherUser.socialHandle}`}>
              <div className="flex items-center gap-2 align-top">
                <Image
                  src={`${
                    otherUser.pfp
                  }?lastModified=${otherUser.updatedAt.toISOString()}`}
                  alt={otherUser.socialHandle}
                  width={40}
                  height={40}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{otherUser.socialHandle}</span>
                  <div className="text-sm text-gray-500">
                    {isLatestPerpetrator ? (
                      <>
                        {viewingUserIsVictim
                          ? "Poked you"
                          : `Poked ${user.socialHandle}`}
                      </>
                    ) : (
                      <>
                        {viewingUserIsPerpetrator
                          ? "You poked them"
                          : `${user.socialHandle} poked them`}
                      </>
                    )}{" "}
                    {poke.count} {poke.count === 1 ? "time" : "times"}
                  </div>
                </div>
              </div>
            </Link>

            {canPokeBack && (
              <PokeButton victim={otherUser.id}>👉 Poke back</PokeButton>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const PokesSection = ({
  user,
  viewingUser,
}: {
  user: User;
  viewingUser: User | null;
}) => {
  const isLookingAtSelf = user.id === viewingUser?.id;
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="w-full h-[1px] bg-gray-200" />
      {!isLookingAtSelf && <PokeButton victim={user.id}>Poke</PokeButton>}
      <Suspense>
        <PokesList user={user} viewingUser={viewingUser} />
      </Suspense>
    </div>
  );
};

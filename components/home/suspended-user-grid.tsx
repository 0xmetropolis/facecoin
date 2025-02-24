import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import { getUserFromRequest } from "@/lib/utils/user";
import { Suspense } from "react";
import { Avatar } from "../avatar/avatar";
import { PokeButton } from "../profile/poke-button";

async function SuspendedPokeButton({
  user,
  viewingUser,
}: {
  user: User;
  viewingUser: User;
}) {
  const [theyPokedMeEvent, iPokedThemEvent] = await Promise.all([
    prisma.pokeEvent.findFirst({
      where: {
        perpetratorId: user.id,
        victimId: viewingUser.id,
      },
    }),
    prisma.pokeEvent.findFirst({
      where: {
        perpetratorId: viewingUser.id,
        victimId: user.id,
      },
    }),
  ]);

  const weHaveAPokeGame = iPokedThemEvent || theyPokedMeEvent;
  const IpokedThemLast =
    weHaveAPokeGame &&
    (iPokedThemEvent?.createdAt.getTime() || 0) >
      (theyPokedMeEvent?.createdAt.getTime() || 0);

  const theyPokedMeLast =
    weHaveAPokeGame &&
    (theyPokedMeEvent?.createdAt.getTime() || 0) >
      (iPokedThemEvent?.createdAt.getTime() || 0);

  if (!weHaveAPokeGame)
    return <PokeButton victim={user.id}>👉 Poke</PokeButton>;

  if (theyPokedMeLast) return <PokeButton victim={user.id}>👈 Poke</PokeButton>;

  if (IpokedThemLast)
    return <p>poked ✅</p>;

  return null;
}

export async function SuspendedUserGrid({
  searchTerm,
}: {
  searchTerm?: string;
}) {
  const [users, viewingUser] = await Promise.all([
    prisma.user.findMany({
      where: searchTerm
        ? {
            OR: [
              { socialHandle: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : undefined,
      skip: 0,
      take: 20,
      orderBy: [{ followerCount: "asc" }],
    }),
    getUserFromRequest(),
  ]);

  return users.map((user) => {
    return (
      <div key={user.id} className="flex flex-col gap-2">
        <Avatar key={user.id} user={user} />
        {user.id && viewingUser && (
          <Suspense fallback={<p>loading...</p>}>
            <SuspendedPokeButton user={user} viewingUser={viewingUser} />
          </Suspense>
        )}
      </div>
    );
  });
}

import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Poke } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PokeButton } from "./poke-button";
import { Button } from "../shadcn/button";

//
//// QUERIES
async function queryViewingUserPokeBetweens(
  viewingUser: User | null
): Promise<[number, number][]> {
  if (!viewingUser) return [];
  return prisma.poke
    .findMany({
      where: {
        OR: [{ victimId: viewingUser.id }, { perpetratorId: viewingUser.id }],
      },
      select: {
        between: true,
      },
    })
    .then((betweens) =>
      betweens.map<[number, number]>(
        ({ between }) =>
          between.split("<>").map((strId) => +strId) as [number, number]
      )
    );
}

async function queryUserPokes(user: User) {
  return await prisma.poke
    .findMany({
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
    })
    // sort by follower count
    .then((pokes) =>
      pokes.sort(
        (a, b) =>
          (b.perpetrator.followerCount ? b.perpetrator.followerCount : 0) -
          (a.perpetrator.followerCount ? a.perpetrator.followerCount : 0)
      )
    );
}

// user stories
// 1. i have never poked you before
//  should see poke button
//  should see "you poked them"
// 2.
const PokesList = async ({
  user,
  viewingUser,
}: {
  user: User;
  viewingUser: User | null;
}) => {
  const [viewingUsersPokeBetweens, pokes] = await Promise.all([
    queryViewingUserPokeBetweens(viewingUser),
    queryUserPokes(user),
  ]);

  // const pokes = [...pokes_, ...pokes_, ...pokes_];

  const isMutual = (p: Poke): boolean => {
    const [id_a, id_b] = p.between.split("<>").map(Number);
    const isAMutual = viewingUsersPokeBetweens.some(
      ([pokeIdA, pokeIdB]) =>
        id_a === pokeIdA ||
        id_a === pokeIdB ||
        id_b === pokeIdA ||
        id_b === pokeIdB
    );
    // if (i > 3) return false;
    return isAMutual;
  };

  //
  //// DERIVED VALUES
  const userIsLoggedIn = !!viewingUser;
  const mutualOmittedCount = pokes.length - pokes.filter(isMutual).length;
  const showCover = !userIsLoggedIn || mutualOmittedCount;

  return (
    <>
      <h3 className="font-bold text-2xl">Pokes</h3>
      <div className="flex flex-col gap-2 relative">
        <PokeButton victim={user.id}>👉 Poke</PokeButton>
        <div className={`flex flex-col gap-2`}>
          {pokes.map((pokeGame, i) => {
            //
            //// CARD TYPE
            const type: "reveal" | "login-gate" | "non-mutual" =
              !userIsLoggedIn && i > 0
                ? "login-gate"
                : !isMutual(pokeGame, i) && i > 4
                ? "non-mutual"
                : "reveal";

            //
            //// RECIPIENT
            const [lastPoke] = pokeGame.events;
            const otherUser =
              pokeGame.perpetratorId === user.id
                ? pokeGame.victim
                : pokeGame.perpetrator;
            const canPokeBack =
              userIsLoggedIn && viewingUser.id === lastPoke.victimId;

            //
            //// POKE SENTENCE
            const [sendingNoun, receivingNoun] = (() => {
              if (viewingUser?.id === lastPoke.perpetratorId)
                return ["You", "them"];
              if (viewingUser?.id === lastPoke.victimId) return ["They", "you"];

              return ["", user.socialHandle];
            })();
            const verb = "poked";
            const pokeSentence_arr = [
              sendingNoun,
              verb,
              receivingNoun,
              ...(pokeGame.count > 1 ? [`${pokeGame.count} times`] : []),
            ];
            const pokeSentence = pokeSentence_arr.join(" ");

            const imgSrc =
              type === "reveal"
                ? `${
                    otherUser.pfp
                  }?lastModified=${otherUser.updatedAt.toISOString()}`
                : "/facebook-avatar.webp";

            // truncate the list for unauthed users
            if (i > 2 && !userIsLoggedIn) return null;
            return (
              <div
                key={pokeGame.id}
                className={cn(
                  "flex items-center justify-between p-2 gap-4 w-full"
                  // type !== "reveal" && "blur-sm"
                )}
              >
                <Link href={`/${otherUser.socialHandle}`}>
                  <div className="flex items-center gap-2 align-top">
                    <div className="relative w-10 h-10">
                      <Image
                        src={imgSrc}
                        alt={otherUser.socialHandle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {type !== "reveal" ? "???" : otherUser.socialHandle}
                      </span>
                      <div className="text-sm text-gray-500">
                        {pokeSentence}
                      </div>
                    </div>
                  </div>
                </Link>

                {canPokeBack && (
                  <PokeButton victim={user.id}>Poke back 👈</PokeButton>
                )}
              </div>
            );
          })}
        </div>

        {showCover && (
          <div
            className={`absolute inset-0 flex pt-20 justify-center top-[${
              mutualOmittedCount * 60
            }px] backdrop-blur-[3px] h-full w-full`}
          >
            {mutualOmittedCount > 0 ? (
              <div className="text-black text-lg font-bold pt-2">
                👀 non-mutual pokes are hidden
              </div>
            ) : (
              <Link href="/onboard">
                <Button>Login to view pokes</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export const PokesSection = ({
  user,
  viewingUser,
}: {
  user: User;
  viewingUser: User | null;
}) => {
  return (
    <div className="flex flex-col gap-2 items-center p-2 w-full flex-1">
      <Suspense>
        <PokesList user={user} viewingUser={viewingUser} />
      </Suspense>
    </div>
  );
};

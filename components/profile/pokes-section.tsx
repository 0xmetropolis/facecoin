import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Poke } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PokeButton } from "./poke-button";
import { Button } from "../shadcn/button";
import { getRelativeTime } from "@/lib/time";

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

async function queryUsersPokes(user: User) {
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
    .then(
      (pokes) =>
        pokes.sort(
          (a, b) =>
            (b.perpetrator.followerCount ? b.perpetrator.followerCount : 0) -
            (a.perpetrator.followerCount ? a.perpetrator.followerCount : 0)
        )
      // .filter((pokeGame) => {
      //   if (!viewingUser) return true;

      //   // filter out our game
      //   if (
      //     (viewingUser.id === pokeGame.perpetratorId &&
      //       user.id === pokeGame.victimId) ||
      //     (viewingUser.id === pokeGame.victimId &&
      //       user.id === pokeGame.perpetratorId)
      //   )
      //     return false;
      //   else return true;
      // })
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
  const [viewingUsersPokeBetweens, thisUsersPokes] = await Promise.all([
    queryViewingUserPokeBetweens(viewingUser),
    queryUsersPokes(user),
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
    return isAMutual;
  };

  //
  //// DERIVED VALUES
  const userIsLoggedIn = !!viewingUser;
  //
  /// Game between viewingUser and this user
  const ourPokeGame = thisUsersPokes.find(
    (pokeGame) =>
      viewingUser?.id === pokeGame.perpetratorId ||
      viewingUser?.id === pokeGame.victimId
  );

  const hasAnUnansweredPokeWithThisUser =
    // we have a poke game
    ourPokeGame &&
    // and we are the victim
    viewingUser?.id === ourPokeGame.events[0].victimId;

  // the list to be displayed
  const thisUsersPokesWithoutOurGame = thisUsersPokes.filter((pokeGame) => {
    if (!viewingUser) return true;
    if (
      viewingUser.id === pokeGame.perpetratorId ||
      viewingUser.id === pokeGame.victimId
    )
      return false;
    else return true;
  });

  // const userIsViewingSelf = viewingUser?.id === user.id;
  const mutualOmittedCount =
    thisUsersPokesWithoutOurGame.length -
    thisUsersPokesWithoutOurGame.filter(isMutual).length;
  const showCover = !userIsLoggedIn || mutualOmittedCount > 0;

  console.log({ thisUsersPokesWithoutOurGame });

  return (
    <>
      {userIsLoggedIn && !ourPokeGame ? (
        <PokeButton victim={user.id}>👉 Poke</PokeButton>
      ) : null}
      <div className="flex flex-col gap-2 relative p-2">
        <div className={`flex flex-col gap-2`}>
          {ourPokeGame && (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-500 flex justify-between items-start gap-2">
                <div className="flex flex-col gap-2">
                  <div>
                    {hasAnUnansweredPokeWithThisUser
                      ? `@${user.socialHandle} poked you`
                      : `You poked @${user.socialHandle}`}{" "}
                    {Math.ceil(ourPokeGame.count / 2) > 1
                      ? [`${Math.ceil(ourPokeGame.count / 2)} times in a row!`]
                      : ["once"]}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getRelativeTime(ourPokeGame.events[0].createdAt)}
                  </div>
                </div>
                {hasAnUnansweredPokeWithThisUser && (
                  <PokeButton victim={user.id}>Poke back 👈</PokeButton>
                )}
              </div>
              <div className="h-[1px] bg-gray-400" />
            </div>
          )}
          {thisUsersPokesWithoutOurGame.length > 0 && (
            <h3 className="font-bold text-2xl">Pokes</h3>
          )}
          {thisUsersPokesWithoutOurGame.map((pokeGame, i) => {
            //
            //// CARD TYPE
            const type: "reveal" | "login-gate" | "non-mutual" =
              !userIsLoggedIn && i > 0
                ? "login-gate"
                : !isMutual(pokeGame) && i > 4
                ? "non-mutual"
                : "reveal";

            //
            //// RECIPIENT
            const [lastPoke] = pokeGame.events;
            const otherUser =
              lastPoke.perpetratorId === user.id
                ? pokeGame.victim
                : pokeGame.perpetrator;

            const canPokeBack =
              userIsLoggedIn && viewingUser.id === lastPoke.victimId;

            //
            //// POKE SENTENCE
            const [sendingNoun, receivingNoun] = (() => {
              if (viewingUser?.id === lastPoke.perpetratorId)
                return [
                  "You",
                  viewingUser.id === user.id
                    ? otherUser.socialHandle
                    : user.socialHandle,
                ];
              if (viewingUser?.id === lastPoke.victimId) return ["you", "you"];

              return ["", user.socialHandle];
            })();
            const verb = "poked";
            const pokeSentence_arr = [
              sendingNoun,
              verb,
              receivingNoun,
              ...(pokeGame.count > 1 ? [`${pokeGame.count} times!`] : ["once"]),
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
                    <div className="relative w-14 h-14">
                      <Image
                        src={imgSrc}
                        alt={otherUser.socialHandle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-theme-primary hover:underline">
                        @{type !== "reveal" ? "???" : otherUser.socialHandle}
                      </span>
                      <div className="text-sm text-gray-500">
                        {pokeSentence}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getRelativeTime(lastPoke.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>

                {canPokeBack && (
                  <PokeButton victim={otherUser.id}>Poke back 👈</PokeButton>
                )}
              </div>
            );
          })}
        </div>

        {showCover && (
          <div
            className={`absolute inset-0 flex justify-center top-[${
              mutualOmittedCount === 0 ? 0 : mutualOmittedCount * 84
            }px] backdrop-blur-[3px] pt-8 h-full w-full`}
          >
            {!userIsLoggedIn ? (
              <Link href="/onboard">
                <Button>Login to view pokes</Button>
              </Link>
            ) : mutualOmittedCount > 0 ? (
              <div className="text-black text-lg font-bold pt-2">
                👀 non-mutual pokes are hidden
              </div>
            ) : null}
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

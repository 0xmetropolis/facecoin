import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Poke } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { JSX, Suspense } from "react";
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
  return await prisma.poke.findMany({
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
      updatedAt: "asc",
    },
  });
}

const UserPokesList = async ({
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

  const mutualOmittedCount =
    thisUsersPokesWithoutOurGame.length -
    thisUsersPokesWithoutOurGame.filter(isMutual).length;
  const showCover = !userIsLoggedIn || mutualOmittedCount > 0;
  const totalShownCount =
    thisUsersPokesWithoutOurGame.length - mutualOmittedCount;

  return (
    <>
      <div className="flex flex-col gap-2 relative w-full">
        <div className={`flex flex-col gap-4 items-center w-full`}>
          <h3 className="font-bold text-2xl pt-2">Pokes</h3>
          {userIsLoggedIn && !ourPokeGame ? (
            <PokeButton victim={user.id}>👉 Poke help</PokeButton>
          ) : null}
          {thisUsersPokes.length === 0 && (
            <p className="text-gray-500">no pokes yet...</p>
          )}
          {ourPokeGame && (
            <div className="flex flex-col gap-2 w-full px-4">
              <div className="text-sm text-gray-500 flex justify-between items-start gap-2">
                <div className="flex flex-col gap-2">
                  {hasAnUnansweredPokeWithThisUser
                    ? `@${user.socialHandle} poked you`
                    : `You poked @${user.socialHandle}`}{" "}
                  {Math.ceil(ourPokeGame.count / 2) > 1
                    ? [`${Math.ceil(ourPokeGame.count / 2)} times in a row!`]
                    : ["once"]}
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

          <div className="flex flex-col flex-1 relative w-full">
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
                pokeGame.perpetratorId === user.id
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
                if (viewingUser?.id === lastPoke.victimId)
                  return ["you", "you"];
                return ["", user.socialHandle];
              })();
              const verb = "poked";
              const pokeSentence_arr = [
                sendingNoun,
                verb,
                receivingNoun,
                ...(pokeGame.count > 1
                  ? [`${pokeGame.count} times!`]
                  : ["once"]),
              ];
              const pokeSentence = pokeSentence_arr.join(" ");
              const imgSrc =
                type === "reveal"
                  ? `${
                      otherUser.pfp
                    }?lastModified=${otherUser.updatedAt}`
                  : "/facebook-avatar.webp";
              // truncate the list for unauthed users
              if (i > 2 && !userIsLoggedIn) return null;
              return (
                <div
                  key={pokeGame.id}
                  className={cn(
                    "flex items-center justify-between p-2 gap-4 w-full"
                  )}
                >
                  <Link
                    href={
                      type === "reveal" ? `/${otherUser.socialHandle}` : "#"
                    }
                  >
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
            {showCover && (
              <div
                className={
                  "absolute inset-0 flex justify-center backdrop-blur-[3px] pt-8 h-full w-full"
                }
                style={{ top: `${totalShownCount * 84}px` }}
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
        </div>
      </div>
    </>
  );
};

const MyPokesList = async ({ user }: { user: User }) => {
  const pokes = await queryUsersPokes(user);
  type Item = {
    isUnread: boolean;
    canPokeBack: boolean;
    lastPokeTs: Date;
    otherFollowerCount: number;
    component: JSX.Element;
  };
  return (
    <div className="flex flex-col gap-2 relative p-2 w-full">
      <div className={`flex flex-col gap-2 w-full items-center`}>
        <h3 className="font-bold text-2xl">Pokes</h3>
        {pokes.length === 0 ? (
          <p className="text-gray-500">no pokes yet...</p>
        ) : (
          Object.entries(
            pokes
              .map((pokeGame) => {
                //
                //// RECIPIENT
                const [lastPoke] = pokeGame.events;
                const otherUser =
                  pokeGame.perpetratorId === user.id
                    ? pokeGame.victim
                    : pokeGame.perpetrator;

                const canPokeBack = user.id === lastPoke.victimId;

                //
                //// POKE SENTENCE
                const [sendingNoun, receivingNoun] = (() => {
                  if (user.id === lastPoke.perpetratorId)
                    return ["You", otherUser.socialHandle];
                  if (user.id === lastPoke.victimId)
                    return [otherUser.socialHandle, "you"];

                  return ["", ""];
                })();
                const verb = "poked";
                const pokeSentence_arr = [
                  sendingNoun,
                  verb,
                  receivingNoun,
                  ...(Math.ceil(pokeGame.count / 2) > 1
                    ? [`${Math.ceil(pokeGame.count / 2)} times!`]
                    : ["once"]),
                ];
                const pokeSentence = pokeSentence_arr.join(" ");

                const imgSrc = `${
                  otherUser.pfp
                }?lastModified=${otherUser.updatedAt}`;

                const isUnread =
                  user.lastCheckedProfile &&
                  canPokeBack &&
                  lastPoke.createdAt > user.lastCheckedProfile;

                return {
                  isUnread,
                  canPokeBack,
                  lastPokeTs: lastPoke.createdAt,
                  otherFollowerCount: otherUser.followerCount!,
                  component: (
                    <div
                      key={pokeGame.id}
                      className={cn(
                        "flex items-center justify-between p-2 gap-2 w-full relative",
                        isUnread && "bg-gray-100",
                        !canPokeBack && "opacity-70"
                      )}
                    >
                      <Link href={`/${otherUser.socialHandle}`}>
                        <div className="flex gap-2 align-top">
                          <div className="relative w-14 h-14 flex-shrink-0">
                            <Image
                              src={imgSrc}
                              alt={otherUser.socialHandle}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-theme-primary hover:underline">
                              @{otherUser.socialHandle}
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
                        <PokeButton victim={otherUser.id}>
                          Poke back 👈
                        </PokeButton>
                      )}
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 bg-theme-primary text-white w-3 h-3 rounded-full" />
                      )}
                    </div>
                  ),
                };
              })
              // sort unreads first,
              // then needsPokeBack,
              // then by follower count
              .reduce<{
                unreads: Item[];
                // needsPokeBack: Item[];
                followers: Item[];
              }>(
                (acc, curr) => {
                  if (curr.isUnread) acc.unreads.push(curr);
                  // else if (curr.canPokeBack) acc.needsPokeBack.push(curr);
                  else acc.followers.push(curr);
                  return acc;
                },
                {
                  unreads: [],
                  // needsPokeBack: [],
                  followers: [],
                }
              )
          )
            // .map((t) => {
            //   console.log(t);
            //   return t;
            // })
            .map(([key, value]) => {
              return value
                .map(({ component, lastPokeTs, otherFollowerCount }) => ({
                  component,
                  lastPokeTs,
                  otherFollowerCount,
                }))
                .sort((a, b) =>
                  key === "followers"
                    ? b.otherFollowerCount - a.otherFollowerCount
                    : b.lastPokeTs.getTime() - a.lastPokeTs.getTime()
                );
            })
            .flat()
            .map(({ component }) => component)
        )}
      </div>
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
  return (
    <div className="flex flex-col gap-2 items-center w-full flex-1 pt-2">
      <Suspense fallback={<h3 className="font-bold text-2xl pt-2">Pokes</h3>}>
        {user.id === viewingUser?.id ? (
          <MyPokesList user={user} />
        ) : (
          <UserPokesList user={user} viewingUser={viewingUser} />
        )}
      </Suspense>
    </div>
  );
};

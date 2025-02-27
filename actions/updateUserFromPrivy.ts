import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import {
  getFollowerCount,
  isFollowerCountError,
  type FollowerCountFetchError,
} from "@/lib/socials";
import { User } from "@/lib/types";
import { PrivyEvents } from "@privy-io/react-auth";
import { Address } from "viem";

//
//// TYPES

type PrivyOnCompleteParams = Parameters<
  NonNullable<PrivyEvents["login"]["onComplete"]>
>[0];

//
//// ERRORS

const InvalidSocialError = (message: string) =>
  ({
    __type: "InvalidSocialError",
    error: message,
  } as const);

export type InvalidSocialError = ReturnType<typeof InvalidSocialError>;

const MissingUserFieldsError = (message: string) =>
  ({
    __type: "MissingUserFieldsError",
    error: message,
  } as const);

export type MissingUserFieldsError = ReturnType<typeof MissingUserFieldsError>;

//
//// UTILS

function getFacecoinCode() {
  // eg: 9 users means
  return Math.random().toString().substring(2, 7);
}

//
//// ACTION

export const updateUserFromPrivy = async ({
  user: privyUser,
  // loginAccount,
  wasAlreadyAuthenticated,
  loginMethod,
}: PrivyOnCompleteParams): Promise<
  "OK" | InvalidSocialError | MissingUserFieldsError | FollowerCountFetchError
> => {
  // check if the user exists based on privy id
  const [maybeSavedUser, userCount] = await Promise.all([
    prisma.user.findFirst({
      where: {
        OR: [
          { privyId: privyUser.id },
          // { address: (privyUser.wallet?.address as Address) || zeroAddress },
        ],
      },
    }),
    prisma.user.count(),
  ]);

  if (maybeSavedUser) {
    if (loginMethod && loginMethod === maybeSavedUser.socialPlatform)
      return "OK";
    else if (wasAlreadyAuthenticated) return "OK";
  }

  const socialPlatform = (loginMethod ||
    (!!privyUser.farcaster
      ? "farcaster"
      : !!privyUser.twitter
      ? "twitter"
      : null)) as "farcaster" | "twitter" | null;

  // // check if the social is valid
  if (socialPlatform === null)
    return InvalidSocialError("Invalid social login account");

  const socialHandle =
    socialPlatform === "twitter"
      ? // or the twitter handle
        privyUser.twitter?.username
      : // use the farcaster username
        privyUser.farcaster?.username;

  // check if the social handle exists
  if (!socialHandle) return MissingUserFieldsError("Social handle is missing");

  // return OK if they've been created and they're not reauthenticating their social platform
  if (
    maybeSavedUser &&
    maybeSavedUser.socialHandle === socialHandle &&
    maybeSavedUser.socialPlatform === socialPlatform
  )
    return "OK";

  // snag their follower count from the platform of choice
  const followerCount = await getFollowerCount(
    socialPlatform,
    socialHandle,
    userCount
  );
  if (isFollowerCountError(followerCount)) return followerCount;

  const facecoinCode = getFacecoinCode();
  const userAddress = privyUser.wallet?.address
    ? privyUser.wallet?.address
    : await privy
        .createWallets({
          userId: privyUser.id,
          createEthereumWallet: true,
          numberOfEthereumWalletsToCreate: 1,
        })
        .then((u) => u.wallet!.address!);

  // user does not exist create the user
  const newUser: Omit<
    User,
    "id" | "createdAt" | "updatedAt" | "lastCheckedProfile"
  > = {
    privyId: privyUser.id,
    socialHandle,
    socialPlatform: socialPlatform,
    followerCount,
    address: userAddress as Address,
    facecoinCode,
    pfp: null,
    tokenAllocation: null,
    tokensSent: false,
  };

  // upsert the user
  await prisma.user
    .upsert({
      where: { privyId: privyUser.id },
      update: newUser,
      create: newUser,
    })
    .catch(async () => {
      console.log("upsert failed, trying social handle upsert");
      await prisma.user.upsert({
        where: { socialHandle },
        update: { ...newUser, facecoinCode: getFacecoinCode() },
        create: { ...newUser, facecoinCode: getFacecoinCode() },
      });
    });

  return "OK";
};

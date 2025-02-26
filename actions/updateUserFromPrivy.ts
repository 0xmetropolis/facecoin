import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import {
  getFollowerCount,
  isFollowerCountError,
  isValidSocial,
  type FollowerCountFetchError,
} from "@/lib/socials";
import { User } from "@/lib/types";
import { PrivyEvents } from "@privy-io/react-auth";
import { Address, zeroAddress } from "viem";

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

function mapUserCountToFacecoinCode(userCount: number) {
  // eg: 9 users means
  const nextUserId = userCount.toString();

  const trailingUserIdNumber = nextUserId.at(-1)!;

  const facecoinCode = nextUserId.padEnd(
    // facecoin codes will be 5 digs long
    // 88888
    5,
    trailingUserIdNumber
  );

  return facecoinCode;
}

//
//// ACTION

export const updateUserFromPrivy = async ({
  user: privyUser,
  loginAccount,
  wasAlreadyAuthenticated,
  loginMethod,
}: PrivyOnCompleteParams): Promise<
  "OK" | InvalidSocialError | MissingUserFieldsError | FollowerCountFetchError
> => {
  // if the user was already authenticated, we don't need to do anything
  if (wasAlreadyAuthenticated && !loginAccount && !loginMethod) return "OK";
  // check if the social is valid
  if (
    !isValidSocial(loginAccount) ||
    (loginMethod !== "twitter" && loginMethod !== "farcaster")
  )
    return InvalidSocialError("Invalid social login account");

  const socialHandle =
    loginAccount.type === "farcaster"
      ? // use the farcaster username
        loginAccount.username
      : // or the twitter handle
        loginAccount.username;

  // check if the social handle exists
  if (!socialHandle) return MissingUserFieldsError("Social handle is missing");

  // check if the user exists based on privy id
  const [maybeSavedUser, userCount] = await Promise.all([
    prisma.user.findFirst({
      where: {
        OR: [
          { privyId: privyUser.id },
          { address: (privyUser.wallet?.address as Address) || zeroAddress },
          { socialHandle },
        ],
      },
    }),
    prisma.user.count(),
  ]);

  // return OK if they've been created and they're not reauthenticating their social platform
  if (
    maybeSavedUser &&
    maybeSavedUser.socialHandle === socialHandle &&
    maybeSavedUser.socialPlatform === loginMethod
  )
    return "OK";

  // snag their follower count from the platform of choice
  const followerCount = await getFollowerCount(
    loginMethod,
    socialHandle,
    userCount
  );
  if (isFollowerCountError(followerCount)) return followerCount;

  const socialPlatform: "twitter" | "farcaster" =
    loginMethod === "twitter"
      ? "twitter"
      : loginMethod === "farcaster"
      ? "farcaster"
      : (() => {
          throw Error("unimplmented social account");
        })();

  const facecoinCode = mapUserCountToFacecoinCode(userCount);
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
    socialPlatform,
    followerCount,
    address: userAddress as Address,
    facecoinCode,
    pfp: null,
    tokenAllocation: null,
  };

  // upsert the user
  await prisma.user
    .upsert({
      where: { privyId: privyUser.id },
      update: newUser,
      create: newUser,
    })
    .catch(async () => {
      await prisma.user.upsert({
        where: { socialHandle },
        update: newUser,
        create: newUser,
      });
    });

  return "OK";
};

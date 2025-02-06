import prisma from "@/lib/prisma";
import {
  getFollowerCount,
  isFollowerCountError,
  isValidSocial,
  type FollowerCountFetchError,
} from "@/lib/socials";
import { User } from "@/prisma/types";
import { PrivyEvents } from "@privy-io/react-auth";

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
//// ACTION

export const updateUserFromPrivy = async ({
  user,
  loginAccount,
  loginMethod,
}: PrivyOnCompleteParams): Promise<
  "OK" | InvalidSocialError | MissingUserFieldsError | FollowerCountFetchError
> => {
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
  const maybeSavedUser: User | null = await prisma.user.findUnique({
    where: {
      privyId: user.id,
    },
  });

  const userIsUpdatingTheirSocial =
    maybeSavedUser && maybeSavedUser?.socialHandle === socialHandle;

  // return OK if they've been created and they're not reauthenticating their social platform
  if (maybeSavedUser && !userIsUpdatingTheirSocial) return "OK";

  // snag their follower count from the platform of choice
  const followerCount = await getFollowerCount(loginMethod, socialHandle);
  if (isFollowerCountError(followerCount)) return followerCount;

  const socialPlatform: "twitter" | "farcaster" =
    loginMethod === "twitter"
      ? "twitter"
      : loginMethod === "farcaster"
      ? "farcaster"
      : (() => {
          throw Error("unimplmented social account");
        })();

  // user does not exist create the user
  const newUser: Omit<User, "id"> = {
    createdAt: new Date(),
    privyId: user.id,
    socialHandle,
    socialPlatform,
    followerCount,
    pfp: null,
    tokenAllocation_wei: null,
  };

  // upsert the user
  await prisma.user.upsert({
    where: { privyId: user.id },
    update: newUser,
    create: newUser,
  });

  return "OK";
};

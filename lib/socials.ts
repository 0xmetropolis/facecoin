import {
  FarcasterWithMetadata,
  LinkedAccountWithMetadata,
  TwitterOAuthWithMetadata,
} from "@privy-io/react-auth";
import { inlineDecrypt } from "./utils/encryption";

export const FollowerCountFetchError = (message: string) =>
  ({
    _tag: "FollowerCountFetchError",
    error: message,
  } as const);

export type FollowerCountFetchError = ReturnType<
  typeof FollowerCountFetchError
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFollowerCountError = (e: any): e is FollowerCountFetchError =>
  typeof e === "object" && e._tag === "FollowerCountFetchError";

export const isValidSocial = (
  loginAccount?: LinkedAccountWithMetadata | null
): loginAccount is TwitterOAuthWithMetadata | FarcasterWithMetadata => {
  return (
    !!loginAccount &&
    (loginAccount.type === "twitter_oauth" || loginAccount.type === "farcaster")
  );
};

const getXAuthToken = async (xAuthTokenNonce: number) => {
  const authTokens = process.env.X_AUTH_TOKENS;
  if (!authTokens) return FollowerCountFetchError("X_AUTH_TOKENS is not set");

  const tokens: string[] = authTokens.split(",");
  // get the token at the index of the nonce
  const token = tokens.at(xAuthTokenNonce % tokens.length);

  if (!token)
    return FollowerCountFetchError(
      "No token found - most likely array out of bounds issue"
    );

  return token;
};

const getXFollowerCount = async (
  handle: string,
  xAuthTokenNonce: number
): Promise<number | FollowerCountFetchError> => {
  const response = await fetch(
    `https://api.twitter.com/2/users/by/username/${handle}?user.fields=public_metrics`,
    {
      cache: "force-cache",
      // revalidate every 24 hours
      next: { revalidate: 60 * 60 * 24 },
      headers: {
        Authorization: `Bearer ${await getXAuthToken(xAuthTokenNonce)}`,
      },
    }
  );
  const body = await response.json();

  if (!response.ok)
    return FollowerCountFetchError(
      `Failed to fetch follower count from x: ${response.statusText} \n details: ${response.body}`
    );

  return body.data.public_metrics.followers_count;
};

const getFarcasterFollowerCount = async (
  handle: string
): Promise<number | FollowerCountFetchError> => {
  // ask @colinnielsen what this is
  const neynar = inlineDecrypt(
    "c11dd8e6d641b1c3d6cd9a8889b27786:9594d15ca3fc2e3d893868da3e8adfca67b36e0a87f7474f7d33fcdd7d813d41d2f280152c0ae97ae8db184afb23c632"
  );

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/search?q=${handle}&limit=1`,
    {
      headers: {
        accept: "application/json",
        api_key: neynar,
      },
    }
  );

  if (!response.ok)
    return FollowerCountFetchError(
      `Failed to fetch follower count from farcaster: ${response.statusText} \n details: ${response.body}`
    );

  const data = await response.json();

  return data.result.users[0].follower_count;
};

export const getFollowerCount = async (
  type: "twitter" | "farcaster",
  handle: string,
  userCount: number
): Promise<number | FollowerCountFetchError> => {
  switch (type) {
    case "twitter":
      // use the user count as a nonce to scramble the x api
      return getXFollowerCount(handle, userCount);
    case "farcaster":
      return getFarcasterFollowerCount(handle);
  }
};

export const getSocialLink = (platform: string, handle: string) => {
  if (platform === "twitter") return `https://x.com/${handle}`;
  if (platform === "farcaster") return `https://warpcast.com/${handle}`;
  return "#";
};

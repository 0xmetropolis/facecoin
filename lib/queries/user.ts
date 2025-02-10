import { User } from "@prisma/client";
import { type User as PrivyUser } from "@privy-io/react-auth";
import { skipToken, useQuery } from "@tanstack/react-query";

//
// Query Key Definitions
// ----------------------------------------
export function userQueryId(id?: PrivyUser["id"] | User["id"]) {
  return ["user", id];
}

function facecoinBalanceQueryKey(userId?: User["id"]) {
  return ["facecoin-balance", userId?.toString()];
}

//
// Query Functions
// ----------------------------------------

/**
 * @throws if response was not 200 from server
 */
async function getUserByPrivyId({
  privyId,
}: {
  privyId: string;
}): Promise<User> {
  const response = await fetch(`/api/user/by/privyId/${privyId}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok)
    throw new Error(
      `Failed to fetch user: ${response.status} ${response.statusText}`
    );

  const data = await response.json();

  return data as User;
}

/**
 * @throws if response was not 200 from server
 */
async function getUserById({
  userId: userId,
}: {
  userId: User["id"];
}): Promise<User> {
  const response = await fetch(`/api/user/by/userId/${userId}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok)
    throw new Error(
      `Failed to fetch user: ${response.status} ${response.statusText}`
    );

  const data = await response.json();

  return data as User;
}

async function getFacecoinBalance({
  userId,
}: {
  userId: number;
}): Promise<{ balance: number; usdValue: number }> {
  const response = await fetch(`/balance/${userId}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok)
    throw new Error(
      `Failed to fetch facecoin balance: ${response.status} ${response.statusText}`
    );

  const data = await response.json();

  return data as { balance: number; usdValue: number };
}

//
//// React Query Hooks
// ----------------------------------------

export const useUser = ({ id }: { id?: number }) =>
  useQuery({
    queryKey: userQueryId(id),
    queryFn: id ? () => getUserById({ userId: id }) : skipToken,
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

export const useUserByPrivyId = ({ id }: { id?: PrivyUser["id"] }) =>
  useQuery({
    queryKey: userQueryId(id),
    queryFn: id ? () => getUserByPrivyId({ privyId: id }) : skipToken,
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

export const useFacecoinBalance = ({ userId }: { userId?: number }) =>
  useQuery({
    queryKey: facecoinBalanceQueryKey(userId),
    queryFn: userId ? () => getFacecoinBalance({ userId }) : skipToken,
    // staleTime: 1000 * 60 * 4,
    enabled: !!userId,
  });

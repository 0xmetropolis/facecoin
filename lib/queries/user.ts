import { type User as PrivyUser } from "@privy-io/react-auth";
import { skipToken, useQuery } from "@tanstack/react-query";
import { User } from "../types";
import { GetHolderBalanceResponse } from "../metal";

//
// Query Key Definitions
// ----------------------------------------
export function userQueryId(id?: PrivyUser["id"] | User["id"]) {
  return ["user", id];
}

function facecoinBalanceQueryKey(user?: User) {
  return ["user", "facecoin-balance", user?.id?.toString()];
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
  userAddress,
}: {
  userAddress: string;
}): Promise<GetHolderBalanceResponse> {
  const response = await fetch(`/api/balance/${userAddress}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok)
    throw new Error(
      `Failed to fetch facecoin balance: ${response.status} ${response.statusText}`
    );

  const data = await response.json();

  return data;
}

async function getUsers() {
  const users = await fetch(`/api/user/all`);
  const usersData: User[] | { error: string; details: string } =
    await users.json();
  if (!users.ok || "error" in usersData) throw usersData; // will be an error

  return usersData;
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
    // 5 minutes
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

export const useFacecoinBalance = ({ user }: { user?: User }) =>
  useQuery({
    queryKey: facecoinBalanceQueryKey(user),
    queryFn: user
      ? () => getFacecoinBalance({ userAddress: user.address })
      : skipToken,
    // 5 minutes
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    // 1 minute
    staleTime: 1000 * 60 * 1,
  });

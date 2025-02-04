import { User } from "@prisma/client";
import { skipToken, useQuery } from "@tanstack/react-query";

//
// Query Key Definitions
// ----------------------------------------
function userQueryId(id?: User["id"]) {
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
async function getUser({ userId }: { userId: number }): Promise<User> {
  const response = await fetch(`/user/${userId}`, {
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
    queryFn: id ? () => getUser({ userId: id }) : skipToken,
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

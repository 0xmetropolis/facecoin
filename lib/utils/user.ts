import { cookies } from "next/headers";
import prisma from "../prisma";
import privy, { PRIVY_ID_TOKEN_NAME } from "../privy";
import { User } from "../types";

export const getUserFromRequest = async (): Promise<User | null> => {
  const cookieStore = await cookies();

  const token = cookieStore.get(PRIVY_ID_TOKEN_NAME);

  if (!token) return null;

  const user = await privy
    .getUser({
      idToken: token.value,
    })
    .then((u) => prisma.user.findUnique({ where: { privyId: u.id } }))
    .catch((e) => e as Error);

  if (user instanceof Error) return null;

  return user;
};

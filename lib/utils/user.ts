import { cookies } from "next/headers";
import prisma from "../prisma";
import privy, { PRIVY_ID_TOKEN_NAME } from "../privy";
import { User } from "../types";

export const getUserFromRequest = async ({
  updateReadTime = false,
}: {
  updateReadTime?: boolean;
} = {}): Promise<User | null> => {
  const cookieStore = await cookies();

  const token = cookieStore.get(PRIVY_ID_TOKEN_NAME);

  if (!token) return null;

  const user = await privy
    .getUser({
      idToken: token.value,
    })
    .then((u) =>
      prisma.user
        .findUnique({ where: { privyId: u.id } })
        .then(async (user) => {
          if (updateReadTime && user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastCheckedProfile: new Date() },
            });
          }
          return user;
        })
    )
    .catch((e) => e as Error);

  if (user instanceof Error) return null;

  return user;
};

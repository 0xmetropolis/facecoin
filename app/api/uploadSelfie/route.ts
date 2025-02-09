import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import { styleizePhoto } from "@/lib/replicate";
import { determineTokenAllocation } from "@/lib/tokenAllocation";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { photo } = await req.json();

  const privyToken = req.cookies.get("privy-token")?.value;

  if (!privyToken)
    return NextResponse.json({ error: "No privy token" }, { status: 401 });

  const privyUserId = await privy
    .verifyAuthToken(privyToken)
    .then((user) => user.userId)
    .catch((e) => e as Error);

  if (privyUserId instanceof Error)
    return NextResponse.json({ error: privyUserId.message }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: {
      privyId: privyUserId,
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 401 });

  const [tokenAllocation, styledPhoto] = await Promise.all([
    determineTokenAllocation(user),
    styleizePhoto(photo),
  ]);

  await prisma.user.update({
    where: {
      privyId: privyUserId,
    },
    data: {
      tokenAllocation_wei: tokenAllocation,
      pfp: styledPhoto,
    },
  });

  return NextResponse.json({ message: "OK" });
};

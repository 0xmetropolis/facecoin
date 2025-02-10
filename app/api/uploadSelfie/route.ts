import { deleteImageFromBlob, saveImageToBlob } from "@/lib/blob-store";
import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import { styleizePhoto } from "@/lib/replicate";
import { determineTokenAllocation } from "@/lib/tokenAllocation";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const saveSelfieToBlobStore = async (userId: User["id"], selfie: string) => {
  const filename = `selfie/${userId}`;
  const url = await saveImageToBlob(filename, selfie);

  return url;
};

const deleteSelfieFromBlobStore = async (userId: User["id"]) => {
  const filename = `selfie/${userId}`;
  await deleteImageFromBlob(filename);
};

export const POST = async (req: NextRequest) => {
  const { photo } = await req.json();

  const privyToken = req.cookies.get("privy-token")?.value;

  if (!privyToken)
    return NextResponse.json({ error: "No privy token" }, { status: 401 });

  const privyResponse = await privy
    .verifyAuthToken(privyToken)
    .then((user) => user.userId)
    .catch((e) => e as Error);

  if (privyResponse instanceof Error)
    return NextResponse.json({ error: privyResponse.message }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: {
      privyId: privyResponse,
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 401 });

  const savedImgUrl = await saveSelfieToBlobStore(user.id, photo);

  const [tokenAllocation, styledPhoto] = await Promise.all([
    determineTokenAllocation(user),
    styleizePhoto({ imgUrl: savedImgUrl }),
  ]).catch(async (e) => {
    // delete the selfie from blob store if the photo is not styled
    deleteSelfieFromBlobStore(user.id);
    throw e;
  });

  // do not await
  prisma.user.update({
    where: {
      privyId: privyResponse,
    },
    data: {
      tokenAllocation_wei: tokenAllocation,
      pfp: styledPhoto,
    },
  });

  // do not await
  // delete the selfie from blob store after stylization
  deleteSelfieFromBlobStore(user.id);

  return NextResponse.json({ message: "OK" });
};

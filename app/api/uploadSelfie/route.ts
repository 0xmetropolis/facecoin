import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import * as Replicate from "@/lib/replicate";
import { determineTokenAllocation } from "@/lib/tokenAllocation";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  saveSelfieToBlobStore,
  saveReplicatePhotoToBlobStore,
  deleteSelfieFromBlobStore,
} from "./utils";

//
//// CONFIG
export const maxDuration = 30;

//
//// ROUTE HANDLER
export const POST = async (req: NextRequest) => {
  const { photo: photoDataUrl } = await req.json();

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

  const savedImgUrl = await saveSelfieToBlobStore(user.id, photoDataUrl);

  const output = await Promise.all([
    // determine their token allocation
    determineTokenAllocation(user),
    // style the photo
    Replicate.styleizePhoto({ imgUrl: savedImgUrl }).then((img) =>
      saveReplicatePhotoToBlobStore(user.id, img)
    ),
  ]).catch(async (e) => {
    console.error(e);
    // delete the selfie from blob store if the photo is not styled
    deleteSelfieFromBlobStore(user.id);
    return e as Error;
  });

  if (output instanceof Error)
    return NextResponse.json({ message: output.message }, { status: 500 });

  const [tokenAllocation, pfpFromReplicate] = output;

  const updatedUser = await prisma.user.update({
    where: {
      privyId: privyResponse,
    },
    data: {
      tokenAllocation_wei: tokenAllocation,
      pfp: pfpFromReplicate,
    },
  });

  // do not await
  // delete the selfie from blob store after stylization
  deleteSelfieFromBlobStore(user.id);

  // revalidate the home page
  revalidatePath("/");

  return NextResponse.json({ message: "OK", updatedUser });
};

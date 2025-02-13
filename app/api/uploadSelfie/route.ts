import { FACECOIN_TOKEN_ADDRESS } from "@/lib/facecoin-token";
import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import * as Replicate from "@/lib/replicate";
import TokenAllocator from "@/lib/tokenAllocation";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteSelfieFromBlobStore,
  saveReplicatePhotoToBlobStore,
  saveSelfieToBlobStore,
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.followerCount === null || user.followerCount === 0)
    return NextResponse.json(
      { error: "User has no followers :/" },
      { status: 401 }
    );

  const savedImgUrl = await saveSelfieToBlobStore(user.id, photoDataUrl);

  const output = await Promise.all([
    // determine their token allocation
    TokenAllocator.new(FACECOIN_TOKEN_ADDRESS).then((allocator) =>
      allocator.addUser({
        followerCount: user.followerCount!,
        // they're at the booth
        isInPerson: true,
      })
    ),
    // style the photo
    Replicate.styleizePhoto({ imgUrl: savedImgUrl }).then((img) =>
      saveReplicatePhotoToBlobStore(user.id, img)
    ),
  ])
    .catch((e) => {
      console.error(e);

      return e as Error;
    })
    .finally(() =>
      // delete the selfie from blob store
      deleteSelfieFromBlobStore(user.id)
    );

  if (output instanceof Error)
    return NextResponse.json({ message: output.message }, { status: 500 });

  const [allacatorResult, pfpFromReplicate] = output;

  const updatedUser = await prisma.user.update({
    where: {
      privyId: privyResponse,
    },
    data: {
      tokenAllocation_wei: allacatorResult.allocation_wei.toString(),
      pfp: pfpFromReplicate,
    },
  });

  // revalidate the home page
  revalidatePath("/");

  return NextResponse.json({ message: "OK", updatedUser });
};

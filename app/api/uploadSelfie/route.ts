import { Metal } from "@/lib/metal";
import prisma from "@/lib/prisma";
import privy, { PRIVY_ID_TOKEN_NAME } from "@/lib/privy";
import * as Replicate from "@/lib/replicate";
import { getLiveTokenAllocator } from "@/lib/tokenAllocation";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";
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

  const privyIdToken = req.cookies.get(PRIVY_ID_TOKEN_NAME)?.value;

  if (!privyIdToken)
    return NextResponse.json({ error: "No privy id token" }, { status: 401 });

  const privyUser = await privy
    .getUser({ idToken: privyIdToken })
    .then((user) => user)
    .catch((e) => e as Error);

  if (privyUser instanceof Error)
    return NextResponse.json({ error: privyUser.message }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: {
      privyId: privyUser.id,
    },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // const userPreviouslyHadADistribution = user.tokenAllocation !== null;

  if (user.followerCount === null || user.followerCount === 0)
    return NextResponse.json(
      { error: "User has no followers :/" },
      { status: 401 }
    );

  const savedImgUrl = await saveSelfieToBlobStore(user.id, photoDataUrl);

  const output = await Promise.all([
    // determine their token allocation
    getLiveTokenAllocator().then((allocator) =>
      allocator.addUser({
        followerCount: user.followerCount!,
        // they're at the booth
        isInPerson: false,
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
      privyId: privyUser.id,
    },
    data: {
      tokenAllocation:
        user.tokenAllocation === null
          ? allacatorResult.allocation.toString()
          : user.tokenAllocation,
      pfp: pfpFromReplicate,
      updatedAt: new Date(),
    },
  });

  // revalidate the home page and user pages
  revalidatePath("/");
  revalidatePath(`/${updatedUser.socialHandle}`);

  const privyUserAddress = privyUser.wallet?.address
    ? privyUser.wallet.address
    : await privy
        .createWallets({
          userId: privyUser.id,
          createEthereumWallet: true,
          numberOfEthereumWalletsToCreate: 1,
        })
        .then((u) => u.wallet!.address!);

  if (!privyUserAddress)
    return NextResponse.json(
      { error: "No privy user address" },
      { status: 500 }
    );

  // if (!userPreviouslyHadADistribution)
  const success = await Metal.sendReward({
    to: privyUserAddress as Address,
    amount: allacatorResult.allocation,
  })
    .then(() => true)
    .catch((e) => {
      console.error(e);
      return false;
    });

  if (!success)
    return NextResponse.json(
      { error: "Failed to send reward" },
      { status: 500 }
    );

  return NextResponse.json({ message: "OK", updatedUser });
};

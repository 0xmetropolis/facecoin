import * as Metal from "@/lib/metal";
import prisma from "@/lib/prisma";
import privy from "@/lib/privy";
import * as Replicate from "@/lib/replicate";
import TokenAllocator from "@/lib/tokenAllocation";
import {
  LinkedAccountWithMetadata,
  WalletWithMetadata,
} from "@privy-io/server-auth";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";
import {
  deleteSelfieFromBlobStore,
  saveReplicatePhotoToBlobStore,
  saveSelfieToBlobStore,
} from "./utils";
import { revalidatePath } from "next/cache";

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
    .then((user) => user)
    .catch((e) => e as Error);

  if (privyResponse instanceof Error)
    return NextResponse.json({ error: privyResponse.message }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: {
      privyId: privyResponse.userId,
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
    TokenAllocator.new().then((allocator) =>
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
      privyId: privyResponse.userId,
    },
    data: {
      tokenAllocation: allacatorResult.allocation.toString(),
      pfp: pfpFromReplicate,
    },
  });

  // revalidate the home page
  revalidatePath("/");

  const privyUser = await privy.createWallets({
    userId: privyResponse.userId,
    createEthereumWallet: true,
    numberOfEthereumWalletsToCreate: 1,
  });

  const isPrivyWallet = (
    account: LinkedAccountWithMetadata
  ): account is WalletWithMetadata => account.type === "wallet";

  const privyUserAddress = privyUser.linkedAccounts.find(isPrivyWallet)
    ?.address as Address;

  if (!privyUserAddress)
    return NextResponse.json(
      { error: "No privy user address" },
      { status: 500 }
    );

  // if (!userPreviouslyHadADistribution)
  await Metal.sendReward({
    // userId: user.id,
    to: privyUserAddress,
    amount: allacatorResult.allocation,
  });

  return NextResponse.json({ message: "OK", updatedUser });
};

import * as Metal from "@/lib/metal";
import prisma from "@/lib/prisma";
import privy, { PRIVY_ID_TOKEN_NAME } from "@/lib/privy";
import * as Replicate from "@/lib/replicate";
import { getLiveTokenAllocator } from "@/lib/tokenAllocation";
import { User } from "@/lib/types";
import { User as PrivyUser } from "@privy-io/server-auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";
import {
  deleteSelfieFromBlobStore,
  saveReplicatePhotoToBlobStore,
  saveSelfieToBlobStore,
} from "./utils";

//// UTILS
//

/**
 * @dev handles both the user's personal upload path and the secured admin path at the booth
 */
const getUserFromUploadSelfieRequest = async (
  req: NextRequest,
  useBoothFlow?: boolean,
  facecoinId?: string
): Promise<
  | { user: User; privyUser: PrivyUser; useBoothFlow: boolean }
  | NextResponse<{ error: string }>
> => {
  if (useBoothFlow) {
    if (!facecoinId)
      return NextResponse.json({ error: "No facecoin id" }, { status: 401 });

    const admin_token = req.cookies.get("admin_token");
    const isAuthenticated = admin_token?.value === process.env.ADMIN_PASSWORD;
    if (!isAuthenticated)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: {
        facecoinCode: facecoinId,
      },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const privyUser = await privy.getUser(user.privyId);

    return { user, privyUser, useBoothFlow: true };
  } else {
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

    return { user, privyUser, useBoothFlow: false };
  }
};

//
//// HANDLER
export const uploadSelfieHandler = async (req: NextRequest) => {
  const { photo: photoDataUrl, useBoothFlow, facecoinId } = await req.json();

  const request = await getUserFromUploadSelfieRequest(
    req,
    useBoothFlow,
    facecoinId
  );
  if (request instanceof NextResponse) return request;

  const { user, privyUser } = request;

  const userPreviouslyHadADistribution = user.tokenAllocation !== null;
  const isAuthenticated =
    process.env.ADMIN_PASSWORD === req.cookies.get("admin_token")?.value;

  if (userPreviouslyHadADistribution && !isAuthenticated) {
    return NextResponse.json(
      { error: "User has already onboarded" },
      { status: 401 }
    );
  }

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
        isInPerson: useBoothFlow,
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
    // delete the selfie from blob store if it succeeds OR fails
    .finally(() => deleteSelfieFromBlobStore(user.id));

  if (output instanceof Error)
    return NextResponse.json({ message: output.message }, { status: 500 });

  const [allacatorResult, pfpFromReplicate] = output;

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      tokenAllocation: allacatorResult.allocation.toString(),
      pfp: pfpFromReplicate,
      updatedAt: new Date(),
    },
  });

  // revalidate the home page and user pages, and any of the holder balance query
  revalidatePath("/");
  revalidatePath(`/${updatedUser.socialHandle}`);
  revalidateTag(`holders`);

  // use their privy wallet or create one for them
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

  const success = !userPreviouslyHadADistribution
    ? await Metal.sendReward({
        to: privyUserAddress as Address,
        amount: allacatorResult.allocation,
      })
        .then(() => true)
        .catch((e) => {
          console.error(e);
          return false;
        })
    : true;

  if (!success)
    return NextResponse.json(
      { error: "Failed to send reward" },
      { status: 500 }
    );

  return NextResponse.json({ message: "OK", updatedUser });
};

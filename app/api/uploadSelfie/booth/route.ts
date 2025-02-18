import prisma from "@/lib/prisma";
import * as Replicate from "@/lib/replicate";
import { getLiveTokenAllocator } from "@/lib/tokenAllocation";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteSelfieFromBlobStore,
  saveReplicatePhotoToBlobStore,
  saveSelfieToBlobStore,
} from "../utils";

//
//// CONFIG
export const maxDuration = 30;

//
//// ROUTE HANDLER FOR ADMIN IS BOOTH FLOW
export const POST = async (req: NextRequest) => {
  const { photo: photoDataUrl, facecoinId } = await req.json();

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
      facecoinCode: facecoinId,
    },
    data: {
      tokenAllocation: allacatorResult.allocation.toString(),
      pfp: pfpFromReplicate,
      updatedAt: new Date(),
    },
  });

  // revalidate the home page and user pages
  revalidatePath("/");
  revalidatePath(`/${updatedUser.socialHandle}`);

  return NextResponse.json({ message: "OK", updatedUser });
};

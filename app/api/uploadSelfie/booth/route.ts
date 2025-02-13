import prisma from "@/lib/prisma";
import * as Replicate from "@/lib/replicate";
import { determineTokenAllocation } from "@/lib/tokenAllocation";
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
      facecoinCode: facecoinId,
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

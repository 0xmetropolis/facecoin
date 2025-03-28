import { saveDataToBlob, deleteFromBlob } from "@/lib/blob-store";
import { User } from "@/lib/types";

//
//// HELPERS
export const saveReplicatePhotoToBlobStore = async (
  userId: User["id"],
  photo: Blob
) => {
  const filename = `pfp/${userId}.jpeg`;
  const url = await saveDataToBlob(filename, photo);

  return url;
};

export const saveSelfieToBlobStore = async (
  userId: User["id"],
  photoDataUrl: string
) => {
  const photo: ArrayBuffer = await fetch(photoDataUrl).then((res) =>
    res.arrayBuffer()
  );

  const filename = `selfie/${userId}.jpeg`;
  const url = await saveDataToBlob(filename, photo);

  return url;
};
export const deleteSelfieFromBlobStore = async (userId: User["id"]) => {
  const filename = `selfie/${userId}.jpeg`;
  await deleteFromBlob(filename);
};

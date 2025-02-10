import { put, del } from "@vercel/blob";

export const saveImageToBlob = async (filename: string, image: string) => {
  const { url } = await put(filename, image, {
    access: "public",
  });

  return url;
};

export const deleteImageFromBlob = async (filename: string) => {
  await del(filename);
};

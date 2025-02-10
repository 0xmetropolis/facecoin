import { put, del } from "@vercel/blob";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveDataToBlob = async (filename: string, data: any) => {
  const { url } = await put(filename, data, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });

  return url;
};

export const deleteFromBlob = async (filename: string) => {
  await del(filename);
};

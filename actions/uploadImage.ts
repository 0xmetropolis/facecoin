"use server";

const uploadImageAction = async (photo: string) => {
  await new Promise((r) => setTimeout(() => r(null), 3_000));
  console.log(photo);

  return photo;
};

export { uploadImageAction };

import { redirect } from "next/navigation";

export const uploadImage = async (photo: string) => {
  await new Promise((r) => setTimeout(() => r(null), 3_000));
  console.log(photo);

  redirect("/onboard/success");
};

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const resetUser = async (
  prevState: { error: null | string; success: null | string },
  formData: FormData
) => {
  const socialHandle = formData.get("socialHandle");
  if (!socialHandle || typeof socialHandle !== "string")
    return { error: "No social handle", success: null };

  const user = await prisma.user.findUnique({
    where: { socialHandle },
  });

  if (!user) return { error: "User not found", success: null };

  await prisma.$transaction(async (tx) => {
    await tx.pokeEvent.deleteMany({
      where: { OR: [{ victimId: user.id }, { perpetratorId: user.id }] },
    });

    await tx.poke.deleteMany({
      where: { OR: [{ victimId: user.id }, { perpetratorId: user.id }] },
    });

    await tx.user.delete({
      where: { id: user.id },
    });
  });

  revalidatePath(`/`);
  revalidatePath(`/${user.socialHandle}`);

  return { success: "Reset ✅", error: null };
};

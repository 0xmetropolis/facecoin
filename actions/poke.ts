import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/utils/user";
import { revalidatePath } from "next/cache";

export const poke = async (
  prevState: { error: null | string; success: null | string },
  formData: FormData
) => {
  const victim = formData.get("victim");
  if (!victim) return { error: "No victim", success: null };

  const victimUser = await prisma.user.findUnique({
    where: { id: +victim },
  });

  if (!victimUser) return { error: "User not found", success: null };

  const perpetratorUser = await getUserFromRequest();

  if (!perpetratorUser) return { error: "Not authorized", success: null };

  const [a_id, b_id] = [perpetratorUser.id, victimUser.id].sort();
  const between_id = `${a_id}<>${b_id}`;

  await prisma.$transaction(async (tx) => {
    const poke = await tx.poke.upsert({
      where: {
        between: between_id,
      },
      update: {
        count: {
          increment: 1,
        },
        perpetratorId: perpetratorUser.id,
        victimId: victimUser.id,
      },
      create: {
        between: between_id,
        count: 1,
        perpetratorId: perpetratorUser.id,
        victimId: victimUser.id,
      },
    });

    // Create individual poke event
    await tx.pokeEvent.create({
      data: {
        pokeId: poke.id,
        perpetratorId: perpetratorUser.id,
        victimId: victimUser.id,
      },
    });
  });

  revalidatePath(`/${victimUser.socialHandle}`);
  revalidatePath(`/${perpetratorUser.socialHandle}`);

  return { success: "Poked ✅", error: null };
};

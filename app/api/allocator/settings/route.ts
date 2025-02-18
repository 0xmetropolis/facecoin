import prisma from "@/lib/prisma";
import { z } from "zod";

const followerTierEnum = z.enum(["SUPER", "HIGH", "MEDIUM", "LOW"]);

const categoryKeySchema =
  z.custom<`${z.infer<typeof followerTierEnum>}_${"IN_PERSON" | "ONLINE"}`>();

const allocatorSettingsSchema = z.object({
  followerTiers: z.record(followerTierEnum, z.number().min(0)),
  baseAllocations: z.record(categoryKeySchema, z.number().min(0)),
  minimumAllocations: z.record(categoryKeySchema, z.number().min(0)),
  decayFactor: z.number().min(0).max(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = allocatorSettingsSchema.parse(body);

    // Upsert the configuration
    await prisma.allocatorSettings.upsert({
      where: { id: 1 },
      create: {
        ...validatedInput,
        id: 1,
      },
      update: validatedInput,
    });

    return Response.json({
      success: true,
      message: "Parameters updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error(error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const settings = await prisma.allocatorSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return Response.json(
        { success: false, error: "No settings found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

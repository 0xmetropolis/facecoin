import prisma from "@/lib/prisma";
import TokenAllocator from "@/lib/tokenAllocation";
import { z } from "zod";

const allocatorSettingsSchema = z.object({
  targetUserCount: z.number().min(0).max(10_000),
});

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = allocatorSettingsSchema.parse(body);

    // Upsert the configuration
    const settings = await prisma.allocatorSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return Response.json(
        { success: false, error: "No settings found" },
        { status: 404 }
      );
    }

    const allocator = await TokenAllocator.new(
      validatedInput.targetUserCount,
      50_000_000,
      50_000_000
    );

    

    const allocationStats = allocator.getDistributionStats();

    return Response.json({
      success: true,
      allocationStats,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

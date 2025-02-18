import prisma from "@/lib/prisma";
import TokenAllocator, { DEFAULT_SETTINGS } from "@/lib/tokenAllocation";
import { z } from "zod";

const allocatorSettingsSchema = z.object({
  targetUserCount: z.number().min(0).max(10_000),
  inPersonRatio: z.number().min(0).max(1).default(0.3), // 30% in-person by default
});

type CategoryStats = {
  userCount: number;
  averageAllocation: number;
  lowestAllocation: number;
  highestAllocation: number;
};

export type SimulationResult = {
  tiers: Record<string, CategoryStats>;
  totalTokensAllocated: number;
};

function generateFollowerCount(): number {
  // Use exponential distribution to generate follower counts
  // This creates a long-tail distribution where high follower counts are rarer
  const rand = Math.random();
  const lambda = 5; // Parameter to control the shape of distribution

  // Calculate follower count using inverse exponential distribution
  const followers = Math.floor(
    (-Math.log(1 - rand) / lambda) * DEFAULT_SETTINGS.followerTiers.SUPER
  );

  return followers;
}

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = allocatorSettingsSchema.parse(body);
    const { targetUserCount, inPersonRatio } = validatedInput;

    // Get settings
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
      targetUserCount,
      50_000_000,
      50_000_000
    );

    // Run simulation
    const categoryAccumulator: Record<
      string,
      {
        totalTokens: number;
        count: number;
        lowestAllocation: number;
        highestAllocation: number;
      }
    > = {};
    let totalTokensAllocated = 0;

    for (let i = 0; i < targetUserCount; i++) {
      const followers = generateFollowerCount();
      const isInPerson = Math.random() < inPersonRatio;

      const result = allocator.addUser({
        followerCount: followers,
        isInPerson,
      });

      // Determine tier for reporting
      let tier = "UNPOPULAR";
      if (followers >= DEFAULT_SETTINGS.followerTiers.SUPER) tier = "SUPER";
      else if (followers >= DEFAULT_SETTINGS.followerTiers.HIGH) tier = "HIGH";
      else if (followers >= DEFAULT_SETTINGS.followerTiers.MEDIUM)
        tier = "MEDIUM";
      else if (followers >= DEFAULT_SETTINGS.followerTiers.LOW) tier = "LOW";

      // Create category key that includes both tier and location
      const categoryKey = `${tier}_${isInPerson ? "IN_PERSON" : "ONLINE"}`;

      // Initialize category if not exists
      if (!categoryAccumulator[categoryKey]) {
        categoryAccumulator[categoryKey] = {
          totalTokens: 0,
          count: 0,
          lowestAllocation: Infinity,
          highestAllocation: -Infinity,
        };
      }

      // Update category stats
      const category = categoryAccumulator[categoryKey];
      category.totalTokens += result.allocation;
      category.count += 1;
      category.lowestAllocation = Math.min(
        category.lowestAllocation,
        result.allocation
      );
      category.highestAllocation = Math.max(
        category.highestAllocation,
        result.allocation
      );
      totalTokensAllocated += result.allocation;
    }

    // Convert accumulator to final stats format
    const tierStats: Record<string, CategoryStats> = Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS.followerTiers).map(([tier, count]) => {
        return [
          `${tier} >=${count}`,
          {
            userCount: 0,
            averageAllocation: 0,
            lowestAllocation: Infinity,
            highestAllocation: -Infinity,
          },
        ];
      })
    );

    // Combine in-person and online stats for each tier
    Object.entries(categoryAccumulator).forEach(([category, data]) => {
      // Extract just the tier part (e.g., "SUPER" from "SUPER_IN_PERSON")
      const tier = category.split("_")[0];
      const tierWithLabel = `${tier} >=${
        DEFAULT_SETTINGS.followerTiers[
          tier as keyof typeof DEFAULT_SETTINGS.followerTiers
        ] || 0
      }`;

      if (!tierStats[tierWithLabel]) {
        tierStats[tierWithLabel] = {
          userCount: 0,
          averageAllocation: 0,
          lowestAllocation: Infinity,
          highestAllocation: -Infinity,
        };
      }

      // Accumulate stats
      const tierStat = tierStats[tierWithLabel];
      tierStat.userCount += data.count;
      tierStat.averageAllocation = Math.floor(
        (tierStat.averageAllocation * (tierStat.userCount - data.count) +
          data.totalTokens) /
          tierStat.userCount
      );
      tierStat.lowestAllocation = Math.min(
        tierStat.lowestAllocation,
        data.lowestAllocation
      );
      tierStat.highestAllocation = Math.max(
        tierStat.highestAllocation,
        data.highestAllocation
      );
    });

    const simulationResult: SimulationResult = {
      tiers: tierStats,
      totalTokensAllocated,
    };

    return Response.json({
      success: true,
      simulation: simulationResult,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

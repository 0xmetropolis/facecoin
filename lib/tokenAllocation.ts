import { Metal } from "./metal";
import prisma from "./prisma";

type FollowerTier = "SUPER" | "HIGH" | "MEDIUM" | "LOW";
type AttendanceType = "IN_PERSON" | "ONLINE";
type CategoryKey = `${FollowerTier}_${AttendanceType}`;

export const DEFAULT_SETTINGS = {
  followerTiers: {
    SUPER: 50000,
    HIGH: 20000,
    MEDIUM: 8000,
    LOW: 100,
  },
  baseAllocations: {
    SUPER_IN_PERSON: 2000,
    HIGH_IN_PERSON: 1500,
    SUPER_ONLINE: 1000,
    MEDIUM_IN_PERSON: 750,
    HIGH_ONLINE: 500,
    MEDIUM_ONLINE: 375,
    LOW_IN_PERSON: 250,
    LOW_ONLINE: 188,
  },
  minimumAllocations: {
    SUPER_IN_PERSON: 200,
    HIGH_IN_PERSON: 150,
    SUPER_ONLINE: 100,
    MEDIUM_IN_PERSON: 75,
    HIGH_ONLINE: 50,
    MEDIUM_ONLINE: 38,
    LOW_IN_PERSON: 25,
    LOW_ONLINE: 19,
  },
  decayFactor: 0.99,
};

export type AllocatorSettings = typeof DEFAULT_SETTINGS;

type OverallStats = {
  totalUsersServed: number;
  remainingTokens: number;
  currentDecayFactor: number;
  currentScalingFactor: number;
};

class TokenAllocator {
  //
  //// CONSTRUCTOR
  ///

  /** (use {@link new}) */
  private constructor(
    private readonly startingRewardTokens: number,
    private remainingRewardTokens: number,
    private userCount: number,
    private readonly settings: AllocatorSettings
  ) {}

  /**
   * @param tokenAddress - The address of the token to allocate
   * @returns A new TokenAllocator instance
   */
  public static async new(
    userCount: number,
    startingRewardSupply: number,
    remainingRewardSupply: number
  ): Promise<TokenAllocator> {
    const settings = await prisma.allocatorSettings.findUnique({
      where: { id: 1 },
    });

    // Parse settings from DB or use defaults
    const allocatorSettings: AllocatorSettings = settings
      ? {
          followerTiers: settings.followerTiers as Record<FollowerTier, number>,
          baseAllocations: settings.baseAllocations as Record<
            CategoryKey,
            number
          >,
          minimumAllocations: settings.minimumAllocations as Record<
            CategoryKey,
            number
          >,
          decayFactor: settings.decayFactor,
        }
      : DEFAULT_SETTINGS;

    return new TokenAllocator(
      startingRewardSupply,
      remainingRewardSupply,
      userCount,
      allocatorSettings
    );
  }

  //
  //// PRIVATE HELPERS
  ///
  private categorizeUser(
    followerCount: number,
    isInPerson: boolean
  ): CategoryKey | "UNPOPULAR" {
    let tier: FollowerTier | null = null;

    if (followerCount >= this.settings.followerTiers.SUPER) {
      tier = "SUPER";
    } else if (followerCount >= this.settings.followerTiers.HIGH) {
      tier = "HIGH";
    } else if (followerCount >= this.settings.followerTiers.MEDIUM) {
      tier = "MEDIUM";
    } else if (followerCount >= this.settings.followerTiers.LOW) {
      tier = "LOW";
    }

    if (!tier) return "UNPOPULAR";

    return `${tier}_${isInPerson ? "IN_PERSON" : "ONLINE"}` as CategoryKey;
  }

  private calculateTimeDecay(): number {
    return Math.pow(
      this.settings.decayFactor,
      Math.floor(this.userCount / 100)
    );
  }

  private calculatePoolScaling(): number {
    // Start scaling down when 50% of tokens are used
    const poolThreshold = this.startingRewardTokens * 0.5;
    if (this.remainingRewardTokens >= poolThreshold) {
      return 1.0; // No scaling needed yet
    }

    // Calculate scaling factor based on remaining tokens
    // This creates a gradual decrease from 1.0 to 0.2 as tokens deplete
    const scalingFactor =
      0.2 + 0.8 * (this.remainingRewardTokens / poolThreshold);
    return Math.max(0.2, scalingFactor);
  }

  private calculateAllocation(category: CategoryKey): number {
    // Apply time decay
    const timeDecay = this.calculateTimeDecay();
    const baseAmount = this.settings.baseAllocations[category] * timeDecay;

    // Apply pool scaling
    const poolScaling = this.calculatePoolScaling();
    const scaledAmount = baseAmount * poolScaling;

    // Apply minimum floor
    const minAmount = this.settings.minimumAllocations[category];

    return Math.max(Math.floor(scaledAmount), minAmount);
  }

  //
  //// PUBLIC METHODS
  ///
  addUser({
    followerCount,
    isInPerson,
  }: {
    followerCount: number;
    isInPerson: boolean;
  }): {
    allocation: number;
    remainingTokens: number;
    scalingFactor: number;
  } {
    if (this.remainingRewardTokens <= 0)
      throw new Error("No more tokens available for distribution");

    const category = this.categorizeUser(followerCount, isInPerson);

    const categoryAllocation =
      category === "UNPOPULAR" ? 0 : this.calculateAllocation(category);

    const allocation = Math.min(categoryAllocation, this.remainingRewardTokens);

    return {
      allocation,
      remainingTokens: this.remainingRewardTokens,
      scalingFactor: this.calculatePoolScaling(),
    };
  }

  getDistributionStats(): OverallStats {
    const stats: OverallStats = {
      totalUsersServed: this.userCount,
      remainingTokens: this.remainingRewardTokens,
      currentDecayFactor: this.settings.decayFactor,
      currentScalingFactor: this.calculatePoolScaling(),
    };

    return stats;
  }
}

export default TokenAllocator;

export const getLiveTokenAllocator = async () => {
  const userCount = await prisma.user.count();
  const { startingRewardSupply, remainingRewardSupply } =
    await Metal.getTokenInfo();

  return TokenAllocator.new(
    userCount,
    startingRewardSupply,
    remainingRewardSupply
  );
};

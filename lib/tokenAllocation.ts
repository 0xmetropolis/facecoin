import { Address, formatEther, parseEther } from "viem";
import { getTokenHolders } from "./metal";
import prisma from "./prisma";

type FollowerTier = "SUPER" | "HIGH" | "MEDIUM" | "LOW";
type AttendanceType = "IN_PERSON" | "ONLINE";
type CategoryKey = `${FollowerTier}_${AttendanceType}`;

type OverallStats = {
  totalUsersServed: number;
  remainingTokens: number;
  currentDecayFactor: number;
  currentScalingFactor: number;
};

class TokenAllocator {
  // Make constructor private to enforce factory method usage
  private constructor(
    private readonly startingRewardTokens: number,
    private remainingRewardTokens: number,
    private userCount: number,
    private readonly decayFactor: number = 0.99,
    private readonly FOLLOWER_TIERS: Record<FollowerTier, number> = {
      SUPER: 50000,
      HIGH: 20000,
      MEDIUM: 8000,
      LOW: 100,
    },
    private readonly baseAllocations: Record<CategoryKey, number> = {
      SUPER_IN_PERSON: 2000,
      HIGH_IN_PERSON: 1500,
      SUPER_ONLINE: 1000,
      MEDIUM_IN_PERSON: 750,
      HIGH_ONLINE: 500,
      MEDIUM_ONLINE: 375,
      LOW_IN_PERSON: 250,
      LOW_ONLINE: 188,
    },
    private readonly minimumAllocations: Record<CategoryKey, number> = {
      SUPER_IN_PERSON: 200,
      HIGH_IN_PERSON: 150,
      SUPER_ONLINE: 100,
      MEDIUM_IN_PERSON: 75,
      HIGH_ONLINE: 50,
      MEDIUM_ONLINE: 38,
      LOW_IN_PERSON: 25,
      LOW_ONLINE: 19,
    }
  ) {}

  // Static factory method for async initialization
  public static async new(tokenaddress: Address): Promise<TokenAllocator> {
    const userCount = await prisma.user.count();
    const tokenInfo = await getTokenHolders(tokenaddress);
    const remainingRewardTokens = +formatEther(BigInt(tokenInfo.totalSupply));
    const startingRewardTokens =
      remainingRewardTokens +
      (await prisma.user
        .findMany({
          select: {
            tokenAllocation_wei: true,
          },
        })
        .then((users) =>
          users.reduce(
            (acc, user) =>
              acc +
              (user.tokenAllocation_wei
                ? +formatEther(BigInt(user.tokenAllocation_wei))
                : 0),
            0
          )
        ));

    return new TokenAllocator(
      startingRewardTokens,
      remainingRewardTokens, // remainingTokens starts equal to totalTokens
      userCount
    );
  }

  private categorizeUser(
    followerCount: number,
    isInPerson: boolean
  ): CategoryKey | "UNPOPULAR" {
    let tier: FollowerTier | null = null;

    if (followerCount >= this.FOLLOWER_TIERS.SUPER) {
      tier = "SUPER";
    } else if (followerCount >= this.FOLLOWER_TIERS.HIGH) {
      tier = "HIGH";
    } else if (followerCount >= this.FOLLOWER_TIERS.MEDIUM) {
      tier = "MEDIUM";
    } else if (followerCount >= this.FOLLOWER_TIERS.LOW) {
      tier = "LOW";
    }

    if (!tier) return "UNPOPULAR";

    return `${tier}_${isInPerson ? "IN_PERSON" : "ONLINE"}` as CategoryKey;
  }

  private calculateTimeDecay(): number {
    return Math.pow(this.decayFactor, Math.floor(this.userCount / 100));
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
    const baseAmount = this.baseAllocations[category] * timeDecay;

    // Apply pool scaling
    const poolScaling = this.calculatePoolScaling();
    const scaledAmount = baseAmount * poolScaling;

    // Apply minimum floor
    const minAmount = this.minimumAllocations[category];

    return Math.max(Math.floor(scaledAmount), minAmount);
  }

  addUser({
    followerCount,
    isInPerson,
  }: {
    followerCount: number;
    isInPerson: boolean;
  }): {
    allocation_wei: bigint;
    remainingTokens: number;
    scalingFactor: number;
  } {
    if (this.remainingRewardTokens <= 0)
      throw new Error("No more tokens available for distribution");

    const category = this.categorizeUser(followerCount, isInPerson);

    const categoryAllocation =
      category === "UNPOPULAR" ? 0 : this.calculateAllocation(category);

    const allocation = Math.min(categoryAllocation, this.remainingRewardTokens);

    const allocation_wei = parseEther(allocation.toString());

    this.remainingRewardTokens -= allocation;
    this.userCount++;

    return {
      allocation_wei,
      remainingTokens: this.remainingRewardTokens,
      scalingFactor: this.calculatePoolScaling(),
    };
  }

  getDistributionStats(): OverallStats {
    const stats: OverallStats = {
      totalUsersServed: this.userCount,
      remainingTokens: this.remainingRewardTokens,
      currentDecayFactor: this.calculateTimeDecay(),
      currentScalingFactor: this.calculatePoolScaling(),
    };

    return stats;
  }
}

export default TokenAllocator;

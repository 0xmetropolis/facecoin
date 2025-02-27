import { Address } from "viem";
import { FACECOIN_TOKEN_ADDRESS } from "./facecoin-token";

export const METAL_API_URL = "https://api.metal.build";

export type Holder = {
  /**
   * The ID of the holder
   */
  id: string;
  /**
   * The Ethereum address of the holder
   * @example "0x1234567890123456789012345678901234567890"
   */
  address: Address;
  /**
   * The token balance amount
   * @example 2000 for 2,000 tokens
   */
  balance: number;
  /**
   * The value in USD
   * @example 20.25 for $20.25
   */
  value: number | null;
};

export type GetTokenHoldersResponse = {
  /**
   * The ID of the token
   */
  id: string;
  /**
   * The Ethereum address of the token
   * @example "0x1234567890123456789012345678901234567890"
   */
  address: Address;
  /**
   * The display name of the token
   * @example "Facecoin"
   */
  name: string;
  /**
   * The ticker symbol of the token
   * @example "FACECOIN"
   */
  symbol: string;
  /**
   * The total token supply
   * @example 1000000
   */
  totalSupply: number;
  /**
   * The initial supply allocated for rewards
   * @example 100000
   */
  startingRewardSupply: number;
  /**
   * The current supply available for rewards
   * @example 95000
   */
  remainingRewardSupply: number;
  /**
   * The supply allocated for merchant rewards
   * @example 50000
   */
  merchantSupply: number;
  /**
   * The Ethereum address of the merchant
   * @example "0x1234567890123456789012345678901234567890"
   */
  merchantAddress: Address;
  /**
   * The token price in USD
   * @example if the value is `$2.50`: 2.50
   */
  price: number | null;
  /**
   * The fee value in USD
   * @example if the value is `$2.50`: 2.50
   */
  feeValue: string;
  /** Array of token holders */
  holders: Holder[];
};

/**
 * Gets the Metal API key from environment variables
 * @throws {Error} If METAL_API_KEY is not defined
 * @returns {string} The Metal API key
 */
const getMetalApiKey = (): string => {
  const apiKey = process.env.METAL_API_KEY;
  if (!apiKey) {
    throw new Error("METAL_API_KEY environment variable is not defined");
  }
  return apiKey;
};

export const getTokenInfo = async () => {
  const response = await fetch(
    `${METAL_API_URL}/token/${FACECOIN_TOKEN_ADDRESS}`,
    {
      headers: {
        "x-api-key": getMetalApiKey(),
      },
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) {
    console.error(await response.json());
    throw new Error("Failed to fetch token info");
  }

  const data = (await response.json()) as GetTokenHoldersResponse;
  return data;
};

export const sendReward = async ({
  to,
  amount,
}: {
  to: Address;
  amount: number;
}): Promise<void> => {
  const response = await fetch(
    `${METAL_API_URL}/token/${FACECOIN_TOKEN_ADDRESS}/reward`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getMetalApiKey(),
      },
      body: JSON.stringify({
        sendTo: to,
        amount,
      }),
    }
  );

  if (response.status !== 202) {
    const error = await response.json();
    throw new Error(error);
  }

  return;
};

export type GetHolderBalanceResponse = {
  /**
   * The display name of the token
   * @example "Facecoin"
   */
  name: string;
  /**
   * The ticker symbol of the token
   * @example "FACECOIN"
   */
  symbol: string;
  /**
   * The unique identifier of the holder
   */
  id: string;
  /**
   * The Ethereum address of the holder
   * @example "0x1234567890123456789012345678901234567890"
   */
  address: Address;
  /**
   * The token balance amount
   * @example if the balance is 2,000 tokens: 2000
   */
  balance: number;
  /**
   * The value in USD
   * @example if the value is `$20.25` USD: 20.25
   */
  value: number | null;
};

export const getHolderBalance = async (
  holderId: string
): Promise<GetHolderBalanceResponse> => {
  const response = await fetch(
    `${METAL_API_URL}/holder/${holderId}/token/${FACECOIN_TOKEN_ADDRESS}`,
    {
      headers: {
        "x-api-key": getMetalApiKey(),
      },
      next: { tags: ["holders"], revalidate: false },
    }
  );

  if (!response.ok) {
    console.log(await response.json());
    throw new Error("Failed to fetch holder balance");
  }

  const data = (await response.json()) as GetHolderBalanceResponse;
  return data;
};

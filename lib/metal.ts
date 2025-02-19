import { Address } from "viem";
import { FACECOIN_TOKEN_ADDRESS } from "./facecoin-token";

export const METAL_API_URL = "https://api.metal.build";

export type Holder = {
  /** the id of the holder */
  id: string;
  /** the address of the holder */
  address: Address;
  /** the balance in wei */
  balance: string;
  /** the value of the holder: in ${dollars}.{cents} format: eg $2.50 */
  value: string;
};

export type GetTokenHoldersResponse = {
  /** the id of the token */
  id: string;
  /** the address of the token */
  address: Address;
  /** the name of the token */
  name: string;
  /** the ticker symbol of the token */
  symbol: string;
  /** the total supply of the token: */
  totalSupply: number;
  /** the starting supply of the token that was available to reward: */
  startingRewardSupply: number;
  /** the supply of the token that is available for rewards: */
  remainingRewardSupply: number;
  /** the supply of the token that is available for merchant rewards: */
  merchantSupply: number;
  /** the address of the merchant that is selling the token */
  merchantAddress: Address;
  /** the price of the token: in ${dollars}.{cents} format: eg $2.50 */
  price: string | null;
  /** the fee value of the token: in ${dollars}.{cents} format: eg $2.50 */
  feeValue: string;
  /** the holders of the token */
  holders: Holder[];
};

const getTokenInfo = async () => {
  const response = await fetch(
    `${METAL_API_URL}/token/${FACECOIN_TOKEN_ADDRESS}`,
    {
      headers: {
        "x-api-key": process.env.METAL_API_KEY!,
      },
      next: { revalidate: 60 },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch token info");

  const data = (await response.json()) as GetTokenHoldersResponse;
  return data;
};

const sendReward = async ({
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
        "x-api-key": process.env.METAL_API_KEY!,
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

type GetHolderBalanceResponse = {
  name: string;
  symbol: string;
  id: string;
  address: Address;
  balance: number;
  value: string | null;
};

const getHolderBalance = async (
  holderId: string
): Promise<GetHolderBalanceResponse> => {
  const response = await fetch(
    `${METAL_API_URL}/token/${FACECOIN_TOKEN_ADDRESS}/holder/${holderId}`,
    {
      headers: {
        "x-api-key": process.env.METAL_API_KEY!,
      },
      next: { tags: ["holders", holderId] },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch holder balance");

  const data = (await response.json()) as GetHolderBalanceResponse;
  return data;
};

export const Metal = {
  getTokenInfo,
  sendReward,
  getHolderBalance,
};

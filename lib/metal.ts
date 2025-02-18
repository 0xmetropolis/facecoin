import { Address } from "viem";
import { FACECOIN_TOKEN_ADDRESS } from "./facecoin-token";

export const METAL_API_URL = "https://staging.api.metal.build";

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
  /** the total supply of the token: in wei */
  totalSupply: string;
  /** the supply of the token that is available for airdrops: in wei */
  airdropSupply: string;
  /** the supply of the token that is available for rewards: in wei */
  rewardSupply: string;
  /** the address of the merchant that is selling the token */
  merchantAddress: Address;
  /** the price of the token: in ${dollars}.{cents} format: eg $2.50 */
  price: string;
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

const sendReward = async ({ to, amount }: { to: Address; amount: number }) => {
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

  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error(error);
  }

  const reward = await response.json();
  return reward;
};

export const Metal = {
  getTokenInfo,
  sendReward,
};

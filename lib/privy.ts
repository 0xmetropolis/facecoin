import { PrivyClient } from "@privy-io/server-auth";

export const PRIVY_ACCESS_TOKEN_NAME = "privy-token";
export const PRIVY_ID_TOKEN_NAME = "privy-id-token";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export default privy;

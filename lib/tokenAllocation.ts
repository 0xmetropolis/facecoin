import { User } from "@/lib/types";
import { parseEther } from "viem";

export const determineTokenAllocation = async (user: User): Promise<string> => {
  console.log(user);
  return parseEther("100").toString();
};

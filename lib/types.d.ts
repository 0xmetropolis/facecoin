import { User as PrismaUser } from "@prisma/client";
import { Address } from "viem";

export type User = PrismaUser & {
  address: Address;
};

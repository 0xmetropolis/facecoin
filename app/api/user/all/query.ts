import prisma from "@/lib/prisma";
import { z } from "zod";

const orderByParamValidation = z.enum([
  "createdAt",
  "updatedAt",
  "tokenAllocation",
  "followerCount",
]);

const queryParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  orderBy: orderByParamValidation.default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export async function getAllUsers(searchParams: URLSearchParams) {
  // Validate query parameters
  const result = queryParamsSchema.safeParse({
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
    orderBy: searchParams.get("orderBy"),
    order: searchParams.get("order"),
  });

  if (!result.success) {
    return {
      error: "Invalid query parameters" as const,
      details: result.error.flatten(),
      status: 400 as const,
    };
  }

  const { limit, offset, orderBy, order } = result.data;

  const queryResponse = await prisma.user
    .findMany({
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: order,
      },
    })
    .catch((e) => {
      console.error(e);
      return { error: "Failed to fetch users" as const, details: e.message };
    });

  if ("error" in queryResponse)
    return {
      ...queryResponse,
      status: 500,
    };

  return queryResponse;
}

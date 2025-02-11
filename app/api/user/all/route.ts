import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "./query";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const response = await getAllUsers(url.searchParams);

  return NextResponse.json(response, {
    status: "status" in response ? response.status : 200,
  });
}

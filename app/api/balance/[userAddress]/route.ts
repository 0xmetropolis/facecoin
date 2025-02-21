import * as Metal from "@/lib/metal";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userAddress: string }> }
) {
  const { userAddress } = await params;

  if (!userAddress) {
    return NextResponse.json(
      { error: "User address is required" },
      { status: 400 }
    );
  }

  const balance = await Metal.getHolderBalance(userAddress);
  return NextResponse.json(balance);
}

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ privyId: string }> }
) {
  const { privyId } = await params;

  if (!privyId)
    return NextResponse.json(
      { error: "no privy id supplied" },
      { status: 400 }
    );

  const user = await prisma.user.findUnique({
    where: {
      privyId: privyId,
    },
  });

  if (!user)
    return NextResponse.json({ error: "no user found" }, { status: 404 });

  return NextResponse.json(user);
}

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId || isNaN(+userId))
    return NextResponse.json({ error: "no userId supplied" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });

  if (!user)
    return NextResponse.json({ error: "no user found" }, { status: 404 });

  return NextResponse.json(user);
}

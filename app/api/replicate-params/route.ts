import redis from "@/lib/redis";
import { styleizeInputSchema, type StyleizePhotoInput } from "@/lib/replicate";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedInput = styleizeInputSchema.parse(body);

    // Save to Redis
    await redis.set(
      "replicate-input-params",
      JSON.stringify({
        ...(validatedInput as StyleizePhotoInput),
        num_outputs: 1,
      })
    );

    return Response.json({
      success: true,
      message: "Parameters updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const params = await redis.get<StyleizePhotoInput>(
      "replicate-input-params"
    );

    if (!params) {
      return Response.json(
        { success: false, error: "No parameters found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: params,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

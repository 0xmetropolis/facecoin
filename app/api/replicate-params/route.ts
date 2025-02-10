import redis from "@/lib/redis";
import { type StyleizePhotoInput } from "@/lib/replicate";
import { z } from "zod";

export const STYLE_OPTIONS = [
  "(No style)",
  "Cinematic",
  "Disney Charactor",
  "Digital Art",
  "Photographic (Default)",
  "Fantasy art",
  "Neonpunk",
  "Enhance",
  "Comic book",
  "Lowpoly",
  "Line art",
] as const;

// Input validation schema
export const styleizeInputSchema = z.object({
  prompt: z.string().min(1),
  num_steps: z.number().int().min(1).max(100),
  style_name: z.enum(STYLE_OPTIONS),
  guidance_scale: z.number().min(1).max(20),
  negative_prompt: z.string(),
  style_strength_ratio: z.number().min(0).max(100),
});

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

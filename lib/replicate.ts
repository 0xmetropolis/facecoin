import Replicate from "replicate";
import { z } from "zod";
import prisma from "./prisma";

export type StyleizePhotoInput = {
  prompt: string;
  num_steps: number;
  style_name: string;
  num_outputs: number;
  guidance_scale: number;
  negative_prompt: string;
  style_strength_ratio: number;
};

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

export const styleizeInputSchema = z.object({
  prompt: z.string().min(1),
  num_steps: z.number().int().min(1).max(100),
  style_name: z.enum(STYLE_OPTIONS),
  guidance_scale: z.number().min(1).max(20),
  negative_prompt: z.string(),
  style_strength_ratio: z.number().min(0).max(100),
});

export const DEFAULT_MODEL_INPUT: StyleizePhotoInput = {
  prompt:
    "same as input image, but anime styled img for a profile picture. perspective from shoulders up",
  num_steps: 20,
  style_name: "(No style)",
  num_outputs: 2,
  guidance_scale: 5,
  negative_prompt:
    "realistic, photo-realistic, worst quality, greyscale, bad anatomy, bad hands, error, text, different angle, different background",
  style_strength_ratio: 27.88,
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  useFileOutput: true,
});

const MAX_RETRY_COUNT = 2;

export const styleizePhoto = async ({
  imgUrl,
  retryCount = 0,
}: {
  imgUrl: string;
  retryCount?: number;
}): Promise<Blob> => {
  if (retryCount > MAX_RETRY_COUNT) throw new Error("Failed to styleize photo");

  // Get the configuration from Prisma
  const config = await prisma.stylizePhotoInput.findUnique({
    where: { id: 1 },
  });

  const input = config || DEFAULT_MODEL_INPUT;

  const output = (await replicate.run(
    "tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769",
    {
      input: {
        ...input,
        input_image: imgUrl,
      },
      wait: { mode: "block", interval: 500, timeout: 60 },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as any;

  return (function () {
    try {
      return output[0].blob();
    } catch (e) {
      console.error("replicate error", e);
      try {
        return output.blob();
      } catch (e) {
        console.error("replicate error 2", e);
        return styleizePhoto({ imgUrl, retryCount: retryCount + 1 });
      }
    }
  })();
};

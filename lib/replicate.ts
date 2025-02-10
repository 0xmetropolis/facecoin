import Replicate from "replicate";
import redis from "./redis";

export type StyleizePhotoInput = {
  prompt: string;
  num_steps: number;
  style_name: string;
  num_outputs: number;
  guidance_scale: number;
  negative_prompt: string;
  style_strength_ratio: number;
};

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

const REPLICATE_INPUT_PARAM_CACHE_KEY = "replicate-input-params";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const styleizePhoto = async ({ imgUrl }: { imgUrl: string }) => {
  const input =
    (await redis.get(REPLICATE_INPUT_PARAM_CACHE_KEY)) || DEFAULT_MODEL_INPUT;

  const output = await replicate.run(
    "tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769",
    {
      input: {
        ...input,
        input_image: imgUrl,
      },
    }
  );

  const [styledImg] = output as [string];

  return styledImg.toString();
};

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const styleizePhoto = async (base64ImgData: string) => {
  const output = await replicate.run(
    "tencentarc/photomaker-style:467d062309da518648ba89d226490e02b8ed09b5abc15026e54e31c5a8cd0769",
    {
      input: {
        prompt:
          "same as input image, but anime styled img for a profile picture. perspective from shoulders up",
        num_steps: 20,
        style_name: "(No style)",
        input_image: base64ImgData,
        num_outputs: 2,
        guidance_scale: 5,
        negative_prompt:
          "realistic, photo-realistic, worst quality, greyscale, bad anatomy, bad hands, error, text, different angle, different background",
        style_strength_ratio: 27.88,
      },
    }
  );

  const [styledImg] = output as [string];

  return styledImg.toString();
};

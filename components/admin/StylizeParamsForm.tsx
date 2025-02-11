"use client";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { useToast } from "@/hooks/use-toast";
import { STYLE_OPTIONS, type StyleizePhotoInput } from "@/lib/replicate";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Toaster } from "../shadcn/toaster";

type Props = {
  initialParams: StyleizePhotoInput;
};

export function StylizeParamsForm({ initialParams }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [params, setParams] = useState<StyleizePhotoInput>(initialParams);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Convert numeric fields to numbers
    const numericFields = [
      "num_steps",
      "num_outputs",
      "guidance_scale",
      "style_strength_ratio",
    ];

    setParams((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) || 0 : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/replicate-params", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: "Settings saved",
        description: "Your style parameters have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update style parameters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            name="prompt"
            value={params.prompt}
            onChange={handleChange}
            placeholder="Enter your prompt"
            required
          />
          <p className="text-sm text-gray-500">
            Prompt. Example: &quot;a photo of a man/woman img&quot;. The phrase
            &quot;img&quot; is the trigger word.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Steps</label>
            <Input
              type="number"
              name="num_steps"
              value={params.num_steps}
              onChange={handleChange}
              min={20}
              max={100}
              required
            />
            <p className="text-sm text-gray-500">
              Number of sample steps: Range: 20-100
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Style Name</label>
            <select
              name="style_name"
              value={params.style_name}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              {STYLE_OPTIONS.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              Style template. The style template will add a style-specific
              prompt and negative prompt to the users prompt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Guidance Scale</label>
            <Input
              type="number"
              name="guidance_scale"
              value={params.guidance_scale}
              onChange={handleChange}
              min={1}
              max={20}
              step="0.1"
              required
            />
            <p className="text-sm text-gray-500">
              Guidance scale. A guidance scale of 1 corresponds to doing no
              classifier free guidance. Range: 1-20
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Style Strength Ratio</label>
            <Input
              type="number"
              name="style_strength_ratio"
              value={params.style_strength_ratio}
              onChange={handleChange}
              min={15}
              max={50}
              required
            />
            <p className="text-sm text-gray-500">
              Style strength (%): Range: 15-50
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Negative Prompt</label>
          <Textarea
            name="negative_prompt"
            value={params.negative_prompt}
            onChange={handleChange}
            placeholder="Elements to exclude from generation"
          />
          <p className="text-sm text-gray-500">
            Negative Prompt. The negative prompt should NOT contain the trigger
            word.
          </p>
        </div>

        <div className="flex gap-2 justify-between">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Parameters"}
          </Button>
          <Link href="/onboard" target="_blank">
            <Button type="button" variant="secondary">
              Try out /onboard <ArrowRight />
            </Button>
          </Link>
        </div>
      </form>
      <Toaster />
    </>
  );
}

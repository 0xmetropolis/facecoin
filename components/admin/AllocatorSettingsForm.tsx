"use client";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AllocatorSettings } from "@/lib/tokenAllocation";
import { useRouter } from "next/navigation";

type FollowerTier = "SUPER" | "HIGH" | "MEDIUM" | "LOW";
type AttendanceType = "IN_PERSON" | "ONLINE";
type CategoryKey = `${FollowerTier}_${AttendanceType}`;

export function AllocatorSettingsForm({
  initialSettings,
}: {
  initialSettings: AllocatorSettings;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<AllocatorSettings>(initialSettings);
  const { toast } = useToast();
  const router = useRouter();

  const handleFollowerTierChange = (tier: FollowerTier, value: string) => {
    setSettings((prev) => ({
      ...prev,
      followerTiers: {
        ...prev.followerTiers,
        [tier]: Number(value) || 0,
      },
    }));
  };

  const handleAllocationChange = (
    category: CategoryKey,
    type: "base" | "minimum",
    value: string
  ) => {
    const field = type === "base" ? "baseAllocations" : "minimumAllocations";
    setSettings((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [category]: Number(value) || 0,
      },
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/allocator/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error);

      router.refresh();

      toast({
        title: "Settings saved",
        description:
          "Token allocation parameters have been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update allocation parameters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Follower Tier Thresholds</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.followerTiers).map(([tier, value]) => (
              <div key={tier} className="space-y-2">
                <label className="text-sm font-medium">{tier}</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleFollowerTierChange(
                      tier as FollowerTier,
                      e.target.value
                    )
                  }
                  min={0}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Base Allocations</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.baseAllocations).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium">
                  {key.replace("_", " ")}
                </label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleAllocationChange(
                      key as CategoryKey,
                      "base",
                      e.target.value
                    )
                  }
                  min={0}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Minimum Allocations</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.minimumAllocations).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium">
                  {key.replace("_", " ")}
                </label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleAllocationChange(
                      key as CategoryKey,
                      "minimum",
                      e.target.value
                    )
                  }
                  min={0}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Decay Factor</label>
          <Input
            type="number"
            value={settings.decayFactor}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                decayFactor: Number(e.target.value) || 0,
              }))
            }
            min={0}
            max={1}
            step={0.01}
            required
          />
          <p className="text-sm text-gray-500">
            Decay factor for time-based reduction (0-1)
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin">
            <Button type="button" variant="secondary">
              <ArrowLeft />
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Parameters"}
          </Button>
        </div>
      </form>
    </>
  );
}

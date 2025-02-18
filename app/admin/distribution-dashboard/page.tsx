import { AllocationSimulation } from "@/components/admin/AllocationSimulation";
import { AllocatorSettingsForm } from "@/components/admin/AllocatorSettingsForm";
import { AllocatorStats } from "@/components/admin/AllocatorStats";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion";
import { protectPageWithAdminAuth } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { AllocatorSettings, DEFAULT_SETTINGS } from "@/lib/tokenAllocation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await protectPageWithAdminAuth({
    callbackToOnComplete: "/admin/distribution-dashboard",
  });

  // Fetch the single configuration record
  const config = (await prisma.allocatorSettings.findUnique({
    where: { id: 1 },
  })) as AllocatorSettings | null;

  const initialSettings = config || DEFAULT_SETTINGS;

  return (
    <div className="container py-8 bg-slate-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">
        Admin - Distribution Dashboard
      </h1>

      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Stats</AccordionTrigger>
          <AccordionContent>
            <AllocatorStats />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            <AllocatorSettingsForm initialSettings={initialSettings} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Simulate</AccordionTrigger>
          <AccordionContent>
            <AllocationSimulation />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

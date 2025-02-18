"use client";

import { SimulationResult } from "@/app/api/allocator/simulate/route";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shadcn/form";
import { Input } from "@/components/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const simulationSchema = z.object({
  targetUserCount: z.coerce.number().min(1, "Must have at least 1 user"),
  inPersonRatio: z.coerce.number().min(0).max(1, "Must be between 0 and 1"),
});

type SimulationForm = z.infer<typeof simulationSchema>;

export function AllocationSimulation() {
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SimulationForm>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      targetUserCount: 5_000,
      inPersonRatio: 0.3,
    },
  });

  async function onSubmit(data: SimulationForm) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/allocator/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Simulation failed");
      }

      setResults(result.simulation);
    } catch (error) {
      console.error("Simulation error:", error);
      // You might want to add error handling UI here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Token Allocation Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <FormField
                control={form.control}
                name="targetUserCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Users</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inPersonRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In-Person Ratio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="col-span-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  "Run Simulation"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          {isLoading ? (
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-4 py-8">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tier</TableHead>
                        <TableHead className="text-right">User Count</TableHead>
                        <TableHead className="text-right">
                          Average Token Allocation
                        </TableHead>
                        <TableHead className="text-right">
                          Lowest Allocation
                        </TableHead>
                        <TableHead className="text-right">
                          Highest Allocation
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(results.tiers).map(([tier, stats]) => (
                        <TableRow key={tier}>
                          <TableCell>{tier}</TableCell>
                          <TableCell className="text-right">
                            {stats.userCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {stats.averageAllocation.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {stats.lowestAllocation.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {stats.highestAllocation.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Tokens Allocated:{" "}
                  {results.totalTokensAllocated.toLocaleString()}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}

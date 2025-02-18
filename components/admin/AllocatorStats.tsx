import { getLiveTokenAllocator } from "@/lib/tokenAllocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";

export async function AllocatorStats() {
  const stats = await getLiveTokenAllocator().then((allocator) =>
    allocator.getDistributionStats()
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Token Allocator Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <StatsItem 
          label="Total Users Served" 
          value={stats.totalUsersServed.toLocaleString()} 
        />
        <StatsItem 
          label="Remaining Tokens" 
          value={stats.remainingTokens.toLocaleString()} 
        />
        <StatsItem 
          label="Current Decay Factor" 
          value={stats.currentDecayFactor.toFixed(4)} 
        />
        <StatsItem 
          label="Current Scaling Factor" 
          value={stats.currentScalingFactor.toFixed(4)} 
        />
      </CardContent>
    </Card>
  );
}

type StatsItemProps = {
  label: string;
  value: string;
};

function StatsItem({ label, value }: StatsItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

import { StatusBar } from "@/components/home/status-bar";
import { UserGrid } from "@/components/home/user-grid";

export default async function Home() {
  return (
    <div className="space-y-8">
      <StatusBar />
      <UserGrid />
    </div>
  );
}

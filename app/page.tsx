import { StatusBar } from "@/components/home/status-bar";
import { UserGrid } from "@/components/home/user-grid";

async function handleQueryParams(searchParams: Promise<{ search?: string }>) {
  const query = (await searchParams).search?.replace("@", "") || "";
  return query;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const query = await handleQueryParams(searchParams);

  return (
    <div className="space-y-8">
      <StatusBar />
      <UserGrid query={query} />
    </div>
  );
}

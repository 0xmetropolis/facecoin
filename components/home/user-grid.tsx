import { Suspense } from "react";
import { LoadingAvatar } from "../avatar/avatar";
import { SuspendedUserGrid } from "./suspended-user-grid";
import { SearchInput } from "./search-bar";

export async function UserGrid({ query }: { query: string }) {
  return (
    <div>
      <SearchInput />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[600px] mx-auto justify-items-center">
        <Suspense
          fallback={Array(6)
            .fill(0)
            .map((_, i) => (
              <LoadingAvatar key={i} />
            ))}
        >
          <SuspendedUserGrid searchTerm={query} />
        </Suspense>
      </div>
    </div>
  );
}

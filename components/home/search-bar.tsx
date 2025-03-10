"use client";

import { useDebounce } from "@/lib/hooks/use-debounce";
import { Input } from "../shadcn/input";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const SearchInput = ({ userCount }: { userCount: number }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");

    const nextUrl = `${pathname}?${params.toString()}`;
    replace(nextUrl);
  }, [debouncedSearch, pathname, replace, searchParams]);

  return (
    <div className="flex flex-col gap-2 mb-4 items-center">
      <Input
        placeholder="Search users..."
        onChange={(e) => setSearchTerm(e.target.value)}
        defaultValue={searchParams.get("search") || ""}
        className="max-w-[600px] mx-auto"
      />
      <p className="text-sm text-gray-500">
        Showing top 20 of <b>{userCount}</b> users. Search to find more...
      </p>
    </div>
  );
};

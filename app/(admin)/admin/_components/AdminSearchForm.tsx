"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminSearchForm({ defaultValue, placeholder }: { defaultValue: string; placeholder: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParams = searchParams.toString();
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(currentParams);
      if (query.trim()) params.set("q", query.trim());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [currentParams, pathname, query, router]);

  return (
    <div className="admin-search-form">
      <input
        name="q"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={query}
      />
    </div>
  );
}

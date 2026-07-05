"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminSearchForm({ defaultValue, placeholder }: { defaultValue: string; placeholder: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router]);

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

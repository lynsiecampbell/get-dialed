import { useState, useMemo } from "react";

interface SortConfig<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

export function useSort<T>(items: T[], initialKey?: keyof T, initialDirection: "asc" | "desc" = "asc") {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialKey ? { key: initialKey, direction: initialDirection } : null
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;
      if (sortConfig.direction === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}

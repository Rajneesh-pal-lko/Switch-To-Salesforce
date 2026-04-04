"use client";

import { SearchDialog } from "@/components/search-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <SearchDialog />
      <ThemeToggle />
    </div>
  );
}

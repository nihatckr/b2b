import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Card } from "./card";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex flex-wrap items-center gap-4">
        {children}
      </div>
    </Card>
  );
}

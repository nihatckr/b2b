import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface InfoItemProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function InfoItem({
  label,
  value,
  icon: Icon,
  className,
  orientation = "vertical",
}: InfoItemProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("flex items-center justify-between gap-4", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{label}</span>
        </div>
        <div className="font-medium">{value}</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

interface InfoGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function InfoGrid({
  children,
  columns = 2,
  className,
}: InfoGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface InfoCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function InfoCard({
  title,
  icon: Icon,
  children,
  className,
  headerAction,
}: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export interface InfoGridProps {
  items: {
    label: string;
    value: string | number | null | undefined;
    icon?: LucideIcon;
    colorClass?: string;
  }[];
  columns?: 1 | 2 | 3 | 4;
}

export function InfoGrid({ items, columns = 2 }: InfoGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              item.colorClass || "bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              {Icon && <Icon className="h-3 w-3" />}
              {item.label}
            </div>
            <p className="font-semibold">
              {item.value !== null && item.value !== undefined ? (
                item.value
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

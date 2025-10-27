import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface DetailRowProps {
  label: string;
  value?: string | number | null;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  valueClassName?: string;
  children?: React.ReactNode;
}

export function DetailRow({
  label,
  value,
  icon: Icon,
  badge,
  valueClassName,
  children,
}: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className={`font-medium ${valueClassName || ""}`}>
        {children ? (
          children
        ) : badge ? (
          <Badge variant={badge.variant}>{badge.text}</Badge>
        ) : value !== null && value !== undefined ? (
          value
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
    </div>
  );
}

export interface DetailSectionProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  icon: Icon,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      {title && (
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

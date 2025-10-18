import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import { ComponentProps } from "react";
import { Badge, badgeVariants } from "./badge";

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

interface StatusBadgeProps extends Omit<ComponentProps<typeof Badge>, 'variant'> {
  status: string;
  icon?: LucideIcon;
  customVariant?: BadgeVariant;
  statusMap?: Record<string, {
    variant: BadgeVariant;
    label?: string;
  }>;
}

// Default status mappings
const defaultStatusMap: Record<string, {
  variant: BadgeVariant;
  label?: string;
}> = {
  // Sample statuses
  PENDING: { variant: "secondary" },
  PENDING_APPROVAL: { variant: "secondary", label: "Pending Approval" },
  APPROVED: { variant: "default" },
  IN_PROGRESS: { variant: "default", label: "In Progress" },
  COMPLETED: { variant: "default" },
  REJECTED: { variant: "destructive" },
  CANCELLED: { variant: "destructive" },
  ON_HOLD: { variant: "secondary", label: "On Hold" },

  // Order statuses
  CONFIRMED: { variant: "default" },
  SHIPPED: { variant: "default" },
  DELIVERED: { variant: "default" },  // Production stages
  PLANNING: { variant: "secondary" },
  FABRIC: { variant: "default" },
  CUTTING: { variant: "default" },
  SEWING: { variant: "default" },
  QUALITY: { variant: "default" },
  PACKAGING: { variant: "default" },
  SHIPPING: { variant: "default" },

  // Task statuses
  TODO: { variant: "secondary" },
  DONE: { variant: "default" },

  // Default
  DEFAULT: { variant: "outline" },
};

export function StatusBadge({
  status,
  icon: Icon,
  customVariant,
  statusMap,
  className,
  ...props
}: StatusBadgeProps) {
  const map = statusMap || defaultStatusMap;
  const config = map[status] || map.DEFAULT || { variant: "outline" };
  const variant = customVariant || config.variant;
  const label = config.label || status.replace(/_/g, " ");

  return (
    <Badge variant={variant} className={cn("gap-1", className)} {...props}>
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

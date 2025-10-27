import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface StatsCardProps {
  /**
   * Title of the stat
   */
  title: string;

  /**
   * Main value to display
   */
  value: string | number;

  /**
   * Optional description/subtitle
   */
  description?: string;

  /**
   * Icon to display in the header
   */
  icon?: React.ReactNode;

  /**
   * Optional color for the value text
   */
  valueColor?: string;

  /**
   * Optional className for customization
   */
  className?: string;

  /**
   * Whether to show the card in a compact layout
   */
  compact?: boolean;
}

/**
 * StatsCard Component
 *
 * Reusable statistics card with icon, title, value, and description.
 * Perfect for dashboard metrics and key performance indicators.
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Users"
 *   value={245}
 *   description="Active users"
 *   icon={<Users className="h-4 w-4 text-muted-foreground" />}
 *   valueColor="text-green-600"
 * />
 * ```
 */
export function StatsCard({
  title,
  value,
  description,
  icon,
  valueColor,
  className = "",
  compact = false,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader
        className={`flex flex-row items-center justify-between space-y-0 ${
          compact ? "pb-2" : "pb-4"
        }`}
      >
        <CardTitle
          className={`${compact ? "text-sm" : "text-base"} font-medium`}
        >
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div
          className={`${compact ? "text-2xl" : "text-3xl"} font-bold ${
            valueColor || ""
          }`}
        >
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  /**
   * Array of stat items to display
   */
  stats: Omit<StatsCardProps, "compact">[];

  /**
   * Number of columns in the grid (responsive)
   * @default "md:grid-cols-2 lg:grid-cols-4"
   */
  columns?: string;

  /**
   * Whether to use compact layout for all cards
   */
  compact?: boolean;

  /**
   * Optional className for the grid container
   */
  className?: string;
}

/**
 * StatsGrid Component
 *
 * Container for multiple StatsCard components with responsive grid layout.
 *
 * @example
 * ```tsx
 * <StatsGrid
 *   stats={[
 *     { title: "Total Users", value: 245, icon: <Users /> },
 *     { title: "Active", value: 198, icon: <UserCheck />, valueColor: "text-green-600" },
 *     { title: "Pending", value: 47, icon: <Clock />, valueColor: "text-yellow-600" },
 *   ]}
 * />
 * ```
 */
export function StatsGrid({
  stats,
  columns = "md:grid-cols-2 lg:grid-cols-4",
  compact = true,
  className = "",
}: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 ${columns} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} compact={compact} />
      ))}
    </div>
  );
}

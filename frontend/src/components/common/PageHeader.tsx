import React from "react";

interface PageHeaderProps {
  /**
   * Main title of the page
   */
  title: string;

  /**
   * Optional subtitle/description
   */
  description?: string;

  /**
   * Optional icon to display next to title
   */
  icon?: React.ReactNode;

  /**
   * Optional action button(s) on the right
   */
  action?: React.ReactNode;

  /**
   * Optional custom className for the container
   */
  className?: string;
}

/**
 * PageHeader Component
 *
 * Reusable page header with title, description, icon, and action buttons.
 * Provides consistent layout across all pages.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="User Management"
 *   description="View and manage all users"
 *   icon={<Users className="w-8 h-8" />}
 *   action={
 *     <Button onClick={() => setShowModal(true)}>
 *       <Plus className="w-4 h-4" />
 *       New User
 *     </Button>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  icon,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

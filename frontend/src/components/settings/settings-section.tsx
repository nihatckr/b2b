/**
 * SettingsSection Component
 *
 * Reusable section wrapper with Separator and optional title
 * Used to visually separate different sections within a settings card
 *
 * @example
 * <SettingsSection title="Profile Picture">
 *   <FormImageUpload ... />
 * </SettingsSection>
 */

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hideSeparator?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  hideSeparator = false,
}: SettingsSectionProps) {
  return (
    <>
      {!hideSeparator && <Separator />}
      <div className={cn("space-y-4", className)}>
        {title && (
          <div className="mb-4">
            <h3 className="text-sm font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </>
  );
}

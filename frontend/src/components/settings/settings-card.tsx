/**
 * SettingsCard Component
 *
 * Reusable card wrapper for settings sections with consistent styling
 * Includes Card, CardHeader, CardTitle, CardDescription, and Form integration
 *
 * @example
 * <SettingsCard
 *   title="Profile Information"
 *   description="Update your personal information"
 *   form={profileForm}
 *   onSubmit={onProfileSubmit}
 *   isLoading={isLoading}
 *   submitLabel="Save Profile"
 * >
 *   <FormInput name="name" label="Name" />
 * </SettingsCard>
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";

interface SettingsCardProps<T extends Record<string, any>> {
  title: string;
  description?: string;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  submitIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  hideSubmitButton?: boolean;
}

export function SettingsCard<T extends Record<string, any>>({
  title,
  description,
  form,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Changes",
  submitIcon = <Save className="mr-2 h-4 w-4" />,
  children,
  className,
  hideSubmitButton = false,
}: SettingsCardProps<T>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {children}

            {!hideSubmitButton && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      {submitIcon}
                      {submitLabel}
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

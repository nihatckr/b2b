"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  description?: string;
  options: Option[];
  disabled?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function FormCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  options,
  disabled = false,
  className,
  orientation = "vertical",
}: FormCheckboxGroupProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-3", className)}>
          <FormLabel className="text-base font-medium">{label}</FormLabel>
          <FormControl>
            <div
              className={cn(
                "space-y-2",
                orientation === "horizontal" && "flex flex-wrap gap-6 space-y-0"
              )}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${name}-${option.value}`}
                    checked={field.value?.includes(option.value) || false}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || [];
                      if (checked) {
                        field.onChange([...currentValue, option.value]);
                      } else {
                        field.onChange(
                          currentValue.filter(
                            (val: string) => val !== option.value
                          )
                        );
                      }
                    }}
                    disabled={disabled || option.disabled}
                  />
                  <label
                    htmlFor={`${name}-${option.value}`}
                    className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      (disabled || option.disabled) && "opacity-50"
                    )}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

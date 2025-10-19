import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled = false,
  className,
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Ensure value is always a string to prevent uncontrolled -> controlled transition
        const controlledField = {
          ...field,
          value: field.value ?? "",
        };

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...controlledField}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

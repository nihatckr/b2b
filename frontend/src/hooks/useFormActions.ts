import { useCallback } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

interface UseFormActionsOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onReset?: () => void;
}

interface UseFormActionsReturn {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleReset: () => void;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Custom hook for managing form actions
 * @param options - Form instance and handlers
 * @returns Object with form action handlers and state
 */
export function useFormActions<T extends FieldValues>({
  form,
  onSubmit,
  onReset,
}: UseFormActionsOptions<T>): UseFormActionsReturn {
  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      await form.handleSubmit(onSubmit)(e);
    },
    [form, onSubmit]
  );

  const handleReset = useCallback(() => {
    form.reset();
    if (onReset) {
      onReset();
    }
  }, [form, onReset]);

  return {
    handleSubmit,
    handleReset,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
  };
}

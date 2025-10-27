import { useState } from "react";
import { toast } from "sonner";

interface UseMutationStateOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

interface UseMutationStateReturn {
  isLoading: boolean;
  error: Error | null;
  execute: <T = any>(
    mutationFn: () => Promise<T>,
    options?: UseMutationStateOptions
  ) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for managing mutation state with toast notifications
 * @returns Object with loading state, error, and execute function
 */
export function useMutationState(): UseMutationStateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async <T = any>(
    mutationFn: () => Promise<T>,
    options?: UseMutationStateOptions
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn();

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      if (options?.onSuccess) {
        await options.onSuccess();
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);

      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      } else {
        toast.error(error.message);
      }

      if (options?.onError) {
        options.onError(error);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    execute,
    reset,
  };
}

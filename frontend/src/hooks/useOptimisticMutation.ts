/**
 * Optimistic Mutation Hook with Refetch
 *
 * Handles common mutation patterns:
 * - Execute mutation
 * - Show toast notifications
 * - Refetch queries with network-only policy
 * - Error handling
 */

import { useCallback } from "react";
import { toast } from "sonner";
import type { AnyVariables, OperationResult, UseMutationResponse } from "urql";

export interface OptimisticMutationOptions<T = any, V extends AnyVariables = AnyVariables> {
  /**
   * URQL mutation hook result
   */
  mutation: UseMutationResponse<T, V>;

  /**
   * Success message
   */
  successMessage: string;

  /**
   * Error message (or function to generate from error)
   */
  errorMessage: string | ((error: any) => string);

  /**
   * Queries to refetch after successful mutation
   */
  refetchQueries?: Array<{
    refetch: (opts?: any) => void;
    requestPolicy?: "cache-first" | "cache-only" | "network-only" | "cache-and-network";
  }>;

  /**
   * Callback after successful mutation (before refetch)
   */
  onSuccess?: (data: T) => void | Promise<void>;

  /**
   * Callback on error
   */
  onError?: (error: any) => void | Promise<void>;

  /**
   * Log mutation details to console
   */
  debug?: boolean;
}

/**
 * Execute mutation with optimistic UI updates
 *
 * @example
 * ```tsx
 * const [, deleteUserMutation] = useMutation(DeleteUserDocument);
 *
 * const executeDelete = useOptimisticMutation({
 *   mutation: [, deleteUserMutation],
 *   successMessage: "Kullanıcı silindi",
 *   errorMessage: "Kullanıcı silinemedi",
 *   refetchQueries: [
 *     { refetch: refetchUsers, requestPolicy: "network-only" },
 *     { refetch: refetchStats, requestPolicy: "network-only" }
 *   ]
 * });
 *
 * await executeDelete({ id: userId });
 * ```
 */
export function useOptimisticMutation<T = any, V extends AnyVariables = AnyVariables>(
  options: OptimisticMutationOptions<T, V>
) {
  const {
    mutation,
    successMessage,
    errorMessage,
    refetchQueries = [],
    onSuccess,
    onError,
    debug = false,
  } = options;

  const [mutationState, executeMutation] = mutation;

  const execute = useCallback(
    async (variables: V): Promise<OperationResult<T, V>> => {
      if (debug) {
        console.log("🚀 Executing mutation:", variables);
      }

      // Execute mutation
      const result = await executeMutation(variables);

      // Handle error
      if (result.error) {
        const message =
          typeof errorMessage === "function"
            ? errorMessage(result.error)
            : errorMessage;

        console.error("❌ Mutation error:", result.error);
        toast.error("Hata", { description: message });

        if (onError) {
          await onError(result.error);
        }

        return result;
      }

      // Handle success
      if (debug) {
        console.log("✅ Mutation success:", result.data);
      }

      toast.success("Başarılı", { description: successMessage });

      if (onSuccess && result.data) {
        await onSuccess(result.data);
      }

      // Refetch queries in parallel
      if (refetchQueries.length > 0) {
        if (debug) {
          console.log("🔄 Refetching queries...");
        }

        await Promise.all(
          refetchQueries.map(({ refetch, requestPolicy = "network-only" }) =>
            refetch({ requestPolicy })
          )
        );

        if (debug) {
          console.log("✅ Refetch complete");
        }
      }

      return result;
    },
    [
      executeMutation,
      successMessage,
      errorMessage,
      refetchQueries,
      onSuccess,
      onError,
      debug,
    ]
  );

  return {
    execute,
    loading: mutationState.fetching,
    error: mutationState.error,
    data: mutationState.data,
  };
}

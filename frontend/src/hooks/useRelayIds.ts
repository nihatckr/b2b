/**
 * Relay Global ID Utilities Hook
 *
 * Pothos GraphQL uses Relay Global Object Identification pattern.
 * IDs are Base64 encoded strings in format: "TypeName:numericId"
 * Example: "Q29tcGFueTox" decodes to "Company:1"
 */

import { useCallback } from "react";

export interface RelayIdHelpers {
  /**
   * Decode Relay Global ID to numeric ID
   * @param globalId - Base64 encoded Global ID (e.g., "Q29tcGFueTox")
   * @returns Numeric ID or null if invalid
   */
  decodeGlobalId: (globalId: string) => number | null;

  /**
   * Encode numeric ID to Relay Global ID
   * @param typeName - GraphQL type name (e.g., "Company", "User")
   * @param numericId - Numeric database ID
   * @returns Base64 encoded Global ID
   */
  encodeGlobalId: (typeName: string, numericId: number) => string;

  /**
   * Find Global ID from numeric ID in a list
   * @param items - Array of items with id field
   * @param numericId - Numeric ID to search for
   * @returns Global ID string or undefined
   */
  findGlobalIdByNumericId: <T extends { id: string }>(
    items: T[] | undefined,
    numericId: number | null
  ) => string | undefined;

  /**
   * Batch decode multiple Global IDs
   * @param globalIds - Array of Global IDs
   * @returns Array of numeric IDs (null for invalid)
   */
  decodeGlobalIds: (globalIds: string[]) => (number | null)[];

  /**
   * Extract type name from Global ID
   * @param globalId - Base64 encoded Global ID
   * @returns Type name or null
   */
  getTypeName: (globalId: string) => string | null;
}

/**
 * Hook for working with Relay Global IDs
 *
 * @example
 * ```tsx
 * const { decodeGlobalId, encodeGlobalId, findGlobalIdByNumericId } = useRelayIds();
 *
 * // Decode for mutations
 * const numericId = decodeGlobalId(user.id);
 * await deleteUser({ id: numericId });
 *
 * // Encode for queries
 * const globalId = encodeGlobalId("User", 123);
 *
 * // Find in dropdowns
 * const companyGlobalId = findGlobalIdByNumericId(companies, user.companyId);
 * ```
 */
export function useRelayIds(): RelayIdHelpers {
  const decodeGlobalId = useCallback((globalId: string): number | null => {
    try {
      // Decode base64
      const decoded = atob(globalId);
      // Format is "TypeName:id", extract the numeric part
      const parts = decoded.split(":");
      if (parts.length === 2) {
        const numericId = parseInt(parts[1], 10);
        return isNaN(numericId) ? null : numericId;
      }
      return null;
    } catch (e) {
      console.error("Failed to decode global ID:", globalId, e);
      return null;
    }
  }, []);

  const encodeGlobalId = useCallback(
    (typeName: string, numericId: number): string => {
      return btoa(`${typeName}:${numericId}`);
    },
    []
  );

  const findGlobalIdByNumericId = useCallback(
    <T extends { id: string }>(
      items: T[] | undefined,
      numericId: number | null
    ): string | undefined => {
      if (!numericId || !items) return undefined;
      return items.find((item) => {
        const decodedId = decodeGlobalId(item.id);
        return decodedId === numericId;
      })?.id;
    },
    [decodeGlobalId]
  );

  const decodeGlobalIds = useCallback(
    (globalIds: string[]): (number | null)[] => {
      return globalIds.map(decodeGlobalId);
    },
    [decodeGlobalId]
  );

  const getTypeName = useCallback((globalId: string): string | null => {
    try {
      const decoded = atob(globalId);
      const parts = decoded.split(":");
      return parts.length === 2 ? parts[0] : null;
    } catch (e) {
      console.error("Failed to extract type name:", globalId, e);
      return null;
    }
  }, []);

  return {
    decodeGlobalId,
    encodeGlobalId,
    findGlobalIdByNumericId,
    decodeGlobalIds,
    getTypeName,
  };
}

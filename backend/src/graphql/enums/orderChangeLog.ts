import { builder } from "../builder";

/**
 * Order Change Log Status Enum
 * Represents the manufacturer's response status to order changes
 */
export const OrderChangeLogStatus = builder.enumType("OrderChangeLogStatus", {
  values: [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "NEEDS_NEGOTIATION"
  ] as const,
});

/**
 * Order Change Type Enum
 * Represents the type of change made to an order
 */
export const OrderChangeType = builder.enumType("OrderChangeType", {
  values: [
    "QUANTITY",
    "PRICE",
    "DEADLINE",
    "SPECIFICATIONS",
    "NOTES",
    "OTHER"
  ] as const,
});

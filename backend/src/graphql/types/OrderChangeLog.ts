/**
 * OrderChangeLog GraphQL Type
 *
 * Handles order modification tracking and manufacturer responses to changes
 */

import { builder } from "../builder";
import { OrderChangeLogStatus, OrderChangeType } from "../enums";

/**
 * OrderChangeLog Type
 *
 * Tracks all changes made to orders and manufacturer responses
 */
builder.prismaObject("OrderChangeLog", {
  fields: (t) => ({
    id: t.exposeID("id"),
    orderId: t.exposeInt("orderId"),
    changedBy: t.exposeInt("changedBy"),

    // Using enums for better type safety
    changeType: t.field({
      type: OrderChangeType,
      resolve: (log) => log.changeType as any,
    }),

    // JSON değerler
    previousValues: t.expose("previousValues", { type: "JSON" }),
    newValues: t.expose("newValues", { type: "JSON" }),

    changeReason: t.exposeString("changeReason", { nullable: true }),

    // Üretici yanıtı - using enum
    manufacturerStatus: t.field({
      type: OrderChangeLogStatus,
      resolve: (log) => log.manufacturerStatus as any,
    }),
    manufacturerResponse: t.exposeString("manufacturerResponse", { nullable: true }),
    manufacturerReviewedAt: t.expose("manufacturerReviewedAt", { type: "DateTime", nullable: true }),
    manufacturerReviewedBy: t.exposeInt("manufacturerReviewedBy", { nullable: true }),

    // Pazarlık tetikleme
    negotiationTriggered: t.exposeBoolean("negotiationTriggered"),
    negotiationId: t.exposeInt("negotiationId", { nullable: true }),

    createdAt: t.expose("createdAt", { type: "DateTime" }),

    // Relations
    order: t.relation("order"),
    changedByUser: t.relation("changedByUser"),
    reviewedByUser: t.relation("reviewedByUser", { nullable: true }),
    relatedNegotiation: t.relation("relatedNegotiation", { nullable: true }),
  }),
});

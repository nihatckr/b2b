/**
 * PubSub System for Real-Time Subscriptions
 *
 * This module provides a type-safe publish/subscribe system for GraphQL subscriptions.
 * It's used for real-time features like notifications, task updates, and production status changes.
 */

import { createPubSub } from "graphql-yoga";

/**
 * Event Channel Configuration
 *
 * Define all subscription events with their payload types here.
 * This ensures type safety across the application.
 */
export type PubSubChannels = {
  // ========================================
  // NOTIFICATION EVENTS
  // ========================================
  /**
   * Fired when a new notification is created for a user
   * @param userId - Target user ID
   * @param payload - Notification data
   */
  "notification:new": [userId: number, payload: NotificationPayload];

  /**
   * Fired when a notification is marked as read
   * @param userId - Target user ID
   * @param payload - Notification ID and read status
   */
  "notification:read": [userId: number, payload: { notificationId: number; isRead: boolean }];

  // ========================================
  // TASK EVENTS
  // ========================================
  /**
   * Fired when a task is created
   * @param userId - Assigned user ID
   * @param payload - Task data
   */
  "task:created": [userId: number, payload: TaskPayload];

  /**
   * Fired when a task status changes
   * @param taskId - Task ID
   * @param payload - Task update data
   */
  "task:statusChanged": [taskId: number, payload: TaskStatusPayload];

  /**
   * Fired when a task is assigned to a user
   * @param userId - Assigned user ID
   * @param payload - Task data
   */
  "task:assigned": [userId: number, payload: TaskPayload];

  /**
   * Fired when a task priority changes
   * @param taskId - Task ID
   * @param payload - Priority update
   */
  "task:priorityChanged": [taskId: number, payload: { taskId: number; priority: string }];

  // ========================================
  // PRODUCTION TRACKING EVENTS
  // ========================================
  /**
   * Fired when production status changes
   * @param productionId - Production tracking ID
   * @param payload - Production status update
   */
  "production:statusChanged": [productionId: number, payload: ProductionStatusPayload];

  /**
   * Fired when a production stage is updated
   * @param productionId - Production tracking ID
   * @param payload - Stage update data
   */
  "production:stageUpdated": [productionId: number, payload: ProductionStagePayload];

  /**
   * Fired when quality control is performed
   * @param productionId - Production tracking ID
   * @param payload - QC result
   */
  "production:qualityControl": [productionId: number, payload: QualityControlPayload];

  // ========================================
  // MESSAGE EVENTS
  // ========================================
  /**
   * Fired when a new message is sent
   * @param productId - Related product ID
   * @param payload - Message data
   */
  "message:new": [productId: number, payload: MessagePayload];

  /**
   * Fired when a message is marked as read
   * @param productId - Related product ID
   * @param payload - Message read status
   */
  "message:read": [productId: number, payload: MessageReadPayload];

  /**
   * Fired when user receives a new message
   * @param userId - Receiver user ID
   * @param payload - Message data
   */
  "message:userReceived": [userId: number, payload: MessagePayload];

  // ========================================
  // SAMPLE EVENTS
  // ========================================
  /**
   * Fired when sample status changes
   * @param sampleId - Sample ID
   * @param payload - Sample status update
   */
  "sample:statusChanged": [sampleId: number, payload: SampleStatusPayload];

  /**
   * Fired when manufacturer sends a quote for sample
   * @param sampleId - Sample ID
   * @param payload - Quote data
   */
  "sample:quoteReceived": [sampleId: number, payload: SampleQuotePayload];

  /**
   * Fired when sample is shipped
   * @param sampleId - Sample ID
   * @param payload - Shipment data
   */
  "sample:shipped": [sampleId: number, payload: SampleShippedPayload];

  /**
   * Fired when user's samples are updated
   * @param userId - User ID (customer or manufacturer)
   * @param payload - Sample status update
   */
  "sample:userUpdates": [userId: number, payload: SampleStatusPayload];

  // ========================================
  // ORDER EVENTS
  // ========================================
  /**
   * Fired when order status changes (enhanced version)
   * @param orderId - Order ID
   * @param payload - Order status update
   */
  "order:statusChanged": [orderId: number, payload: OrderStatusPayload];

  /**
   * Fired when customer/manufacturer sends a quote
   * @param orderId - Order ID
   * @param payload - Quote data
   */
  "order:quoteReceived": [orderId: number, payload: OrderQuotePayload];

  /**
   * Fired when order is shipped
   * @param orderId - Order ID
   * @param payload - Shipment data
   */
  "order:shipped": [orderId: number, payload: OrderShippedPayload];

  /**
   * Fired when user's orders are updated
   * @param userId - User ID (customer or manufacturer)
   * @param payload - Order status update
   */
  "order:userUpdates": [userId: number, payload: OrderStatusPayload];
};

// ========================================
// PAYLOAD TYPE DEFINITIONS
// ========================================

export interface NotificationPayload {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  actionUrl?: string | null;
  createdAt: Date;
}

export interface TaskPayload {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  assignedUserId?: number | null;
  createdById?: number | null;
  productionTrackingId?: number | null;
  orderId?: number | null;
  sampleId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStatusPayload {
  taskId: number;
  status: string;
  previousStatus: string;
  updatedAt: Date;
  updatedBy?: number | null;
}

export interface ProductionStatusPayload {
  productionId: number;
  status: string;
  previousStatus: string;
  currentStage?: string | null;
  estimatedCompletion?: Date | null;
  actualCompletion?: Date | null;
  updatedAt: Date;
}

export interface ProductionStagePayload {
  productionId: number;
  stage: string;
  status: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  notes?: string | null;
  updatedBy?: number | null;
  updatedAt: Date;
}

export interface QualityControlPayload {
  id: number;
  productionId: number;
  controlType: string;
  result: string;
  defects?: number | null;
  notes?: string | null;
  inspectedBy?: number | null;
  inspectedAt: Date;
}

export interface OrderStatusPayload {
  orderId: number;
  orderNumber?: string | null;
  status: string;
  previousStatus: string;
  updatedAt: Date;
  updatedBy?: number | null;
}

export interface MessageReadPayload {
  messageId: number;
  isRead: boolean;
  readAt: Date;
}

export interface MessagePayload {
  id: number;
  content: string;
  productId: number;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: Date;
}

export interface SampleStatusPayload {
  sampleId: number;
  status: string;
  previousStatus: string;
  sampleNumber?: string | null;
  updatedAt: Date;
  updatedBy?: number | null;
}

export interface SampleQuotePayload {
  sampleId: number;
  sampleNumber?: string | null;
  quotedPrice?: number | null;
  quotedDays?: number | null;
  quoteNote?: string | null;
  quotedBy: number;
  quotedAt: Date;
}

export interface SampleShippedPayload {
  sampleId: number;
  sampleNumber?: string | null;
  cargoTrackingNumber?: string | null;
  shippedAt: Date;
  estimatedDelivery?: Date | null;
}

export interface OrderQuotePayload {
  orderId: number;
  orderNumber?: string | null;
  quotedPrice?: number | null;
  quotedDays?: number | null;
  quoteNote?: string | null;
  quoteType?: string | null;
  quotedBy: number;
  quotedAt: Date;
}

export interface OrderShippedPayload {
  orderId: number;
  orderNumber?: string | null;
  cargoTrackingNumber?: string | null;
  shippedAt: Date;
  deliveryAddress?: string | null;
  estimatedDelivery?: Date | null;
}

/**
 * Centralized PubSub instance
 *
 * Use this singleton instance throughout the application to publish and subscribe to events.
 *
 * @example
 * ```typescript
 * // Publish a notification
 * pubsub.publish('notification:new', userId, {
 *   id: 1,
 *   userId,
 *   title: 'New Task',
 *   message: 'You have been assigned a new task',
 *   type: 'TASK',
 *   isRead: false,
 *   createdAt: new Date()
 * });
 *
 * // Subscribe to notifications
 * const notificationStream = pubsub.subscribe('notification:new', userId);
 * for await (const notification of notificationStream) {
 *   console.log('New notification:', notification);
 * }
 * ```
 */
export const pubsub = createPubSub<PubSubChannels>();

export default pubsub;

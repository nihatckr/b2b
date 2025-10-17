import type { PrismaClient } from "../generated/prisma";
import { createNotification } from "./notificationHelper";
import { NotificationTemplates } from "./notificationTemplates";

/**
 * Notify all parties involved in an order
 * @param excludeUserId - Don't notify this user (usually the one who triggered the action)
 */
export async function notifyOrderParties(
  prisma: PrismaClient,
  order: {
    id: number;
    orderNumber: string;
    customerId: number;
    manufactureId: number | null;
  },
  templateKey: keyof typeof NotificationTemplates.ORDER,
  templateArgs?: any,
  excludeUserId?: number
) {
  const template =
    typeof NotificationTemplates.ORDER[templateKey] === "function"
      ? (NotificationTemplates.ORDER[templateKey] as any)(...(templateArgs || [order.orderNumber]))
      : NotificationTemplates.ORDER[templateKey];

  const recipients = [order.customerId, order.manufactureId].filter(
    (id): id is number => id !== null && id !== excludeUserId
  );

  for (const userId of recipients) {
    await createNotification(prisma, {
      type: "ORDER",
      title: template.title,
      message: template.message,
      userId,
      link: `/dashboard/orders/${order.id}`,
      orderId: order.id,
    });
  }
}

/**
 * Notify all parties involved in a sample
 * @param excludeUserId - Don't notify this user (usually the one who triggered the action)
 */
export async function notifySampleParties(
  prisma: PrismaClient,
  sample: {
    id: number;
    sampleNumber: string;
    customerId: number;
    manufactureId: number | null;
  },
  templateKey: keyof typeof NotificationTemplates.SAMPLE,
  templateArgs?: any,
  excludeUserId?: number
) {
  const template =
    typeof NotificationTemplates.SAMPLE[templateKey] === "function"
      ? (NotificationTemplates.SAMPLE[templateKey] as any)(...(templateArgs || [sample.sampleNumber]))
      : NotificationTemplates.SAMPLE[templateKey];

  const recipients = [sample.customerId, sample.manufactureId].filter(
    (id): id is number => id !== null && id !== excludeUserId
  );

  for (const userId of recipients) {
    await createNotification(prisma, {
      type: "SAMPLE",
      title: template.title,
      message: template.message,
      userId,
      link: `/dashboard/samples/${sample.id}`,
      sampleId: sample.id,
    });
  }
}

/**
 * Notify parties about production tracking updates
 */
export async function notifyProductionUpdate(
  prisma: PrismaClient,
  tracking: {
    id: number;
    orderId: number | null;
    sampleId: number | null;
  },
  order: {
    id: number;
    orderNumber: string;
    customerId: number;
    manufactureId: number;
  } | null,
  sample: {
    id: number;
    sampleNumber: string;
    customerId: number;
    manufactureId: number;
  } | null,
  templateKey: keyof typeof NotificationTemplates.PRODUCTION,
  templateArgs: any[],
  excludeUserId?: number
) {
  const template = (NotificationTemplates.PRODUCTION[templateKey] as any)(
    ...templateArgs
  );

  const entity = order || sample;
  if (!entity) return;

  const recipients = [entity.customerId, entity.manufactureId].filter(
    (id): id is number => id !== null && id !== excludeUserId
  );

  const link = order
    ? `/dashboard/orders/${order.id}`
    : `/dashboard/samples/${sample!.id}`;

  for (const userId of recipients) {
    await createNotification(prisma, {
      type: "PRODUCTION",
      title: template.title,
      message: template.message,
      userId,
      link,
      productionTrackingId: tracking.id,
      orderId: tracking.orderId || undefined,
      sampleId: tracking.sampleId || undefined,
    });
  }
}

/**
 * Notify about quality control issues
 */
export async function notifyQualityControl(
  prisma: PrismaClient,
  qualityControl: {
    id: number;
    productionTrackingId: number | null;
  },
  order: {
    id: number;
    orderNumber: string;
    customerId: number;
    manufactureId: number;
  } | null,
  sample: {
    id: number;
    sampleNumber: string;
    customerId: number;
    manufactureId: number;
  } | null,
  templateKey: keyof typeof NotificationTemplates.QUALITY,
  templateArgs: any[],
  notifyRole: "customer" | "manufacturer" | "both" = "both"
) {
  const template = (NotificationTemplates.QUALITY[templateKey] as any)(
    ...templateArgs
  );

  const entity = order || sample;
  if (!entity) return;

  let recipients: number[] = [];
  if (notifyRole === "both") {
    recipients = [entity.customerId, entity.manufactureId];
  } else if (notifyRole === "customer") {
    recipients = [entity.customerId];
  } else {
    recipients = [entity.manufactureId];
  }

  const link = order
    ? `/dashboard/orders/${order.id}`
    : `/dashboard/samples/${sample!.id}`;

  for (const userId of recipients) {
    await createNotification(prisma, {
      type: "QUALITY",
      title: template.title,
      message: template.message,
      userId,
      link,
      productionTrackingId: qualityControl.productionTrackingId || undefined,
    });
  }
}

/**
 * Notify about messages
 */
export async function notifyNewMessage(
  prisma: PrismaClient,
  senderId: number,
  receiverId: number,
  senderName: string
) {
  const template = NotificationTemplates.MESSAGE.NEW_MESSAGE(senderName);

  await createNotification(prisma, {
    type: "MESSAGE",
    title: template.title,
    message: template.message,
    userId: receiverId,
    link: "/dashboard/messages",
  });
}

/**
 * Notify about questions
 */
export async function notifyQuestion(
  prisma: PrismaClient,
  collectionId: number,
  collectionName: string,
  collectionAuthorId: number,
  askerName: string,
  type: "new" | "answered",
  customerId?: number
) {
  if (type === "new") {
    const template = NotificationTemplates.MESSAGE.QUESTION(
      collectionName,
      askerName
    );

    await createNotification(prisma, {
      type: "MESSAGE",
      title: template.title,
      message: template.message,
      userId: collectionAuthorId,
      link: `/dashboard/collections/${collectionId}`,
    });
  } else if (type === "answered" && customerId) {
    const template = NotificationTemplates.MESSAGE.ANSWER(collectionName);

    await createNotification(prisma, {
      type: "MESSAGE",
      title: template.title,
      message: template.message,
      userId: customerId,
      link: `/dashboard/collections/${collectionId}`,
    });
  }
}

/**
 * Notify about reviews
 */
export async function notifyReview(
  prisma: PrismaClient,
  orderId: number,
  manufacturerId: number,
  customerId: number,
  type: "new" | "response",
  rating?: number,
  customerName?: string,
  companyName?: string
) {
  if (type === "new" && rating && customerName) {
    const template = NotificationTemplates.REVIEW.NEW_REVIEW(
      rating,
      customerName
    );

    await createNotification(prisma, {
      type: "MESSAGE",
      title: template.title,
      message: template.message,
      userId: manufacturerId,
      link: `/dashboard/orders/${orderId}`,
      orderId,
    });
  } else if (type === "response" && companyName) {
    const template = NotificationTemplates.REVIEW.REVIEW_RESPONSE(companyName);

    await createNotification(prisma, {
      type: "MESSAGE",
      title: template.title,
      message: template.message,
      userId: customerId,
      link: `/dashboard/orders/${orderId}`,
      orderId,
    });
  }
}

/**
 * Notify about system events (user approval, etc.)
 */
export async function notifySystemEvent(
  prisma: PrismaClient,
  userId: number,
  templateKey: keyof typeof NotificationTemplates.SYSTEM,
  templateArgs?: any[]
) {
  const template =
    typeof NotificationTemplates.SYSTEM[templateKey] === "function"
      ? (NotificationTemplates.SYSTEM[templateKey] as any)(
          ...(templateArgs || [])
        )
      : (NotificationTemplates.SYSTEM[templateKey] as any)();

  await createNotification(prisma, {
    type: "SYSTEM",
    title: template.title,
    message: template.message,
    userId,
    link: "/dashboard",
  });
}

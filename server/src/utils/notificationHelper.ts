import type { PrismaClient } from "../generated/prisma";

/**
 * Helper function to create notifications
 */
export async function createNotification(
  prisma: PrismaClient,
  data: {
    type: "ORDER" | "SAMPLE" | "MESSAGE" | "PRODUCTION" | "QUALITY" | "SYSTEM";
    title: string;
    message: string;
    userId: number;
    link?: string;
    orderId?: number;
    sampleId?: number;
    productionTrackingId?: number;
  }
) {
  try {
    return await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        link: data.link || null,
        orderId: data.orderId || null,
        sampleId: data.sampleId || null,
        productionTrackingId: data.productionTrackingId || null,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Check for production deadlines approaching and create notifications
 * This should be called periodically (e.g., via cron job or scheduler)
 */
export async function checkProductionDeadlines(prisma: PrismaClient) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  try {
    // Find all production trackings with estimated end date within 24 hours
    const upcomingDeadlines = await prisma.productionTracking.findMany({
      where: {
        estimatedEndDate: {
          gte: now,
          lte: tomorrow,
        },
        overallStatus: "IN_PROGRESS",
      },
      include: {
        order: {
          include: {
            customer: true,
            manufacture: true,
            company: true,
          },
        },
        sample: {
          include: {
            customer: true,
            manufacture: true,
            company: true,
          },
        },
        company: true,
        stageUpdates: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    console.log(
      `🔔 Found ${upcomingDeadlines.length} production deadlines approaching...`
    );

    for (const production of upcomingDeadlines) {
      const hoursLeft = Math.round(
        (production.estimatedEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      // Determine if it's an order or sample
      const isOrder = !!production.order;
      const entity = isOrder ? production.order : production.sample;
      const entityNumber = isOrder
        ? production.order?.orderNumber
        : production.sample?.sampleNumber;
      const entityType = isOrder ? "Order" : "Sample";

      if (!entity) continue;

      // Get manufacturer user ID
      const manufacturerId = entity.manufactureId;

      // Get company members if there's a company
      let companyMemberIds: number[] = [];
      if (production.companyId) {
        const companyMembers = await prisma.user.findMany({
          where: {
            companyId: production.companyId,
            role: {
              in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"],
            },
          },
          select: { id: true },
        });
        companyMemberIds = companyMembers.map((m) => m.id);
      }

      // Combine manufacturer and company members
      const recipientIds = Array.from(
        new Set([manufacturerId, ...companyMemberIds])
      );

      // Check if notification already sent in last 12 hours
      const recentNotification = await prisma.notification.findFirst({
        where: {
          productionTrackingId: production.id,
          type: "PRODUCTION",
          userId: { in: recipientIds },
          createdAt: {
            gte: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          },
        },
      });

      if (recentNotification) {
        console.log(
          `⏭️ Skipping notification for ${entityType} #${entityNumber} - already sent recently`
        );
        continue;
      }

      // Create notification for each recipient
      for (const userId of recipientIds) {
        // Determine correct link based on whether it's an order or sample
        const link = isOrder
          ? `/dashboard/orders/${production.orderId}`
          : `/dashboard/samples/${production.sampleId}`;

        await createNotification(prisma, {
          type: "PRODUCTION",
          title: `⚠️ Production Deadline Approaching`,
          message: `${entityType} #${entityNumber} deadline is in ${hoursLeft} hours. Current stage: ${production.currentStage}. Please check if there are any delays.`,
          userId,
          link,
          productionTrackingId: production.id,
          orderId: production.orderId || undefined,
          sampleId: production.sampleId || undefined,
        });

        console.log(
          `✅ Notification sent to user ${userId} for ${entityType} #${entityNumber}`
        );
      }
    }

    return upcomingDeadlines.length;
  } catch (error) {
    console.error("❌ Error checking production deadlines:", error);
    return 0;
  }
}

/**
 * Check for overdue production and create urgent notifications
 */
export async function checkOverdueProduction(prisma: PrismaClient) {
  const now = new Date();

  try {
    // Find all production trackings that are overdue
    const overdueProductions = await prisma.productionTracking.findMany({
      where: {
        estimatedEndDate: {
          lt: now,
        },
        overallStatus: "IN_PROGRESS",
      },
      include: {
        order: {
          include: {
            customer: true,
            manufacture: true,
          },
        },
        sample: {
          include: {
            customer: true,
            manufacture: true,
          },
        },
      },
    });

    console.log(`🚨 Found ${overdueProductions.length} overdue productions...`);

    for (const production of overdueProductions) {
      const daysOverdue = Math.floor(
        (now.getTime() - production.estimatedEndDate!.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const isOrder = !!production.order;
      const entity = isOrder ? production.order : production.sample;
      const entityNumber = isOrder
        ? production.order?.orderNumber
        : production.sample?.sampleNumber;
      const entityType = isOrder ? "Order" : "Sample";

      if (!entity) continue;

      // Notify both customer and manufacturer
      const customerId = entity.customerId;
      const manufacturerId = entity.manufactureId;

      // Get company members
      let companyMemberIds: number[] = [];
      if (production.companyId) {
        const companyMembers = await prisma.user.findMany({
          where: {
            companyId: production.companyId,
            role: {
              in: ["COMPANY_OWNER", "COMPANY_EMPLOYEE"],
            },
          },
          select: { id: true },
        });
        companyMemberIds = companyMembers.map((m) => m.id);
      }

      const recipientIds = Array.from(
        new Set([customerId, manufacturerId, ...companyMemberIds])
      );

      // Check if notification already sent today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const recentNotification = await prisma.notification.findFirst({
        where: {
          productionTrackingId: production.id,
          type: "PRODUCTION",
          title: { contains: "Overdue" },
          createdAt: {
            gte: todayStart,
          },
        },
      });

      if (recentNotification) {
        console.log(
          `⏭️ Skipping overdue notification for ${entityType} #${entityNumber} - already sent today`
        );
        continue;
      }

      // Create notifications
      for (const userId of recipientIds) {
        // Determine correct link based on whether it's an order or sample
        const link = isOrder
          ? `/dashboard/orders/${production.orderId}`
          : `/dashboard/samples/${production.sampleId}`;

        await createNotification(prisma, {
          type: "PRODUCTION",
          title: `🚨 Production Overdue`,
          message: `${entityType} #${entityNumber} is ${daysOverdue} day(s) overdue! Current stage: ${production.currentStage}. Immediate action required.`,
          userId,
          link,
          productionTrackingId: production.id,
          orderId: production.orderId || undefined,
          sampleId: production.sampleId || undefined,
        });
      }

      console.log(
        `🚨 Overdue notifications sent for ${entityType} #${entityNumber}`
      );
    }

    return overdueProductions.length;
  } catch (error) {
    console.error("❌ Error checking overdue production:", error);
    return 0;
  }
}

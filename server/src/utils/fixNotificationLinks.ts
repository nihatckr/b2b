import { PrismaClient } from "../generated/prisma";

/**
 * Fix notification links that point to /dashboard/production/{trackingId}
 * to point to the correct /dashboard/orders/{orderId} or /dashboard/samples/{sampleId}
 */
export async function fixNotificationLinks() {
  const prisma = new PrismaClient();

  try {
    console.log("🔧 Starting notification link fix...");

    // Find all notifications with production tracking links
    const notifications = await prisma.notification.findMany({
      where: {
        link: {
          contains: "/dashboard/production/",
        },
        productionTrackingId: {
          not: null,
        },
      },
      include: {
        productionTracking: {
          include: {
            order: true,
            sample: true,
          },
        },
      },
    });

    console.log(`📋 Found ${notifications.length} notifications to fix`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const notification of notifications) {
      if (!notification.productionTracking) {
        console.log(
          `⚠️ Notification ${notification.id} has no production tracking, skipping...`
        );
        skippedCount++;
        continue;
      }

      const tracking = notification.productionTracking;
      let newLink: string | null = null;

      if (tracking.orderId) {
        newLink = `/dashboard/orders/${tracking.orderId}`;
      } else if (tracking.sampleId) {
        newLink = `/dashboard/samples/${tracking.sampleId}`;
      }

      if (newLink && newLink !== notification.link) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { link: newLink },
        });

        console.log(
          `✅ Fixed notification ${notification.id}: ${notification.link} -> ${newLink}`
        );
        fixedCount++;
      } else {
        console.log(
          `⏭️ Notification ${notification.id} already has correct link or no tracking data`
        );
        skippedCount++;
      }
    }

    console.log(`\n✨ Fix completed:`);
    console.log(`   ✅ Fixed: ${fixedCount}`);
    console.log(`   ⏭️ Skipped: ${skippedCount}`);
    console.log(`   📊 Total: ${notifications.length}`);

    return { fixed: fixedCount, skipped: skippedCount, total: notifications.length };
  } catch (error) {
    console.error("❌ Error fixing notification links:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixNotificationLinks()
    .then(() => {
      console.log("🎉 Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

import { PrismaClient as GeneratedPrismaClient } from "../generated/prisma";
import {
    checkOverdueProduction,
    checkProductionDeadlines,
} from "../utils/notificationHelper";

const prisma = new GeneratedPrismaClient();

/**
 * Production Deadline Checker Scheduler
 * Runs periodically to check for upcoming deadlines and overdue production
 */
export class ProductionScheduler {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Start the scheduler
   * @param intervalMinutes - Check interval in minutes (default: 60 minutes)
   */
  start(intervalMinutes: number = 60) {
    if (this.isRunning) {
      console.log("⚠️ Production scheduler is already running");
      return;
    }

    console.log(
      `🚀 Starting production deadline scheduler (checks every ${intervalMinutes} minutes)...`
    );

    // Run immediately on start
    this.runChecks();

    // Then run periodically
    this.checkInterval = setInterval(
      () => {
        this.runChecks();
      },
      intervalMinutes * 60 * 1000
    );

    this.isRunning = true;
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isRunning = false;
      console.log("🛑 Production deadline scheduler stopped");
    }
  }

  /**
   * Run all checks
   */
  private async runChecks() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔔 [${timestamp}] Running production deadline checks...`);

    try {
      // Check for upcoming deadlines (within 24 hours)
      const upcomingCount = await checkProductionDeadlines(prisma);
      console.log(`✅ Checked ${upcomingCount} upcoming deadlines`);

      // Check for overdue production
      const overdueCount = await checkOverdueProduction(prisma);
      console.log(`✅ Checked ${overdueCount} overdue productions`);

      console.log(`✅ Production deadline checks completed\n`);
    } catch (error) {
      console.error("❌ Error running production checks:", error);
    }
  }

  /**
   * Manually trigger checks (useful for testing)
   */
  async triggerManualCheck() {
    console.log("🔔 Manual check triggered...");
    await this.runChecks();
  }
}

// Create a singleton instance
export const productionScheduler = new ProductionScheduler();

// Auto-start if not in test environment
if (process.env.NODE_ENV !== "test") {
  // Check every 60 minutes by default
  // You can override this with environment variable
  const intervalMinutes = parseInt(
    process.env.PRODUCTION_CHECK_INTERVAL || "60",
    10
  );
  productionScheduler.start(intervalMinutes);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, stopping production scheduler...");
  productionScheduler.stop();
  prisma.$disconnect();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, stopping production scheduler...");
  productionScheduler.stop();
  prisma.$disconnect();
});

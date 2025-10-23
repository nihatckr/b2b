/**
 * Export Database Data to JSON
 * 
 * This script exports all data from the database to JSON files
 * for creating comprehensive seed data
 */

import prisma from "./lib/prisma.js";
import fs from "fs";
import path from "path";

async function exportData() {
  console.log("📊 Starting database data export...");

  try {
    // Create export directory
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Export all tables
    const tables = [
      "User",
      "Company", 
      "Category",
      "StandardCategory",
      "Collection",
      "Order",
      "ProductionTracking",
      "ProductionStageUpdate",
      "Sample",
      "LibraryItem",
      "Message",
      "Notification",
      "Task",
      "QualityControl",
      "Revision",
      "OrderNegotiation",
      "UserFavoriteCollection",
      "CompanyPartnership",
      "CompanyMetrics",
      "AdminReport",
      "AIAnalysis",
      "BillOfMaterial",
      "CompanyCategory",
      "File",
      "ProductionRevision",
      "SharedCategoryMapping",
      "Workshop"
    ];

    const exportData: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        console.log(`📋 Exporting ${table}...`);
        
        // Use dynamic property access to get data from each table
        const data = await (prisma as any)[table.toLowerCase()].findMany({
          include: {
            // Include common relations
            ...(table === "User" && {
              company: true,
              sentMessages: true,
              receivedMessages: true,
              notifications: true,
              tasks: true,
              favoriteCollections: true,
            }),
            ...(table === "Company" && {
              owner: true,
              users: true,
              collections: true,
              orders: true,
              partnerships: true,
              metrics: true,
            }),
            ...(table === "Collection" && {
              company: true,
              orders: true,
              samples: true,
              category: true,
              standardCategory: true,
              favorites: true,
            }),
            ...(table === "Order" && {
              customer: true,
              collection: true,
              productionTracking: {
                include: {
                  stageUpdates: true,
                }
              },
              negotiations: true,
            }),
            ...(table === "ProductionTracking" && {
              order: true,
              stageUpdates: true,
              revisions: true,
            }),
            ...(table === "Category" && {
              collections: true,
              companies: true,
            }),
            ...(table === "StandardCategory" && {
              collections: true,
              companies: true,
            }),
            ...(table === "Sample" && {
              collection: true,
              company: true,
            }),
            ...(table === "LibraryItem" && {
              company: true,
            }),
            ...(table === "Message" && {
              sender: true,
              receiver: true,
            }),
            ...(table === "Notification" && {
              user: true,
            }),
            ...(table === "Task" && {
              user: true,
              order: true,
            }),
            ...(table === "QualityControl" && {
              order: true,
            }),
            ...(table === "Revision" && {
              order: true,
            }),
            ...(table === "OrderNegotiation" && {
              order: true,
              customer: true,
              manufacturer: true,
            }),
            ...(table === "UserFavoriteCollection" && {
              user: true,
              collection: true,
            }),
            ...(table === "CompanyPartnership" && {
              company1: true,
              company2: true,
            }),
            ...(table === "CompanyMetrics" && {
              company: true,
            }),
            ...(table === "AdminReport" && {
              user: true,
            }),
            ...(table === "AIAnalysis" && {
              collection: true,
            }),
            ...(table === "BillOfMaterial" && {
              collection: true,
            }),
            ...(table === "CompanyCategory" && {
              company: true,
              category: true,
            }),
            ...(table === "File" && {
              user: true,
              collection: true,
            }),
            ...(table === "ProductionRevision" && {
              productionTracking: true,
            }),
            ...(table === "SharedCategoryMapping" && {
              category: true,
              standardCategory: true,
            }),
            ...(table === "Workshop" && {
              company: true,
            }),
          }
        });

        exportData[table] = data;
        console.log(`✅ ${table}: ${data.length} records exported`);
      } catch (error) {
        console.log(`⚠️  ${table}: Error exporting - ${error}`);
        exportData[table] = [];
      }
    }

    // Save to JSON file
    const exportFile = path.join(exportDir, "database-export.json");
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    console.log(`\n📁 Data exported to: ${exportFile}`);
    
    // Create summary
    const summary = Object.entries(exportData).map(([table, data]) => ({
      table,
      count: data.length,
      sampleFields: data.length > 0 ? Object.keys(data[0]) : []
    }));

    const summaryFile = path.join(exportDir, "export-summary.json");
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log(`📊 Summary saved to: ${summaryFile}`);
    
    // Print summary
    console.log("\n📊 Export Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    summary.forEach(({ table, count }) => {
      console.log(`${table.padEnd(25)}: ${count.toString().padStart(4)} records`);
    });

  } catch (error) {
    console.error("❌ Export failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();

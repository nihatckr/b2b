/**
 * Basic Database Export
 * 
 * This script exports basic data from the database without complex relations
 */

import prisma from "./lib/prisma.js";
import fs from "fs";
import path from "path";

async function exportData() {
  console.log("📊 Starting basic database export...");

  try {
    // Create export directory
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportData: Record<string, any[]> = {};

    // Export Users (basic)
    console.log("📋 Exporting Users...");
    const users = await prisma.user.findMany();
    exportData["User"] = users;
    console.log(`✅ Users: ${users.length} records`);

    // Export Companies (basic)
    console.log("📋 Exporting Companies...");
    const companies = await prisma.company.findMany();
    exportData["Company"] = companies;
    console.log(`✅ Companies: ${companies.length} records`);

    // Export Categories (basic)
    console.log("📋 Exporting Categories...");
    const categories = await prisma.category.findMany();
    exportData["Category"] = categories;
    console.log(`✅ Categories: ${categories.length} records`);

    // Export StandardCategories (basic)
    console.log("📋 Exporting StandardCategories...");
    const standardCategories = await prisma.standardCategory.findMany();
    exportData["StandardCategory"] = standardCategories;
    console.log(`✅ StandardCategories: ${standardCategories.length} records`);

    // Export Collections (basic)
    console.log("📋 Exporting Collections...");
    const collections = await prisma.collection.findMany();
    exportData["Collection"] = collections;
    console.log(`✅ Collections: ${collections.length} records`);

    // Export Orders (basic)
    console.log("📋 Exporting Orders...");
    const orders = await prisma.order.findMany();
    exportData["Order"] = orders;
    console.log(`✅ Orders: ${orders.length} records`);

    // Export ProductionTracking (basic)
    console.log("📋 Exporting ProductionTracking...");
    const productionTracking = await prisma.productionTracking.findMany();
    exportData["ProductionTracking"] = productionTracking;
    console.log(`✅ ProductionTracking: ${productionTracking.length} records`);

    // Export ProductionStageUpdates (basic)
    console.log("📋 Exporting ProductionStageUpdates...");
    const stageUpdates = await prisma.productionStageUpdate.findMany();
    exportData["ProductionStageUpdate"] = stageUpdates;
    console.log(`✅ ProductionStageUpdates: ${stageUpdates.length} records`);

    // Export Samples (basic)
    console.log("📋 Exporting Samples...");
    const samples = await prisma.sample.findMany();
    exportData["Sample"] = samples;
    console.log(`✅ Samples: ${samples.length} records`);

    // Export LibraryItems (basic)
    console.log("📋 Exporting LibraryItems...");
    const libraryItems = await prisma.libraryItem.findMany();
    exportData["LibraryItem"] = libraryItems;
    console.log(`✅ LibraryItems: ${libraryItems.length} records`);

    // Export Messages (basic)
    console.log("📋 Exporting Messages...");
    const messages = await prisma.message.findMany();
    exportData["Message"] = messages;
    console.log(`✅ Messages: ${messages.length} records`);

    // Export Notifications (basic)
    console.log("📋 Exporting Notifications...");
    const notifications = await prisma.notification.findMany();
    exportData["Notification"] = notifications;
    console.log(`✅ Notifications: ${notifications.length} records`);

    // Export Tasks (basic)
    console.log("📋 Exporting Tasks...");
    const tasks = await prisma.task.findMany();
    exportData["Task"] = tasks;
    console.log(`✅ Tasks: ${tasks.length} records`);

    // Export QualityControls (basic)
    console.log("📋 Exporting QualityControls...");
    const qualityControls = await prisma.qualityControl.findMany();
    exportData["QualityControl"] = qualityControls;
    console.log(`✅ QualityControls: ${qualityControls.length} records`);

    // Export Revisions (basic)
    console.log("📋 Exporting Revisions...");
    const revisions = await prisma.revision.findMany();
    exportData["Revision"] = revisions;
    console.log(`✅ Revisions: ${revisions.length} records`);

    // Export OrderNegotiations (basic)
    console.log("📋 Exporting OrderNegotiations...");
    const orderNegotiations = await prisma.orderNegotiation.findMany();
    exportData["OrderNegotiation"] = orderNegotiations;
    console.log(`✅ OrderNegotiations: ${orderNegotiations.length} records`);

    // Export UserFavoriteCollections (basic)
    console.log("📋 Exporting UserFavoriteCollections...");
    const userFavoriteCollections = await prisma.userFavoriteCollection.findMany();
    exportData["UserFavoriteCollection"] = userFavoriteCollections;
    console.log(`✅ UserFavoriteCollections: ${userFavoriteCollections.length} records`);

    // Export CompanyPartnerships (basic)
    console.log("📋 Exporting CompanyPartnerships...");
    const companyPartnerships = await prisma.companyPartnership.findMany();
    exportData["CompanyPartnership"] = companyPartnerships;
    console.log(`✅ CompanyPartnerships: ${companyPartnerships.length} records`);

    // Export CompanyMetrics (basic)
    console.log("📋 Exporting CompanyMetrics...");
    const companyMetrics = await prisma.companyMetrics.findMany();
    exportData["CompanyMetrics"] = companyMetrics;
    console.log(`✅ CompanyMetrics: ${companyMetrics.length} records`);

    // Export AdminReports (basic)
    console.log("📋 Exporting AdminReports...");
    const adminReports = await prisma.adminReport.findMany();
    exportData["AdminReport"] = adminReports;
    console.log(`✅ AdminReports: ${adminReports.length} records`);

    // Export AIAnalyses (basic)
    console.log("📋 Exporting AIAnalyses...");
    const aiAnalyses = await prisma.aIAnalysis.findMany();
    exportData["AIAnalysis"] = aiAnalyses;
    console.log(`✅ AIAnalyses: ${aiAnalyses.length} records`);

    // Export BillOfMaterials (basic)
    console.log("📋 Exporting BillOfMaterials...");
    const billOfMaterials = await prisma.billOfMaterial.findMany();
    exportData["BillOfMaterial"] = billOfMaterials;
    console.log(`✅ BillOfMaterials: ${billOfMaterials.length} records`);

    // Export CompanyCategories (basic)
    console.log("📋 Exporting CompanyCategories...");
    const companyCategories = await prisma.companyCategory.findMany();
    exportData["CompanyCategory"] = companyCategories;
    console.log(`✅ CompanyCategories: ${companyCategories.length} records`);

    // Export Files (basic)
    console.log("📋 Exporting Files...");
    const files = await prisma.file.findMany();
    exportData["File"] = files;
    console.log(`✅ Files: ${files.length} records`);

    // Export ProductionRevisions (basic)
    console.log("📋 Exporting ProductionRevisions...");
    const productionRevisions = await prisma.productionRevision.findMany();
    exportData["ProductionRevision"] = productionRevisions;
    console.log(`✅ ProductionRevisions: ${productionRevisions.length} records`);

    // Export SharedCategoryMappings (basic)
    console.log("📋 Exporting SharedCategoryMappings...");
    const sharedCategoryMappings = await prisma.sharedCategoryMapping.findMany();
    exportData["SharedCategoryMapping"] = sharedCategoryMappings;
    console.log(`✅ SharedCategoryMappings: ${sharedCategoryMappings.length} records`);

    // Export Workshops (basic)
    console.log("📋 Exporting Workshops...");
    const workshops = await prisma.workshop.findMany();
    exportData["Workshop"] = workshops;
    console.log(`✅ Workshops: ${workshops.length} records`);

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

    // Print sample data for key tables
    console.log("\n📋 Sample Data:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (exportData["User"].length > 0) {
      console.log("\n👤 Users Sample:");
      console.log(JSON.stringify(exportData["User"][0], null, 2));
    }
    
    if (exportData["Company"].length > 0) {
      console.log("\n🏢 Companies Sample:");
      console.log(JSON.stringify(exportData["Company"][0], null, 2));
    }
    
    if (exportData["Order"].length > 0) {
      console.log("\n📦 Orders Sample:");
      console.log(JSON.stringify(exportData["Order"][0], null, 2));
    }

  } catch (error) {
    console.error("❌ Export failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();

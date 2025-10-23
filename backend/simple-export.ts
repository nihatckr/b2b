/**
 * Simple Database Export
 * 
 * This script exports basic data from the database
 */

import prisma from "./lib/prisma.js";
import fs from "fs";
import path from "path";

async function exportData() {
  console.log("📊 Starting simple database export...");

  try {
    // Create export directory
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const exportData: Record<string, any[]> = {};

    // Export Users
    console.log("📋 Exporting Users...");
    const users = await prisma.user.findMany({
      include: {
        company: true,
      }
    });
    exportData["User"] = users;
    console.log(`✅ Users: ${users.length} records`);

    // Export Companies
    console.log("📋 Exporting Companies...");
    const companies = await prisma.company.findMany({
      include: {
        owner: true,
        employees: true,
      }
    });
    exportData["Company"] = companies;
    console.log(`✅ Companies: ${companies.length} records`);

    // Export Categories
    console.log("📋 Exporting Categories...");
    const categories = await prisma.category.findMany({
      include: {
        author: true,
        company: true,
        parentCategory: true,
        subCategories: true,
      }
    });
    exportData["Category"] = categories;
    console.log(`✅ Categories: ${categories.length} records`);

    // Export StandardCategories
    console.log("📋 Exporting StandardCategories...");
    const standardCategories = await prisma.standardCategory.findMany({
      include: {
        author: true,
        company: true,
        parentCategory: true,
        subCategories: true,
      }
    });
    exportData["StandardCategory"] = standardCategories;
    console.log(`✅ StandardCategories: ${standardCategories.length} records`);

    // Export Collections
    console.log("📋 Exporting Collections...");
    const collections = await prisma.collection.findMany({
      include: {
        company: true,
        author: true,
        category: true,
        companyCategory: true,
        orders: true,
        samples: true,
        questions: true,
        reviews: true,
        billOfMaterials: true,
        revisedSamples: true,
        tasks: true,
        favoritedBy: true,
        certifications: true,
      }
    });
    exportData["Collection"] = collections;
    console.log(`✅ Collections: ${collections.length} records`);

    // Export Orders
    console.log("📋 Exporting Orders...");
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        manufacturer: true,
        collection: true,
        productionTracking: {
          include: {
            stageUpdates: true,
            revisions: true,
          }
        },
        negotiations: true,
      }
    });
    exportData["Order"] = orders;
    console.log(`✅ Orders: ${orders.length} records`);

    // Export ProductionTracking
    console.log("📋 Exporting ProductionTracking...");
    const productionTracking = await prisma.productionTracking.findMany({
      include: {
        order: true,
        stageUpdates: true,
        revisions: true,
      }
    });
    exportData["ProductionTracking"] = productionTracking;
    console.log(`✅ ProductionTracking: ${productionTracking.length} records`);

    // Export ProductionStageUpdates
    console.log("📋 Exporting ProductionStageUpdates...");
    const stageUpdates = await prisma.productionStageUpdate.findMany({
      include: {
        productionTracking: true,
      }
    });
    exportData["ProductionStageUpdate"] = stageUpdates;
    console.log(`✅ ProductionStageUpdates: ${stageUpdates.length} records`);

    // Export Samples
    console.log("📋 Exporting Samples...");
    const samples = await prisma.sample.findMany({
      include: {
        collection: true,
        company: true,
      }
    });
    exportData["Sample"] = samples;
    console.log(`✅ Samples: ${samples.length} records`);

    // Export LibraryItems
    console.log("📋 Exporting LibraryItems...");
    const libraryItems = await prisma.libraryItem.findMany({
      include: {
        company: true,
      }
    });
    exportData["LibraryItem"] = libraryItems;
    console.log(`✅ LibraryItems: ${libraryItems.length} records`);

    // Export Messages
    console.log("📋 Exporting Messages...");
    const messages = await prisma.message.findMany({
      include: {
        sender: true,
        receiver: true,
      }
    });
    exportData["Message"] = messages;
    console.log(`✅ Messages: ${messages.length} records`);

    // Export Notifications
    console.log("📋 Exporting Notifications...");
    const notifications = await prisma.notification.findMany({
      include: {
        user: true,
      }
    });
    exportData["Notification"] = notifications;
    console.log(`✅ Notifications: ${notifications.length} records`);

    // Export Tasks
    console.log("📋 Exporting Tasks...");
    const tasks = await prisma.task.findMany({
      include: {
        user: true,
        order: true,
      }
    });
    exportData["Task"] = tasks;
    console.log(`✅ Tasks: ${tasks.length} records`);

    // Export QualityControls
    console.log("📋 Exporting QualityControls...");
    const qualityControls = await prisma.qualityControl.findMany({
      include: {
        order: true,
      }
    });
    exportData["QualityControl"] = qualityControls;
    console.log(`✅ QualityControls: ${qualityControls.length} records`);

    // Export Revisions
    console.log("📋 Exporting Revisions...");
    const revisions = await prisma.revision.findMany({
      include: {
        order: true,
      }
    });
    exportData["Revision"] = revisions;
    console.log(`✅ Revisions: ${revisions.length} records`);

    // Export OrderNegotiations
    console.log("📋 Exporting OrderNegotiations...");
    const orderNegotiations = await prisma.orderNegotiation.findMany({
      include: {
        order: true,
        customer: true,
        manufacturer: true,
      }
    });
    exportData["OrderNegotiation"] = orderNegotiations;
    console.log(`✅ OrderNegotiations: ${orderNegotiations.length} records`);

    // Export UserFavoriteCollections
    console.log("📋 Exporting UserFavoriteCollections...");
    const userFavoriteCollections = await prisma.userFavoriteCollection.findMany({
      include: {
        user: true,
        collection: true,
      }
    });
    exportData["UserFavoriteCollection"] = userFavoriteCollections;
    console.log(`✅ UserFavoriteCollections: ${userFavoriteCollections.length} records`);

    // Export CompanyPartnerships
    console.log("📋 Exporting CompanyPartnerships...");
    const companyPartnerships = await prisma.companyPartnership.findMany({
      include: {
        company1: true,
        company2: true,
      }
    });
    exportData["CompanyPartnership"] = companyPartnerships;
    console.log(`✅ CompanyPartnerships: ${companyPartnerships.length} records`);

    // Export CompanyMetrics
    console.log("📋 Exporting CompanyMetrics...");
    const companyMetrics = await prisma.companyMetrics.findMany({
      include: {
        company: true,
      }
    });
    exportData["CompanyMetrics"] = companyMetrics;
    console.log(`✅ CompanyMetrics: ${companyMetrics.length} records`);

    // Export AdminReports
    console.log("📋 Exporting AdminReports...");
    const adminReports = await prisma.adminReport.findMany({
      include: {
        user: true,
      }
    });
    exportData["AdminReport"] = adminReports;
    console.log(`✅ AdminReports: ${adminReports.length} records`);

    // Export AIAnalyses
    console.log("📋 Exporting AIAnalyses...");
    const aiAnalyses = await prisma.aIAnalysis.findMany({
      include: {
        collection: true,
      }
    });
    exportData["AIAnalysis"] = aiAnalyses;
    console.log(`✅ AIAnalyses: ${aiAnalyses.length} records`);

    // Export BillOfMaterials
    console.log("📋 Exporting BillOfMaterials...");
    const billOfMaterials = await prisma.billOfMaterial.findMany({
      include: {
        collection: true,
      }
    });
    exportData["BillOfMaterial"] = billOfMaterials;
    console.log(`✅ BillOfMaterials: ${billOfMaterials.length} records`);

    // Export CompanyCategories
    console.log("📋 Exporting CompanyCategories...");
    const companyCategories = await prisma.companyCategory.findMany({
      include: {
        company: true,
        category: true,
      }
    });
    exportData["CompanyCategory"] = companyCategories;
    console.log(`✅ CompanyCategories: ${companyCategories.length} records`);

    // Export Files
    console.log("📋 Exporting Files...");
    const files = await prisma.file.findMany({
      include: {
        author: true,
        collection: true,
      }
    });
    exportData["File"] = files;
    console.log(`✅ Files: ${files.length} records`);

    // Export ProductionRevisions
    console.log("📋 Exporting ProductionRevisions...");
    const productionRevisions = await prisma.productionRevision.findMany({
      include: {
        productionTracking: true,
      }
    });
    exportData["ProductionRevision"] = productionRevisions;
    console.log(`✅ ProductionRevisions: ${productionRevisions.length} records`);

    // Export SharedCategoryMappings
    console.log("📋 Exporting SharedCategoryMappings...");
    const sharedCategoryMappings = await prisma.sharedCategoryMapping.findMany({
      include: {
        category: true,
        standardCategory: true,
      }
    });
    exportData["SharedCategoryMapping"] = sharedCategoryMappings;
    console.log(`✅ SharedCategoryMappings: ${sharedCategoryMappings.length} records`);

    // Export Workshops
    console.log("📋 Exporting Workshops...");
    const workshops = await prisma.workshop.findMany({
      include: {
        owner: true,
        packagingProductions: true,
        sewingProductions: true,
      }
    });
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

  } catch (error) {
    console.error("❌ Export failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();

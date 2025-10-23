/**
 * Complete Seed Data with All User Roles
 *
 * This seed creates:
 * - Admin user
 * - Company owners (manufacturer & customer)
 * - Regular employees for each role
 * - Sample data for orders, products, etc.
 */

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

async function main() {
  console.log("🌱 Starting complete seed with all user roles...");

  // ==========================================
  // 1. ADMIN USER
  // ==========================================
  console.log("\n👤 Creating Admin User...");

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@protexflow.com" },
    update: {},
    create: {
      email: "admin@protexflow.com",
      name: "System Admin",
      firstName: "System",
      lastName: "Admin",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ==========================================
  // 2. MANUFACTURER COMPANY & OWNER
  // ==========================================
  console.log("\n🏭 Creating Manufacturer Company...");

  const manufacturerOwnerPassword = await bcrypt.hash("Owner123!", 10);
  const manufacturerOwner = await prisma.user.upsert({
    where: { email: "owner@textilepro.com" },
    update: {},
    create: {
      email: "owner@textilepro.com",
      name: "Ahmet Yılmaz",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      password: manufacturerOwnerPassword,
      role: "COMPANY_OWNER",
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: true,
      department: "MANAGEMENT",
      jobTitle: "Genel Müdür",
    },
  });

  const manufacturerCompany = await prisma.company.upsert({
    where: { email: "info@textilepro.com" },
    update: {},
    create: {
      name: "TextilePro Manufacturing",
      email: "info@textilepro.com",
      phone: "+90 212 555 0101",
      address: "Sanayi Mahallesi, Fabrika Caddesi No:15",
      city: "İstanbul",
      country: "Turkey",
      website: "https://textilepro.com",
      type: "MANUFACTURER",
      description:
        "Premium kalitede tekstil üretimi yapan öncü firma. 25 yıllık deneyim ile müşterilerine en kaliteli hizmeti sunuyor.",
      ownerId: manufacturerOwner.id,
      isActive: true,
      subscriptionPlan: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      maxUsers: 50,
      maxSamples: 500,
      maxOrders: 200,
      maxCollections: 100,
      maxStorageGB: 100.0,
      isPublicProfile: true,
      profileSlug: "textilepro",
    },
  });

  // Update manufacturer owner's company relation
  await prisma.user.update({
    where: { id: manufacturerOwner.id },
    data: { companyId: manufacturerCompany.id },
  });

  console.log("✅ Manufacturer company created:", manufacturerCompany.name);

  // ==========================================
  // 3. BUYER COMPANY & OWNER
  // ==========================================
  console.log("\n🏢 Creating Buyer Company...");

  const buyerOwnerPassword = await bcrypt.hash("Buyer123!", 10);
  const buyerOwner = await prisma.user.upsert({
    where: { email: "owner@fashionretail.com" },
    update: {},
    create: {
      email: "owner@fashionretail.com",
      name: "Elif Kaya",
      firstName: "Elif",
      lastName: "Kaya",
      password: buyerOwnerPassword,
      role: "COMPANY_OWNER",
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: true,
      department: "MANAGEMENT",
      jobTitle: "CEO",
    },
  });

  const buyerCompany = await prisma.company.upsert({
    where: { email: "info@fashionretail.com" },
    update: {},
    create: {
      name: "Fashion Retail Co.",
      email: "info@fashionretail.com",
      phone: "+90 212 555 0202",
      address: "Merkez Mahallesi, Ticaret Sokak No:42",
      city: "İstanbul",
      country: "Turkey",
      website: "https://fashionretail.com",
      type: "BUYER",
      description:
        "Modern ve şık giyim ürünlerini müşterilerine ulaştıran perakende mağaza zinciri. Kaliteli ve uygun fiyatlı moda.",
      ownerId: buyerOwner.id,
      isActive: true,
      subscriptionPlan: "STARTER",
      subscriptionStatus: "ACTIVE",
      maxUsers: 10,
      maxSamples: 100,
      maxOrders: 50,
      maxCollections: 20,
      maxStorageGB: 10.0,
      isPublicProfile: false,
    },
  });

  // Update buyer owner's company relation
  await prisma.user.update({
    where: { id: buyerOwner.id },
    data: { companyId: buyerCompany.id },
  });

  console.log("✅ Buyer company created:", buyerCompany.name);

  console.log("\n🔐 Login Credentials:");
  console.log("\n👤 Admin:");
  console.log("   Email: admin@protexflow.com");
  console.log("   Password: Admin123!");
  console.log("\n🏭 Manufacturer (TextilePro):");
  console.log("   Owner: owner@textilepro.com / Owner123!");
  console.log("\n🏢 Buyer (Fashion Retail):");
  console.log("   Owner: owner@fashionretail.com / Buyer123!");
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

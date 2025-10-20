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
import { PrismaClient } from "../lib/generated/index.js";

const prisma = new PrismaClient();async function main() {
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
  // 2. MANUFACTURER COMPANY & USERS
  // ==========================================
  console.log("\n🏭 Creating Manufacturer Company...");

  const manufacturer = await prisma.company.create({
    data: {
      name: "TextilePro Manufacturing",
      email: "info@textilepro.com",
      phone: "+90 212 555 0001",
      type: "MANUFACTURER",
      description: "Premium textile manufacturing company",
      address: "Organize Sanayi Bölgesi",
      city: "Istanbul",
      country: "Turkey",
      website: "https://textilepro.com",
      isActive: true,
    },
  });
  console.log("✅ Manufacturer company created:", manufacturer.name);

  // Manufacturer Owner
  const manufacturerOwnerPassword = await bcrypt.hash("Owner123!", 10);
  const manufacturerOwner = await prisma.user.create({
    data: {
      email: "owner@textilepro.com",
      name: "Mehmet Yılmaz",
      firstName: "Mehmet",
      lastName: "Yılmaz",
      password: manufacturerOwnerPassword,
      role: "COMPANY_OWNER",
      companyId: manufacturer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: true,
      jobTitle: "Genel Müdür",
    },
  });
  console.log("✅ Manufacturer owner created:", manufacturerOwner.email);

  // Production Manager
  const productionManagerPassword = await bcrypt.hash("Manager123!", 10);
  const productionManager = await prisma.user.create({
    data: {
      email: "production@textilepro.com",
      name: "Ayşe Demir",
      firstName: "Ayşe",
      lastName: "Demir",
      password: productionManagerPassword,
      role: "COMPANY_EMPLOYEE",
      department: "PRODUCTION",
      companyId: manufacturer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
      jobTitle: "Üretim Müdürü",
    },
  });
  console.log("✅ Production Manager created:", productionManager.email);

  // Quality Control Manager
  const qcManagerPassword = await bcrypt.hash("QC123!", 10);
  const qcManager = await prisma.user.create({
    data: {
      email: "qc@textilepro.com",
      name: "Fatih Kaya",
      firstName: "Fatih",
      lastName: "Kaya",
      password: qcManagerPassword,
      role: "COMPANY_EMPLOYEE",
      department: "QUALITY",
      companyId: manufacturer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
      jobTitle: "Kalite Kontrol Müdürü",
    },
  });
  console.log("✅ Quality Control Manager created:", qcManager.email);

  // Warehouse Manager
  const warehouseManagerPassword = await bcrypt.hash("Warehouse123!", 10);
  const warehouseManager = await prisma.user.create({
    data: {
      email: "warehouse@textilepro.com",
      name: "Elif Çelik",
      firstName: "Elif",
      lastName: "Çelik",
      password: warehouseManagerPassword,
      role: "COMPANY_EMPLOYEE",
      department: "PRODUCTION",
      companyId: manufacturer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
      jobTitle: "Depo Müdürü",
    },
  });
  console.log("✅ Warehouse Manager created:", warehouseManager.email);

  // ==========================================
  // 3. CUSTOMER COMPANY & USERS
  // ==========================================
  console.log("\n🏢 Creating Customer Company...");

  const customer = await prisma.company.create({
    data: {
      name: "Fashion Retail Co.",
      email: "info@fashionretail.com",
      phone: "+90 212 555 0002",
      type: "BUYER",
      description: "Leading fashion retail company",
      address: "Merkez İş Merkezi",
      city: "Istanbul",
      country: "Turkey",
      website: "https://fashionretail.com",
      isActive: true,
    },
  });
  console.log("✅ Customer company created:", customer.name);

  // Customer Owner
  const customerOwnerPassword = await bcrypt.hash("Customer123!", 10);
  const customerOwner = await prisma.user.create({
    data: {
      email: "owner@fashionretail.com",
      name: "Zeynep Arslan",
      firstName: "Zeynep",
      lastName: "Arslan",
      password: customerOwnerPassword,
      role: "COMPANY_OWNER",
      companyId: customer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: true,
      jobTitle: "CEO",
    },
  });
  console.log("✅ Customer owner created:", customerOwner.email);

  // Sales Manager
  const salesManagerPassword = await bcrypt.hash("Sales123!", 10);
  const salesManager = await prisma.user.create({
    data: {
      email: "sales@fashionretail.com",
      name: "Can Özdemir",
      firstName: "Can",
      lastName: "Özdemir",
      password: salesManagerPassword,
      role: "COMPANY_EMPLOYEE",
      department: "SALES",
      companyId: customer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
      jobTitle: "Satış Müdürü",
    },
  });
  console.log("✅ Sales Manager created:", salesManager.email);

  // Designer
  const designerPassword = await bcrypt.hash("Design123!", 10);
  const designer = await prisma.user.create({
    data: {
      email: "designer@fashionretail.com",
      name: "Selin Yıldız",
      firstName: "Selin",
      lastName: "Yıldız",
      password: designerPassword,
      role: "COMPANY_EMPLOYEE",
      department: "DESIGN",
      companyId: customer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
      jobTitle: "Baş Tasarımcı",
    },
  });
  console.log("✅ Designer created:", designer.email);

  // Regular Employee
  const employeePassword = await bcrypt.hash("Employee123!", 10);
  const employee = await prisma.user.create({
    data: {
      email: "employee@fashionretail.com",
      name: "Ahmet Şahin",
      firstName: "Ahmet",
      lastName: "Şahin",
      password: employeePassword,
      role: "COMPANY_EMPLOYEE",
      department: "SALES",
      companyId: customer.id,
      isActive: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      isCompanyOwner: false,
      jobTitle: "Satış Temsilcisi",
    },
  });
  console.log("✅ Employee created:", employee.email);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔐 Login Credentials:");
  console.log("\n👤 Admin:");
  console.log("   Email: admin@protexflow.com");
  console.log("   Password: Admin123!");
  console.log("\n🏭 Manufacturer (TextilePro):");
  console.log("   Owner: owner@textilepro.com / Owner123!");
  console.log("   Production Manager: production@textilepro.com / Manager123!");
  console.log("   Quality Control: qc@textilepro.com / QC123!");
  console.log("   Warehouse Manager: warehouse@textilepro.com / Warehouse123!");
  console.log("\n🏢 Customer (Fashion Retail):");
  console.log("   Owner: owner@fashionretail.com / Customer123!");
  console.log("   Sales Manager: sales@fashionretail.com / Sales123!");
  console.log("   Designer: designer@fashionretail.com / Design123!");
  console.log("   Employee: employee@fashionretail.com / Employee123!");
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

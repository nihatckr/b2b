import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated";

const prisma = new PrismaClient();

// Unsplash API Configuration
const UNSPLASH_ACCESS_KEY =
  process.env.UNSPLASH_ACCESS_KEY ||
  "uBbrq5RdhbzS-x_Qe4OAflJ9KdlT-rj4Uu-XPXODIUQ";
const UNSPLASH_API_URL = "https://api.unsplash.com";

// Fetch random image from Unsplash
async function getUnsplashImage(query: string): Promise<string> {
  try {
    // Use placeholder for development to avoid rate limits
    const randomId = Math.random().toString(36).substring(7);
    return `https://via.placeholder.com/800x600/4f46e5/ffffff?text=${encodeURIComponent(
      query
    )}-${randomId}`;

    /* Original Unsplash code (uncomment when needed)
    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/random?query=${encodeURIComponent(
        query
      )}&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      console.warn(
        `⚠️ Unsplash API error for "${query}": ${response.statusText}`
      );
      return `https://images.unsplash.com/photo-1${Math.random()
        .toString()
        .slice(2, 15)}`;
    }

    const data = await response.json();
    return data.urls?.regular || data.urls?.full || "";
    */
  } catch (error) {
    console.warn(`⚠️ Failed to fetch image for "${query}":`, error);
    return `https://via.placeholder.com/800x600/4f46e5/ffffff?text=${encodeURIComponent(
      query
    )}`;
  }
}

// Fetch multiple images
async function getUnsplashImages(
  query: string,
  count: number
): Promise<string[]> {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    const image = await getUnsplashImage(query);
    if (image) images.push(image);
    // Rate limiting: wait 100ms between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return images;
}

async function main() {
  console.log(
    "🌱 Starting seed - Creating authentication-compatible users...\n"
  );

  // ==========================================
  // 1. ADMIN USER
  // ==========================================
  console.log("👤 Creating Admin User...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@protexflow.com" },
    update: {},
    create: {
      email: "admin@protexflow.com",
      name: "System Admin",
      firstName: "System",
      lastName: "Admin",
      password: await bcrypt.hash("Admin123!", 10),
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
      isCompanyOwner: false,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

  // ==========================================
  // 2. MANUFACTURER COMPANY & OWNER
  // ==========================================
  console.log("\n🏭 Creating Manufacturer Company & Owner...");

  const manufacturerOwner = await prisma.user.upsert({
    where: { email: "owner@textilepro.com" },
    update: {},
    create: {
      email: "owner@textilepro.com",
      name: "Ahmet Yılmaz",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      password: await bcrypt.hash("Owner123!", 10),
      role: "COMPANY_OWNER",
      emailVerified: true,
      isActive: true,
      isCompanyOwner: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      phone: "+90 532 555 0001",
      jobTitle: "Genel Müdür",
    },
  });

  // Fetch company logo from Unsplash
  console.log("📸 Fetching company logo...");
  const manufacturerLogo = await getUnsplashImage("textile factory logo");

  const manufacturerCompany = await prisma.company.upsert({
    where: { email: "info@textilepro.com" },
    update: {},
    create: {
      name: "TextilePro Manufacturing",
      type: "MANUFACTURER",
      subscriptionPlan: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      ownerId: manufacturerOwner.id,
      email: "info@textilepro.com",
      phone: "+90 212 555 0001",
      city: "Istanbul",
      country: "Turkey",
      isActive: true,
      logo: manufacturerLogo,
      description: "Premium tekstil üretim firması",
      website: "https://textilepro.com",
      billingCycle: "YEARLY",
      // Subscription dates
      trialStartedAt: new Date("2025-01-01"),
      trialEndsAt: new Date("2025-01-15"),
      subscriptionStartedAt: new Date("2025-01-15"),
      currentPeriodStart: new Date("2025-01-15"),
      currentPeriodEnd: new Date("2026-01-15"),
      // Professional plan limits
      maxUsers: 50,
      maxSamples: 500,
      maxOrders: 200,
      maxCollections: 100,
      maxStorageGB: 20,
      // Current usage
      currentUsers: 1,
      currentSamples: 0,
      currentOrders: 0,
      currentCollections: 0,
      currentStorageGB: 0,
    },
  });

  // Link owner to company
  await prisma.user.update({
    where: { id: manufacturerOwner.id },
    data: { companyId: manufacturerCompany.id },
  });

  console.log("✅ Manufacturer company created:", manufacturerCompany.name);

  // Create Manufacturer Employee
  console.log("👥 Creating manufacturer employee...");

  const manufacturerEmployee = await prisma.user.upsert({
    where: { email: "employee@textilepro.com" },
    update: {},
    create: {
      email: "employee@textilepro.com",
      name: "Mehmet Kaya",
      firstName: "Mehmet",
      lastName: "Kaya",
      password: await bcrypt.hash("Employee123!", 10),
      role: "COMPANY_EMPLOYEE",
      companyId: manufacturerCompany.id,
      department: "PRODUCTION",
      jobTitle: "Üretim Müdürü",
      emailVerified: true,
      isActive: true,
      isCompanyOwner: false,
      emailNotifications: true,
      pushNotifications: false,
      language: "tr",
      timezone: "Europe/Istanbul",
      phone: "+90 532 555 0002",
    },
  });

  // Update company user count
  await prisma.company.update({
    where: { id: manufacturerCompany.id },
    data: { currentUsers: 2 },
  });

  console.log("✅ Manufacturer employee created:", manufacturerEmployee.email);

  // ==========================================
  // 3. BUYER COMPANY & OWNER
  // ==========================================
  console.log("\n🛒 Creating Buyer Company & Owner...");

  const buyerOwner = await prisma.user.upsert({
    where: { email: "owner@fashionretail.com" },
    update: {},
    create: {
      email: "owner@fashionretail.com",
      name: "Elif Demir",
      firstName: "Elif",
      lastName: "Demir",
      password: await bcrypt.hash("Customer123!", 10),
      role: "COMPANY_OWNER",
      emailVerified: true,
      isActive: true,
      isCompanyOwner: true,
      emailNotifications: true,
      pushNotifications: true,
      language: "tr",
      timezone: "Europe/Istanbul",
      phone: "+90 532 555 0010",
      jobTitle: "Satın Alma Müdürü",
    },
  });

  // Fetch buyer company logo
  console.log("📸 Fetching buyer logo...");
  const buyerLogo = await getUnsplashImage("fashion retail store logo");

  const buyerCompany = await prisma.company.upsert({
    where: { email: "orders@fashionretail.com" },
    update: {},
    create: {
      name: "Fashion Retail Inc.",
      type: "BUYER",
      subscriptionPlan: "STARTER",
      subscriptionStatus: "ACTIVE",
      ownerId: buyerOwner.id,
      email: "orders@fashionretail.com",
      phone: "+90 216 555 0002",
      city: "Ankara",
      country: "Turkey",
      isActive: true,
      logo: buyerLogo,
      description: "Moda perakende firması",
      website: "https://fashionretail.com",
      billingCycle: "MONTHLY",
      // Subscription dates
      trialStartedAt: new Date("2025-02-01"),
      trialEndsAt: new Date("2025-02-15"),
      subscriptionStartedAt: new Date("2025-02-15"),
      currentPeriodStart: new Date("2025-10-01"),
      currentPeriodEnd: new Date("2025-11-01"),
      // Starter plan limits
      maxUsers: 10,
      maxSamples: 100,
      maxOrders: 50,
      maxCollections: 20,
      maxStorageGB: 5,
      // Current usage
      currentUsers: 1,
      currentSamples: 0,
      currentOrders: 0,
      currentCollections: 0,
      currentStorageGB: 0,
    },
  });

  // Link owner to company
  await prisma.user.update({
    where: { id: buyerOwner.id },
    data: { companyId: buyerCompany.id },
  });

  console.log("✅ Buyer company created:", buyerCompany.name);

  // Create Buyer Employee
  console.log("👥 Creating buyer employee...");

  const buyerEmployee = await prisma.user.upsert({
    where: { email: "employee@fashionretail.com" },
    update: {},
    create: {
      email: "employee@fashionretail.com",
      name: "Ayşe Yıldız",
      firstName: "Ayşe",
      lastName: "Yıldız",
      password: await bcrypt.hash("Employee123!", 10),
      role: "COMPANY_EMPLOYEE",
      companyId: buyerCompany.id,
      department: "PURCHASING",
      jobTitle: "Satın Alma Uzmanı",
      emailVerified: true,
      isActive: true,
      isCompanyOwner: false,
      emailNotifications: true,
      pushNotifications: false,
      language: "tr",
      timezone: "Europe/Istanbul",
      phone: "+90 532 555 0011",
    },
  });

  // Update company user count
  await prisma.company.update({
    where: { id: buyerCompany.id },
    data: { currentUsers: 2 },
  });

  console.log("✅ Buyer employee created:", buyerEmployee.email);

  // ==========================================
  // 4. INDIVIDUAL CUSTOMER (No Company)
  // ==========================================
  console.log("\n👤 Creating Individual Customer...");

  const individualCustomer = await prisma.user.upsert({
    where: { email: "individual@example.com" },
    update: {},
    create: {
      email: "individual@example.com",
      name: "Can Özkan",
      firstName: "Can",
      lastName: "Özkan",
      password: await bcrypt.hash("Individual123!", 10),
      role: "INDIVIDUAL_CUSTOMER",
      emailVerified: true,
      isActive: true,
      isCompanyOwner: false,
      emailNotifications: true,
      pushNotifications: false,
      language: "tr",
      timezone: "Europe/Istanbul",
      phone: "+90 532 555 0020",
    },
  });

  console.log("✅ Individual customer created:", individualCustomer.email);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n🌟 Seed completed successfully!");
  console.log("\n📊 Created Users:");
  console.log("  🔑 Admin: admin@protexflow.com / Admin123!");
  console.log("  🏭 Manufacturer Owner: owner@textilepro.com / Owner123!");
  console.log(
    "  👷 Manufacturer Employee: employee@textilepro.com / Employee123!"
  );
  console.log("  🛒 Buyer Owner: owner@fashionretail.com / Customer123!");
  console.log("  👤 Buyer Employee: employee@fashionretail.com / Employee123!");
  console.log(
    "  🙋 Individual Customer: individual@example.com / Individual123!"
  );
  console.log("\n📋 User Roles:");
  console.log("  - ADMIN: Full system access");
  console.log("  - COMPANY_OWNER: Company management + all features");
  console.log("  - COMPANY_EMPLOYEE: Limited access based on department");
  console.log("  - INDIVIDUAL_CUSTOMER: Basic customer access without company");
  console.log("\n💳 Subscription Plans:");
  console.log("  - TextilePro: PROFESSIONAL (50 users, 500 samples, yearly)");
  console.log("  - Fashion Retail: STARTER (10 users, 100 samples, monthly)");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

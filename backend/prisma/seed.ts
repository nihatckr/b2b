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
import * as fs from "fs";
import * as path from "path";
import {
  LibraryCategory,
  LibraryScope,
  PrismaClient,
} from "../lib/generated/index.js";

const prisma = new PrismaClient();

// Unsplash API helper function
async function getUnsplashImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
        query
      )}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Unsplash API error for "${query}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.urls?.regular || null;
  } catch (error) {
    console.warn(`⚠️ Failed to fetch Unsplash image for "${query}":`, error);
    return null;
  }
}

// Collection image download and save helper
async function downloadAndSaveCollectionImage(
  imageUrl: string,
  fileName: string
): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(__dirname, "../uploads/collections");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Image saved: ${fileName}`);
    return `/uploads/collections/${fileName}`;
  } catch (error) {
    console.warn(`⚠️ Failed to download image ${fileName}:`, error);
    return `/uploads/collections/placeholder.jpg`;
  }
}

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

  // Update manufacturer company with owner
  await prisma.company.update({
    where: { id: manufacturer.id },
    data: { ownerId: manufacturerOwner.id },
  });
  console.log("✅ Manufacturer company owner set");

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

  // Update customer company with owner
  await prisma.company.update({
    where: { id: customer.id },
    data: { ownerId: customerOwner.id },
  });
  console.log("✅ Customer company owner set");

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
  // 4. LIBRARY DATA - PLATFORM STANDARDS
  // ==========================================
  console.log("\n📚 Creating Library Platform Standards...");

  // FABRICS - Platform Standards with Unsplash Images
  console.log("🖼️  Fetching fabric images from Unsplash...");

  const fabricsData = [
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-COT-001",
      name: "100% Cotton Twill",
      description: "Premium 100% cotton twill fabric for shirts and trousers",
      query: "cotton twill fabric texture",
      data: JSON.stringify({
        composition: "100% Cotton",
        weight: 240,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-PES-001",
      name: "Polyester Cotton Blend",
      description: "Durable poly-cotton blend for casual and workwear",
      query: "polyester fabric texture",
      data: JSON.stringify({
        composition: "65% Polyester, 35% Cotton",
        weight: 200,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-DEN-001",
      name: "14oz Classic Denim",
      description: "Heavy-weight denim fabric for jeans and jackets",
      query: "denim fabric texture blue",
      data: JSON.stringify({
        composition: "100% Cotton",
        weight: 400,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-LIN-001",
      name: "Pure Linen",
      description: "Natural linen fabric for summer clothing",
      query: "linen fabric texture natural",
      data: JSON.stringify({
        composition: "100% Linen",
        weight: 180,
        width: 140,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-SIL-001",
      name: "Pure Silk Satin",
      description: "Luxurious silk satin for elegant garments",
      query: "silk satin fabric luxury",
      data: JSON.stringify({
        composition: "100% Silk",
        weight: 120,
        width: 140,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-WOL-001",
      name: "Merino Wool",
      description: "Premium merino wool for winter garments",
      query: "wool fabric texture",
      data: JSON.stringify({
        composition: "100% Merino Wool",
        weight: 300,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-VEL-001",
      name: "Cotton Velvet",
      description: "Soft cotton velvet for premium garments",
      query: "velvet fabric texture",
      data: JSON.stringify({
        composition: "100% Cotton Velvet",
        weight: 350,
        width: 140,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-JER-001",
      name: "Jersey Knit",
      description: "Soft jersey knit fabric for comfortable wear",
      query: "jersey knit fabric texture",
      data: JSON.stringify({
        composition: "95% Cotton, 5% Spandex",
        weight: 180,
        width: 160,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-CAN-001",
      name: "Canvas",
      description: "Heavy-duty canvas for workwear and bags",
      query: "canvas fabric texture",
      data: JSON.stringify({
        composition: "100% Cotton Canvas",
        weight: 450,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-FLE-001",
      name: "Polar Fleece",
      description: "Warm fleece fabric for winter clothing",
      query: "fleece fabric texture",
      data: JSON.stringify({
        composition: "100% Polyester Fleece",
        weight: 280,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-COR-001",
      name: "Corduroy",
      description: "Classic corduroy fabric with ribbed texture",
      query: "corduroy fabric texture",
      data: JSON.stringify({
        composition: "98% Cotton, 2% Spandex",
        weight: 320,
        width: 145,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-CHI-001",
      name: "Chiffon",
      description: "Lightweight chiffon for elegant dresses",
      query: "chiffon fabric texture",
      data: JSON.stringify({
        composition: "100% Polyester Chiffon",
        weight: 60,
        width: 150,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-LAC-001",
      name: "Cotton Lace",
      description: "Delicate lace fabric for decorative details",
      query: "lace fabric texture white",
      data: JSON.stringify({
        composition: "100% Cotton Lace",
        weight: 90,
        width: 130,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-NEO-001",
      name: "Neoprene",
      description: "Technical neoprene fabric for sportswear",
      query: "neoprene fabric texture",
      data: JSON.stringify({
        composition: "Neoprene Blend",
        weight: 380,
        width: 140,
      }),
    },
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FAB-MES-001",
      name: "Athletic Mesh",
      description: "Breathable mesh for activewear",
      query: "mesh fabric texture athletic",
      data: JSON.stringify({
        composition: "100% Polyester Mesh",
        weight: 140,
        width: 160,
      }),
    },
  ];

  // Fetch Unsplash images for fabrics
  for (const fabric of fabricsData) {
    const imageUrl = await getUnsplashImage(fabric.query);
    if (imageUrl) {
      (fabric as any).imageUrl = imageUrl;
      console.log(`✅ Image fetched for: ${fabric.name}`);
    } else {
      console.log(`⚠️  No image for: ${fabric.name}`);
    }
    // Remove query field as it's not in Prisma schema
    delete (fabric as any).query;
    // Add small delay to respect Unsplash rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // MATERIALS - Platform Standards
  const materialsData = [
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "ACC-BTN-001",
      name: "Classic White Buttons",
      description: "Standard 4-hole white polyester buttons for shirts",
      data: JSON.stringify({
        type: "Button",
        accessoryType: "Button",
        material: "Polyester",
        color: "White",
        size: "18mm",
        finish: "Matte",
        packaging: "100 pieces per pack",
        minimumOrderQuantity: 1000,
        leadTime: "2-3 weeks",
        pricePerUnit: 0.05,
        currency: "USD",
      }),
    },
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "ACC-ZIP-001",
      name: "Metal Zipper - Antique Brass",
      description: "YKK metal zipper with antique brass finish",
      data: JSON.stringify({
        type: "Zipper",
        accessoryType: "Zipper",
        material: "Metal",
        color: "Antique Brass",
        size: "Various lengths",
        finish: "Antique brass coating",
        packaging: "Individual packaging",
        minimumOrderQuantity: 500,
        leadTime: "3-4 weeks",
        pricePerUnit: 1.2,
        currency: "USD",
      }),
    },
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "ACC-LBL-001",
      name: "Care Label Set",
      description: "Standard care instruction labels in multiple languages",
      data: JSON.stringify({
        type: "Care Label",
        accessoryType: "Care Label",
        material: "Polyester Satin",
        color: "White",
        size: "40x15mm",
        finish: "Heat-sealed edges",
        packaging: "500 labels per roll",
        minimumOrderQuantity: 2000,
        leadTime: "1-2 weeks",
        pricePerUnit: 0.02,
        currency: "USD",
      }),
    },
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "ACC-THR-001",
      name: "Polyester Thread",
      description: "High-quality polyester sewing thread for all garment types",
      data: JSON.stringify({
        type: "Thread",
        accessoryType: "Thread",
        material: "100% Polyester",
        color: "Assorted",
        size: "40/2 weight",
        finish: "Smooth finish",
        packaging: "5000m spools",
        minimumOrderQuantity: 100,
        leadTime: "1 week",
        pricePerUnit: 3.5,
        currency: "USD",
      }),
    },
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "ACC-ELA-001",
      name: "Elastic Band",
      description: "Standard elastic band for waistbands and cuffs",
      data: JSON.stringify({
        type: "Elastic",
        accessoryType: "Elastic",
        material: "Polyester/Spandex blend",
        color: "Black/White",
        size: "Various widths",
        finish: "Knitted",
        packaging: "100m rolls",
        minimumOrderQuantity: 50,
        leadTime: "2 weeks",
        pricePerUnit: 8.0,
        currency: "USD",
      }),
    },
  ];

  // SIZE GROUPS - Platform Standards
  const sizeGroupsData = [
    {
      category: LibraryCategory.SIZE_GROUP,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "EU_ADULT",
      name: "European Adult Sizes",
      description: "Standard European adult clothing sizes",
      data: JSON.stringify({
        regionalStandard: "EU",
        targetGender: "UNISEX",
        sizeCategory: "TOP",
        sizeSystemType: "ALPHA",
        sizes: "XS, S, M, L, XL, XXL, XXXL",
      }),
    },
    {
      category: LibraryCategory.SIZE_GROUP,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "EU_KIDS",
      name: "European Kids Sizes",
      description: "Standard European children clothing sizes",
      data: JSON.stringify({
        regionalStandard: "EU",
        targetGender: "UNISEX",
        sizeCategory: "KIDS",
        sizeSystemType: "NUMERIC",
        sizes: "2, 4, 6, 8, 10, 12, 14, 16",
      }),
    },
    {
      category: LibraryCategory.SIZE_GROUP,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "US_WOMEN",
      name: "US Women's Bottoms",
      description: "Standard US women's bottom sizes",
      data: JSON.stringify({
        regionalStandard: "US",
        targetGender: "WOMEN",
        sizeCategory: "BOTTOM",
        sizeSystemType: "NUMERIC",
        sizes: "0, 2, 4, 6, 8, 10, 12, 14, 16, 18",
      }),
    },
  ];

  // CERTIFICATIONS - Platform Standards
  const certificationsData = [
    {
      category: LibraryCategory.CERTIFICATION,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "OEKO-2024",
      name: "OEKO-TEX Standard 100",
      description:
        "International certification for textile safety and human ecology",
      data: JSON.stringify({
        issuer: "OEKO-TEX",
        validityPeriod: "1-year",
        certificationNumber: "OTX-100-2024",
        issueDate: "2024-01-01",
        validUntil: "2024-12-31",
        renewalDate: "2024-11-01",
        status: "ACTIVE",
        applicableCategories: ["FABRIC", "MATERIAL", "GENERAL"],
      }),
      tags: JSON.stringify([
        "APPLIES_TO_FABRIC",
        "APPLIES_TO_MATERIAL",
        "APPLIES_TO_GENERAL",
      ]),
    },
    {
      category: LibraryCategory.CERTIFICATION,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "GOTS-2027",
      name: "Global Organic Textile Standard",
      description:
        "Certification for organic fiber textiles and environmental sustainability",
      data: JSON.stringify({
        issuer: "GOTS",
        validityPeriod: "3-years",
        certificationNumber: "GOTS-2024-001",
        issueDate: "2024-01-01",
        validUntil: "2027-01-01",
        renewalDate: "2026-11-01",
        status: "ACTIVE",
        applicableCategories: ["FABRIC", "GENERAL"],
      }),
      tags: JSON.stringify(["APPLIES_TO_FABRIC", "APPLIES_TO_GENERAL"]),
    },
    {
      category: LibraryCategory.CERTIFICATION,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "ISO-2027",
      name: "ISO 9001:2015 Quality Management",
      description: "International standard for quality management systems",
      data: JSON.stringify({
        issuer: "ISO",
        validityPeriod: "3-years",
        certificationNumber: "ISO-9001-2024",
        issueDate: "2024-01-01",
        validUntil: "2027-01-01",
        renewalDate: "2026-11-01",
        status: "ACTIVE",
        applicableCategories: ["GENERAL"],
      }),
      tags: JSON.stringify(["APPLIES_TO_GENERAL"]),
    },
  ];

  // COLORS - Platform Standards
  const colorsData = [
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "CLR-000000",
      name: "Classic Black",
      description: "Pure black color for professional garments",
      data: JSON.stringify({
        hex: "#000000",
        pantone: "BLACK C",
        r: 0,
        g: 0,
        b: 0,
      }),
    },
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "CLR-FFFFFF",
      name: "Pure White",
      description: "Clean white color for classic garments",
      data: JSON.stringify({
        hex: "#FFFFFF",
        pantone: "WHITE C",
        r: 255,
        g: 255,
        b: 255,
      }),
    },
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "CLR-1E3A8A",
      name: "Navy Blue",
      description: "Professional navy blue for business attire",
      data: JSON.stringify({
        hex: "#1E3A8A",
        pantone: "PANTONE 533C",
        r: 30,
        g: 58,
        b: 138,
      }),
    },
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "CLR-DC2626",
      name: "Crimson Red",
      description: "Bold red color for statement pieces",
      data: JSON.stringify({
        hex: "#DC2626",
        pantone: "PANTONE 18-1664 TPX",
        r: 220,
        g: 38,
        b: 38,
      }),
    },
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "CLR-059669",
      name: "Forest Green",
      description: "Natural green color for outdoor collections",
      data: JSON.stringify({
        hex: "#059669",
        pantone: "PANTONE 342C",
        r: 5,
        g: 150,
        b: 105,
      }),
    },
  ];

  // FIT - Platform Standards
  const fitData = [
    {
      category: LibraryCategory.FIT,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FIT-MEN-SLIM-TOP",
      name: "Slim Fit Top (Men)",
      description: "Modern slim-fitting cut for men's tops and shirts",
      data: JSON.stringify({
        id: "FIT-MEN-SLIM-TOP",
        name: "Slim Fit Top (Men)",
        gender: "Men",
        category: "Top",
        fit_style: "SLIM",
        size_group_id: "EU_ADULT",
        selected_sizes: ["S", "M", "L", "XL", "XXL"],
        ease_notes:
          "Close-fitting silhouette with minimal ease. Chest: +5cm ease, Waist: +3cm ease",
      }),
    },
    {
      category: LibraryCategory.FIT,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FIT-WOMEN-REGULAR-DRESS",
      name: "Regular Fit Dress (Women)",
      description: "Classic regular fit for women's dresses",
      data: JSON.stringify({
        id: "FIT-WOMEN-REGULAR-DRESS",
        name: "Regular Fit Dress (Women)",
        gender: "Women",
        category: "Dress",
        fit_style: "REGULAR",
        size_group_id: "EU_ADULT",
        selected_sizes: ["XS", "S", "M", "L", "XL"],
        ease_notes:
          "Standard fit with comfortable ease. Bust: +8cm ease, Waist: +6cm ease, Hip: +8cm ease",
      }),
    },
    {
      category: LibraryCategory.FIT,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FIT-UNISEX-OVERSIZED-OUTERWEAR",
      name: "Oversized Fit Outerwear (Unisex)",
      description: "Relaxed oversized fit for unisex outerwear",
      data: JSON.stringify({
        id: "FIT-UNISEX-OVERSIZED-OUTERWEAR",
        name: "Oversized Fit Outerwear (Unisex)",
        gender: "Unisex",
        category: "Outerwear",
        fit_style: "OVERSIZED",
        size_group_id: "EU_ADULT",
        selected_sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        ease_notes:
          "Loose, relaxed fit with generous ease. Chest: +15cm ease, Length: Extended for layering",
      }),
    },
    {
      category: LibraryCategory.FIT,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: "FIT-WOMEN-SKINNY-BOTTOM",
      name: "Skinny Fit Bottom (Women)",
      description: "Form-fitting skinny cut for women's bottoms",
      data: JSON.stringify({
        id: "FIT-WOMEN-SKINNY-BOTTOM",
        name: "Skinny Fit Bottom (Women)",
        gender: "Women",
        category: "Bottom",
        fit_style: "SKINNY",
        size_group_id: "US_WOMEN",
        selected_sizes: ["0", "2", "4", "6", "8", "10", "12", "14"],
        ease_notes:
          "Form-fitting silhouette. Waist: +2cm ease, Hip: +4cm ease, Thigh: Minimal ease",
      }),
    },
  ];

  // SEASON - Platform Standards
  const seasonData = [
    {
      category: LibraryCategory.SEASON,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: null, // Season codes are auto-generated as null in backend
      name: "Spring/Summer 2024",
      description: "Spring/Summer collection for 2024 season",
      data: JSON.stringify({
        type: "SS",
        year: 2024,
      }),
    },
    {
      category: LibraryCategory.SEASON,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: null, // Season codes are auto-generated as null in backend
      name: "Fall/Winter 2024",
      description: "Fall/Winter collection for 2024 season",
      data: JSON.stringify({
        type: "FW",
        year: 2024,
      }),
    },
    {
      category: LibraryCategory.SEASON,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: null, // Season codes are auto-generated as null in backend
      name: "Spring/Summer 2025",
      description: "Spring/Summer collection for 2025 season",
      data: JSON.stringify({
        type: "SS",
        year: 2025,
      }),
    },
    {
      category: LibraryCategory.SEASON,
      scope: LibraryScope.PLATFORM_STANDARD,
      code: null, // Season codes are auto-generated as null in backend
      name: "Fall/Winter 2025",
      description: "Fall/Winter collection for 2025 season",
      data: JSON.stringify({
        type: "FW",
        year: 2025,
      }),
    },
  ];

  // Create Platform Standards
  const allPlatformStandards = [
    ...fabricsData,
    ...materialsData,
    ...sizeGroupsData,
    ...certificationsData,
    ...colorsData,
    ...fitData,
    ...seasonData,
  ];

  for (const item of allPlatformStandards) {
    await prisma.libraryItem.create({
      data: {
        ...item,
        createdById: admin.id,
      },
    });
  }

  console.log(
    `✅ Created ${allPlatformStandards.length} platform standard library items`
  );

  // ==========================================
  // 5. LIBRARY DATA - COMPANY CUSTOM
  // ==========================================
  console.log("\n🏢 Creating Company Custom Library Items...");

  // Manufacturer Custom Items
  const manufacturerCustomItems = [
    {
      category: LibraryCategory.FABRIC,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "TXP-FAB-001",
      name: "TextilePro Signature Cotton",
      description: "Our signature cotton blend exclusive to TextilePro",
      companyId: manufacturer.id,
      data: JSON.stringify({
        composition: "95% Cotton, 5% Elastane",
        weight: 220,
        width: 160,
      }),
      isPopular: false,
    },
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "TXP-BTN-001",
      name: "TextilePro Logo Buttons",
      description: "Custom branded buttons with TextilePro logo",
      companyId: manufacturer.id,
      data: JSON.stringify({
        type: "Button",
        accessoryType: "Button",
        material: "Metal",
        color: "Silver",
        size: "20mm",
        finish: "Brushed with engraved logo",
        packaging: "50 pieces per pack",
        minimumOrderQuantity: 500,
        leadTime: "3-4 weeks",
        pricePerUnit: 0.15,
        currency: "USD",
      }),
      isPopular: false,
    },
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "TXP-CLR-001",
      name: "TextilePro Industrial Gray",
      description: "Professional industrial gray for workwear collections",
      companyId: manufacturer.id,
      data: JSON.stringify({
        hex: "#6B7280",
        pantone: "PANTONE Cool Gray 9C",
        r: 107,
        g: 114,
        b: 128,
      }),
      isPopular: true,
    },
    {
      category: LibraryCategory.SEASON,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: null, // Season codes are auto-generated as null
      name: "TextilePro Industrial Collection 2024",
      description: "Specialized industrial workwear collection for 2024",
      companyId: manufacturer.id,
      data: JSON.stringify({
        type: "FW",
        year: 2024,
        collection: "Industrial Workwear",
      }),
      isPopular: true,
    },
  ];

  // Customer Custom Items
  const customerCustomItems = [
    {
      category: LibraryCategory.SIZE_GROUP,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "FR-SG-001",
      name: "Fashion Retail Plus Sizes",
      description: "Extended size range for our plus-size collection",
      companyId: customer.id,
      data: JSON.stringify({
        regionalStandard: "US",
        targetGender: "WOMEN",
        sizeCategory: "TOP",
        sizeSystemType: "ALPHA",
        sizes: "1X, 2X, 3X, 4X, 5X",
      }),
      isPopular: false,
    },
    {
      category: LibraryCategory.MATERIAL,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "FR-LBL-001",
      name: "Fashion Retail Brand Tags",
      description: "Custom woven brand tags for Fashion Retail products",
      companyId: customer.id,
      data: JSON.stringify({
        type: "Brand Label",
        accessoryType: "Brand Label",
        material: "Cotton twill",
        color: "Navy Blue",
        size: "50x20mm",
        finish: "Woven with folded edges",
        packaging: "250 labels per pack",
        minimumOrderQuantity: 1000,
        leadTime: "2-3 weeks",
        pricePerUnit: 0.08,
        currency: "USD",
      }),
      isPopular: false,
    },
    {
      category: LibraryCategory.COLOR,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "FR-CLR-001",
      name: "Fashion Retail Brand Blue",
      description: "Signature brand color for Fashion Retail products",
      companyId: customer.id,
      data: JSON.stringify({
        hex: "#2563EB",
        pantone: "PANTONE 2728C",
        r: 37,
        g: 99,
        b: 235,
      }),
      isPopular: true,
    },
    {
      category: LibraryCategory.FIT,
      scope: LibraryScope.COMPANY_CUSTOM,
      code: "FR-FIT-001",
      name: "Fashion Retail Comfort Fit Top",
      description: "Signature comfort fit for Fashion Retail casual tops",
      companyId: customer.id,
      data: JSON.stringify({
        id: "FR-FIT-001",
        name: "Fashion Retail Comfort Fit Top",
        gender: "Unisex",
        category: "Top",
        fit_style: "REGULAR",
        size_group_id: "EU_ADULT",
        selected_sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        ease_notes:
          "Relaxed comfort fit with extra room for movement. Chest: +10cm ease, Length: +2cm for comfort",
      }),
      isPopular: true,
    },
  ];

  // Create Company Custom Items
  // Manufacturer items created by manufacturer owner
  for (const item of manufacturerCustomItems) {
    await prisma.libraryItem.create({
      data: {
        ...item,
        createdById: manufacturerOwner.id,
      },
    });
  }

  // Customer items created by customer owner
  for (const item of customerCustomItems) {
    await prisma.libraryItem.create({
      data: {
        ...item,
        createdById: customerOwner.id,
      },
    });
  }

  const allCompanyItems = [...manufacturerCustomItems, ...customerCustomItems];

  console.log(
    `✅ Created ${allCompanyItems.length} company custom library items`
  );

  // ==========================================
  // 6. STANDARD CATEGORIES - 3-Level Hierarchy (ROOT → MAIN → SUB)
  // ==========================================
  console.log("\n📂 Creating Standard Categories with 3-Level Hierarchy...");

  // ==========================================
  // ROOT LEVEL (Level 1) - Gender & Main Categories
  // ==========================================

  // 1. KADIN (Women)
  const womenRoot = await prisma.standardCategory.create({
    data: {
      code: "WOM-001",
      name: "Kadın",
      description: "Kadın giyim ve aksesuarları",
      level: "ROOT",
      order: 1,
      icon: "User",
      isActive: true,
      isPublic: true,
      keywords: '["kadın", "women", "bayan", "female"]',
      tags: "#kadın #women #bayan",
      createdById: admin.id,
    },
  });

  // 2. ERKEK (Men)
  const menRoot = await prisma.standardCategory.create({
    data: {
      code: "MEN-001",
      name: "Erkek",
      description: "Erkek giyim ve aksesuarları",
      level: "ROOT",
      order: 2,
      icon: "User",
      isActive: true,
      isPublic: true,
      keywords: '["erkek", "men", "male", "bay"]',
      tags: "#erkek #men #bay",
      createdById: admin.id,
    },
  });

  // 3. ÇOCUK (Kids)
  const kidsRoot = await prisma.standardCategory.create({
    data: {
      code: "KID-001",
      name: "Çocuk",
      description: "Çocuk giyim ve aksesuarları",
      level: "ROOT",
      order: 3,
      icon: "Baby",
      isActive: true,
      isPublic: true,
      keywords: '["çocuk", "kids", "children", "bebek", "baby"]',
      tags: "#çocuk #kids #children #bebek",
      createdById: admin.id,
    },
  });

  // 4. AKSESUAR (Accessories)
  const accessoryRoot = await prisma.standardCategory.create({
    data: {
      code: "ACC-001",
      name: "Aksesuar",
      description: "Çanta, kemer ve diğer aksesuarlar",
      level: "ROOT",
      order: 4,
      icon: "Package",
      isActive: true,
      isPublic: true,
      keywords: '["aksesuar", "accessory", "çanta", "kemer", "bag", "belt"]',
      tags: "#aksesuar #accessory #çanta #kemer",
      createdById: admin.id,
    },
  });

  // 5. AYAKKABI (Footwear)
  const footwearRoot = await prisma.standardCategory.create({
    data: {
      code: "SHO-001",
      name: "Ayakkabı",
      description: "Spor, klasik ve diğer ayakkabı türleri",
      level: "ROOT",
      order: 5,
      icon: "Shoe",
      isActive: true,
      isPublic: true,
      keywords: '["ayakkabı", "shoes", "footwear", "spor", "klasik"]',
      tags: "#ayakkabı #shoes #footwear",
      createdById: admin.id,
    },
  });

  // ==========================================
  // MAIN LEVEL (Level 2) - Clothing Categories
  // ==========================================

  // KADIN - MAIN Categories
  const womenUpperWear = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-001",
      name: "Üst Giyim",
      description: "Kadın üst giyim ürünleri",
      level: "MAIN",
      order: 1,
      icon: "Shirt",
      parentId: womenRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["üst giyim", "kadın", "women", "top", "shirt", "blouse"]',
      tags: "#kadın_üst_giyim #women_tops #shirt #blouse",
      createdById: admin.id,
    },
  });

  const womenLowerWear = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002",
      name: "Alt Giyim",
      description: "Kadın alt giyim ürünleri",
      level: "MAIN",
      order: 2,
      icon: "Pants",
      parentId: womenRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["alt giyim", "kadın", "women", "bottom", "pants", "skirt"]',
      tags: "#kadın_alt_giyim #women_bottoms #pants #skirt",
      createdById: admin.id,
    },
  });

  const womenOuterwear = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-003",
      name: "Dış Giyim",
      description: "Kadın dış giyim ürünleri",
      level: "MAIN",
      order: 3,
      icon: "Coat",
      parentId: womenRoot.id,
      isActive: true,
      isPublic: true,
      keywords:
        '["dış giyim", "kadın", "women", "coat", "jacket", "outerwear"]',
      tags: "#kadın_dış_giyim #women_outerwear #coat #jacket",
      createdById: admin.id,
    },
  });

  const womenDresses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-004",
      name: "Elbise & Tulum",
      description: "Kadın elbise ve tulum ürünleri",
      level: "MAIN",
      order: 4,
      icon: "Dress",
      parentId: womenRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["elbise", "tulum", "kadın", "women", "dress", "jumpsuit"]',
      tags: "#kadın_elbise #women_dress #jumpsuit",
      createdById: admin.id,
    },
  });

  const womenKnitwear = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-005",
      name: "Triko",
      description: "Kadın triko ürünleri",
      level: "MAIN",
      order: 5,
      icon: "Sweater",
      parentId: womenRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["triko", "kazak", "hırka", "kadın", "women", "knitwear"]',
      tags: "#kadın_triko #women_knitwear #sweater #cardigan",
      createdById: admin.id,
    },
  });

  const womenActivewear = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-006",
      name: "Aktif Spor",
      description: "Kadın spor giyim ürünleri",
      level: "MAIN",
      order: 6,
      icon: "Activity",
      parentId: womenRoot.id,
      isActive: true,
      isPublic: true,
      keywords:
        '["spor", "aktif", "kadın", "women", "sportswear", "activewear"]',
      tags: "#kadın_spor #women_sport #activewear #sportswear",
      createdById: admin.id,
    },
  });

  // ERKEK - MAIN Categories
  const menUpperWear = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001",
      name: "Üst Giyim",
      description: "Erkek üst giyim ürünleri",
      level: "MAIN",
      order: 1,
      icon: "Shirt",
      parentId: menRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["üst giyim", "erkek", "men", "top", "shirt", "t-shirt"]',
      tags: "#erkek_üst_giyim #men_tops #shirt #tshirt",
      createdById: admin.id,
    },
  });

  const menLowerWear = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-002",
      name: "Alt Giyim",
      description: "Erkek alt giyim ürünleri",
      level: "MAIN",
      order: 2,
      icon: "Pants",
      parentId: menRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["alt giyim", "erkek", "men", "bottom", "pants", "jeans"]',
      tags: "#erkek_alt_giyim #men_bottoms #pants #jeans",
      createdById: admin.id,
    },
  });

  const menOuterwear = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-003",
      name: "Dış Giyim",
      description: "Erkek dış giyim ürünleri",
      level: "MAIN",
      order: 3,
      icon: "Coat",
      parentId: menRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["dış giyim", "erkek", "men", "coat", "jacket", "parka"]',
      tags: "#erkek_dış_giyim #men_outerwear #coat #jacket #parka",
      createdById: admin.id,
    },
  });

  const menKnitwear = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-004",
      name: "Triko",
      description: "Erkek triko ürünleri",
      level: "MAIN",
      order: 4,
      icon: "Sweater",
      parentId: menRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["triko", "kazak", "erkek", "men", "knitwear", "sweater"]',
      tags: "#erkek_triko #men_knitwear #sweater",
      createdById: admin.id,
    },
  });

  const menActivewear = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-005",
      name: "Aktif Spor",
      description: "Erkek spor giyim ürünleri",
      level: "MAIN",
      order: 5,
      icon: "Activity",
      parentId: menRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["spor", "aktif", "erkek", "men", "sportswear", "activewear"]',
      tags: "#erkek_spor #men_sport #activewear #sportswear",
      createdById: admin.id,
    },
  });

  // ÇOCUK - MAIN Categories
  const babyWear = await prisma.standardCategory.create({
    data: {
      code: "KID-001-001",
      name: "Bebek (0-24 Ay)",
      description: "0-24 ay bebek giyim ürünleri",
      level: "MAIN",
      order: 1,
      icon: "Baby",
      parentId: kidsRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["bebek", "baby", "0-24 ay", "infant", "newborn"]',
      tags: "#bebek #baby #infant #newborn",
      createdById: admin.id,
    },
  });

  const girlsWear = await prisma.standardCategory.create({
    data: {
      code: "KID-001-002",
      name: "Kız Çocuk",
      description: "Kız çocuk giyim ürünleri",
      level: "MAIN",
      order: 2,
      icon: "Heart",
      parentId: kidsRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["kız çocuk", "girls", "female kids", "çocuk"]',
      tags: "#kız_çocuk #girls #kids",
      createdById: admin.id,
    },
  });

  const boysWear = await prisma.standardCategory.create({
    data: {
      code: "KID-001-003",
      name: "Erkek Çocuk",
      description: "Erkek çocuk giyim ürünleri",
      level: "MAIN",
      order: 3,
      icon: "Star",
      parentId: kidsRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["erkek çocuk", "boys", "male kids", "çocuk"]',
      tags: "#erkek_çocuk #boys #kids",
      createdById: admin.id,
    },
  });

  const kidsOuterwear = await prisma.standardCategory.create({
    data: {
      code: "KID-001-004",
      name: "Dış Giyim",
      description: "Çocuk dış giyim ürünleri",
      level: "MAIN",
      order: 4,
      icon: "Coat",
      parentId: kidsRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["dış giyim", "çocuk", "kids", "coat", "jacket", "mont"]',
      tags: "#çocuk_dış_giyim #kids_outerwear #mont",
      createdById: admin.id,
    },
  });

  // AKSESUAR - MAIN Categories
  const bagsBelts = await prisma.standardCategory.create({
    data: {
      code: "ACC-001-001",
      name: "Çanta & Kemer",
      description: "Çanta ve kemer ürünleri",
      level: "MAIN",
      order: 1,
      icon: "Bag",
      parentId: accessoryRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["çanta", "kemer", "bag", "belt", "handbag", "backpack"]',
      tags: "#çanta #kemer #bag #belt",
      createdById: admin.id,
    },
  });

  const hatsBerets = await prisma.standardCategory.create({
    data: {
      code: "ACC-001-002",
      name: "Şapka & Bere",
      description: "Şapka ve bere ürünleri",
      level: "MAIN",
      order: 2,
      icon: "Hat",
      parentId: accessoryRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["şapka", "bere", "hat", "cap", "beanie"]',
      tags: "#şapka #bere #hat #cap",
      createdById: admin.id,
    },
  });

  // AYAKKABI - MAIN Categories
  const sportShoes = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-001",
      name: "Spor",
      description: "Spor ayakkabı ürünleri",
      level: "MAIN",
      order: 1,
      icon: "Zap",
      parentId: footwearRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["spor ayakkabı", "sneaker", "running", "sport shoes"]',
      tags: "#spor_ayakkabı #sneaker #running #sport",
      createdById: admin.id,
    },
  });

  const classicShoes = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-002",
      name: "Klasik",
      description: "Klasik ayakkabı ürünleri",
      level: "MAIN",
      order: 2,
      icon: "Briefcase",
      parentId: footwearRoot.id,
      isActive: true,
      isPublic: true,
      keywords: '["klasik ayakkabı", "dress shoes", "formal", "leather"]',
      tags: "#klasik_ayakkabı #dress_shoes #formal #leather",
      createdById: admin.id,
    },
  });

  // ==========================================
  // SUB LEVEL (Level 3) - Specific Product Categories
  // ==========================================

  // KADIN - ÜST GİYİM - SUB Categories
  const womenTshirts = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-001-001",
      name: "Tişört",
      description: "Kadın tişört ürünleri",
      level: "SUB",
      order: 1,
      icon: "TShirt",
      parentId: womenUpperWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["tişört", "t-shirt", "kadın", "women", "basic tee"]',
      tags: "#kadın_tişört #women_tshirt #basic",
      createdById: admin.id,
    },
  });

  const womenShirtsBlouses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-001-002",
      name: "Gömlek/Bluz",
      description: "Kadın gömlek ve bluz ürünleri",
      level: "SUB",
      order: 2,
      icon: "Shirt",
      parentId: womenUpperWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["gömlek", "bluz", "kadın", "women", "shirt", "blouse"]',
      tags: "#kadın_gömlek #kadın_bluz #women_shirt #blouse",
      createdById: admin.id,
    },
  });

  const womenSweatshirts = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-001-003",
      name: "Sweatshirt/Hoodie",
      description: "Kadın sweatshirt ve hoodie ürünleri",
      level: "SUB",
      order: 3,
      icon: "Hoodie",
      parentId: womenUpperWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["sweatshirt", "hoodie", "kadın", "women", "casual"]',
      tags: "#kadın_sweatshirt #women_hoodie #casual",
      createdById: admin.id,
    },
  });

  // KADIN - ALT GİYİM - SUB Categories
  const womenJeans = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002-001",
      name: "Jean",
      description: "Kadın jean ürünleri",
      level: "SUB",
      order: 1,
      icon: "Jeans",
      parentId: womenLowerWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["jean", "denim", "kadın", "women", "jeans"]',
      tags: "#kadın_jean #women_jeans #denim",
      createdById: admin.id,
    },
  });

  const womenTrousers = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002-002",
      name: "Chino/Pantolon",
      description: "Kadın chino ve pantolon ürünleri",
      level: "SUB",
      order: 2,
      icon: "Pants",
      parentId: womenLowerWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["chino", "pantolon", "kadın", "women", "trousers"]',
      tags: "#kadın_pantolon #women_trousers #chino",
      createdById: admin.id,
    },
  });

  const womenSkirts = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002-003",
      name: "Etek",
      description: "Kadın etek ürünleri",
      level: "SUB",
      order: 3,
      icon: "Skirt",
      parentId: womenLowerWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["etek", "skirt", "kadın", "women", "mini", "maxi"]',
      tags: "#kadın_etek #women_skirt #mini #maxi",
      createdById: admin.id,
    },
  });

  // KADIN - DIŞ GİYİM - SUB Categories
  const womenJackets = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-003-001",
      name: "Ceket",
      description: "Kadın ceket ürünleri",
      level: "SUB",
      order: 1,
      icon: "Jacket",
      parentId: womenOuterwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["ceket", "jacket", "kadın", "women", "blazer"]',
      tags: "#kadın_ceket #women_jacket #blazer",
      createdById: admin.id,
    },
  });

  const womenCoats = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-003-002",
      name: "Kaban",
      description: "Kadın kaban ürünleri",
      level: "SUB",
      order: 2,
      icon: "Coat",
      parentId: womenOuterwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["kaban", "coat", "kadın", "women", "trench"]',
      tags: "#kadın_kaban #women_coat #trench",
      createdById: admin.id,
    },
  });

  // KADIN - ELBİSE & TULUM - SUB Categories
  const womenDress = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-004-001",
      name: "Elbise",
      description: "Kadın elbise ürünleri",
      level: "SUB",
      order: 1,
      icon: "Dress",
      parentId: womenDresses.id,
      isActive: true,
      isPublic: true,
      keywords: '["elbise", "dress", "kadın", "women", "mini", "maxi"]',
      tags: "#kadın_elbise #women_dress #mini #maxi",
      createdById: admin.id,
    },
  });

  const womenJumpsuit = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-004-002",
      name: "Tulum",
      description: "Kadın tulum ürünleri",
      level: "SUB",
      order: 2,
      icon: "Jumpsuit",
      parentId: womenDresses.id,
      isActive: true,
      isPublic: true,
      keywords: '["tulum", "jumpsuit", "kadın", "women", "overall"]',
      tags: "#kadın_tulum #women_jumpsuit #overall",
      createdById: admin.id,
    },
  });

  // KADIN - TRİKO - SUB Categories
  const womenSweaters = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-005-001",
      name: "Kazak",
      description: "Kadın kazak ürünleri",
      level: "SUB",
      order: 1,
      icon: "Sweater",
      parentId: womenKnitwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["kazak", "sweater", "kadın", "women", "pullover"]',
      tags: "#kadın_kazak #women_sweater #pullover",
      createdById: admin.id,
    },
  });

  const womenCardigans = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-005-002",
      name: "Hırka",
      description: "Kadın hırka ürünleri",
      level: "SUB",
      order: 2,
      icon: "Cardigan",
      parentId: womenKnitwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["hırka", "cardigan", "kadın", "women", "knitwear"]',
      tags: "#kadın_hırka #women_cardigan #knitwear",
      createdById: admin.id,
    },
  });

  // KADIN - AKTİF SPOR - SUB Categories
  const womenSportsTights = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-006-001",
      name: "Spor Tayt",
      description: "Kadın spor tayt ürünleri",
      level: "SUB",
      order: 1,
      icon: "Leggings",
      parentId: womenActivewear.id,
      isActive: true,
      isPublic: true,
      keywords: '["spor tayt", "leggings", "kadın", "women", "activewear"]',
      tags: "#kadın_spor_tayt #women_leggings #activewear",
      createdById: admin.id,
    },
  });

  const womenSportsTops = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-006-002",
      name: "Spor Üst",
      description: "Kadın spor üst ürünleri",
      level: "SUB",
      order: 2,
      icon: "SportsTShirt",
      parentId: womenActivewear.id,
      isActive: true,
      isPublic: true,
      keywords: '["spor üst", "sports top", "kadın", "women", "activewear"]',
      tags: "#kadın_spor_üst #women_sports_top #activewear",
      createdById: admin.id,
    },
  });

  // ERKEK - ÜST GİYİM - SUB Categories
  const menTshirts = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001-001",
      name: "Tişört",
      description: "Erkek tişört ürünleri",
      level: "SUB",
      order: 1,
      icon: "TShirt",
      parentId: menUpperWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["tişört", "t-shirt", "erkek", "men", "basic tee"]',
      tags: "#erkek_tişört #men_tshirt #basic",
      createdById: admin.id,
    },
  });

  const menShirts = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001-002",
      name: "Gömlek",
      description: "Erkek gömlek ürünleri",
      level: "SUB",
      order: 2,
      icon: "Shirt",
      parentId: menUpperWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["gömlek", "shirt", "erkek", "men", "dress shirt"]',
      tags: "#erkek_gömlek #men_shirt #formal",
      createdById: admin.id,
    },
  });

  const menSweatshirts = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001-003",
      name: "Sweatshirt/Hoodie",
      description: "Erkek sweatshirt ve hoodie ürünleri",
      level: "SUB",
      order: 3,
      icon: "Hoodie",
      parentId: menUpperWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["sweatshirt", "hoodie", "erkek", "men", "casual"]',
      tags: "#erkek_sweatshirt #men_hoodie #casual",
      createdById: admin.id,
    },
  });

  // ERKEK - ALT GİYİM - SUB Categories
  const menJeans = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-002-001",
      name: "Jean",
      description: "Erkek jean ürünleri",
      level: "SUB",
      order: 1,
      icon: "Jeans",
      parentId: menLowerWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["jean", "denim", "erkek", "men", "jeans"]',
      tags: "#erkek_jean #men_jeans #denim",
      createdById: admin.id,
    },
  });

  const menTrousers = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-002-002",
      name: "Chino/Pantolon",
      description: "Erkek chino ve pantolon ürünleri",
      level: "SUB",
      order: 2,
      icon: "Pants",
      parentId: menLowerWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["chino", "pantolon", "erkek", "men", "trousers"]',
      tags: "#erkek_pantolon #men_trousers #chino",
      createdById: admin.id,
    },
  });

  // ERKEK - DIŞ GİYİM - SUB Categories
  const menJackets = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-003-001",
      name: "Ceket",
      description: "Erkek ceket ürünleri",
      level: "SUB",
      order: 1,
      icon: "Jacket",
      parentId: menOuterwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["ceket", "jacket", "erkek", "men", "blazer"]',
      tags: "#erkek_ceket #men_jacket #blazer",
      createdById: admin.id,
    },
  });

  const menParkas = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-003-002",
      name: "Mont/Parka",
      description: "Erkek mont ve parka ürünleri",
      level: "SUB",
      order: 2,
      icon: "Parka",
      parentId: menOuterwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["mont", "parka", "erkek", "men", "coat"]',
      tags: "#erkek_mont #men_parka #coat",
      createdById: admin.id,
    },
  });

  // ERKEK - TRİKO - SUB Categories
  const menSweaters = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-004-001",
      name: "Kazak",
      description: "Erkek kazak ürünleri",
      level: "SUB",
      order: 1,
      icon: "Sweater",
      parentId: menKnitwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["kazak", "sweater", "erkek", "men", "pullover"]',
      tags: "#erkek_kazak #men_sweater #pullover",
      createdById: admin.id,
    },
  });

  // ERKEK - AKTİF SPOR - SUB Categories
  const menSportsBottoms = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-005-001",
      name: "Eşofman Altı",
      description: "Erkek eşofman altı ürünleri",
      level: "SUB",
      order: 1,
      icon: "TrackPants",
      parentId: menActivewear.id,
      isActive: true,
      isPublic: true,
      keywords: '["eşofman altı", "track pants", "erkek", "men", "sportswear"]',
      tags: "#erkek_eşofman_altı #men_track_pants #sportswear",
      createdById: admin.id,
    },
  });

  const menSportsTops = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-005-002",
      name: "Spor Üst",
      description: "Erkek spor üst ürünleri",
      level: "SUB",
      order: 2,
      icon: "SportsTShirt",
      parentId: menActivewear.id,
      isActive: true,
      isPublic: true,
      keywords: '["spor üst", "sports top", "erkek", "men", "activewear"]',
      tags: "#erkek_spor_üst #men_sports_top #activewear",
      createdById: admin.id,
    },
  });

  // ÇOCUK - SUB Categories
  const babyBodysuits = await prisma.standardCategory.create({
    data: {
      code: "KID-001-001-001",
      name: "Body/Zıbın",
      description: "Bebek body ve zıbın ürünleri",
      level: "SUB",
      order: 1,
      icon: "BabyClothes",
      parentId: babyWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["body", "zıbın", "bebek", "baby", "bodysuit"]',
      tags: "#bebek_body #baby_bodysuit #zıbın",
      createdById: admin.id,
    },
  });

  const babyJumpsuits = await prisma.standardCategory.create({
    data: {
      code: "KID-001-001-002",
      name: "Tulum",
      description: "Bebek tulum ürünleri",
      level: "SUB",
      order: 2,
      icon: "BabyJumpsuit",
      parentId: babyWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["tulum", "bebek", "baby", "jumpsuit", "romper"]',
      tags: "#bebek_tulum #baby_jumpsuit #romper",
      createdById: admin.id,
    },
  });

  const girlsDresses = await prisma.standardCategory.create({
    data: {
      code: "KID-001-002-001",
      name: "Elbise",
      description: "Kız çocuk elbise ürünleri",
      level: "SUB",
      order: 1,
      icon: "GirlsDress",
      parentId: girlsWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["elbise", "kız çocuk", "girls", "dress", "çocuk"]',
      tags: "#kız_çocuk_elbise #girls_dress #çocuk",
      createdById: admin.id,
    },
  });

  const girlsTshirts = await prisma.standardCategory.create({
    data: {
      code: "KID-001-002-002",
      name: "Tişört",
      description: "Kız çocuk tişört ürünleri",
      level: "SUB",
      order: 2,
      icon: "KidsTShirt",
      parentId: girlsWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["tişört", "kız çocuk", "girls", "t-shirt", "çocuk"]',
      tags: "#kız_çocuk_tişört #girls_tshirt #çocuk",
      createdById: admin.id,
    },
  });

  const boysTshirts = await prisma.standardCategory.create({
    data: {
      code: "KID-001-003-001",
      name: "Tişört",
      description: "Erkek çocuk tişört ürünleri",
      level: "SUB",
      order: 1,
      icon: "KidsTShirt",
      parentId: boysWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["tişört", "erkek çocuk", "boys", "t-shirt", "çocuk"]',
      tags: "#erkek_çocuk_tişört #boys_tshirt #çocuk",
      createdById: admin.id,
    },
  });

  const boysShorts = await prisma.standardCategory.create({
    data: {
      code: "KID-001-003-002",
      name: "Şort",
      description: "Erkek çocuk şort ürünleri",
      level: "SUB",
      order: 2,
      icon: "KidsShorts",
      parentId: boysWear.id,
      isActive: true,
      isPublic: true,
      keywords: '["şort", "erkek çocuk", "boys", "shorts", "çocuk"]',
      tags: "#erkek_çocuk_şort #boys_shorts #çocuk",
      createdById: admin.id,
    },
  });

  const kidsCoats = await prisma.standardCategory.create({
    data: {
      code: "KID-001-004-001",
      name: "Mont",
      description: "Çocuk mont ürünleri",
      level: "SUB",
      order: 1,
      icon: "KidsCoat",
      parentId: kidsOuterwear.id,
      isActive: true,
      isPublic: true,
      keywords: '["mont", "çocuk", "kids", "coat", "jacket"]',
      tags: "#çocuk_mont #kids_coat #mont",
      createdById: admin.id,
    },
  });

  // AKSESUAR - SUB Categories
  const handbags = await prisma.standardCategory.create({
    data: {
      code: "ACC-001-001-001",
      name: "Çanta",
      description: "El çantası, omuz çantası ve sırt çantası",
      level: "SUB",
      order: 1,
      icon: "Handbag",
      parentId: bagsBelts.id,
      isActive: true,
      isPublic: true,
      keywords: '["çanta", "handbag", "bag", "backpack", "shoulder bag"]',
      tags: "#çanta #handbag #bag #backpack",
      createdById: admin.id,
    },
  });

  const belts = await prisma.standardCategory.create({
    data: {
      code: "ACC-001-001-002",
      name: "Kemer",
      description: "Deri ve kumaş kemer ürünleri",
      level: "SUB",
      order: 2,
      icon: "Belt",
      parentId: bagsBelts.id,
      isActive: true,
      isPublic: true,
      keywords: '["kemer", "belt", "leather belt", "fabric belt"]',
      tags: "#kemer #belt #leather #fabric",
      createdById: admin.id,
    },
  });

  const hats = await prisma.standardCategory.create({
    data: {
      code: "ACC-001-002-001",
      name: "Şapka",
      description: "Kasket, bucket hat ve diğer şapka türleri",
      level: "SUB",
      order: 1,
      icon: "Hat",
      parentId: hatsBerets.id,
      isActive: true,
      isPublic: true,
      keywords: '["şapka", "hat", "cap", "bucket hat", "kasket"]',
      tags: "#şapka #hat #cap #kasket",
      createdById: admin.id,
    },
  });

  const berets = await prisma.standardCategory.create({
    data: {
      code: "ACC-001-002-002",
      name: "Bere",
      description: "Örgü bere ve kış şapkası ürünleri",
      level: "SUB",
      order: 2,
      icon: "Beanie",
      parentId: hatsBerets.id,
      isActive: true,
      isPublic: true,
      keywords: '["bere", "beanie", "winter hat", "knit hat"]',
      tags: "#bere #beanie #winter #knit",
      createdById: admin.id,
    },
  });

  // AYAKKABI - SUB Categories
  const sneakers = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-001-001",
      name: "Sneaker",
      description: "Günlük spor ayakkabı ürünleri",
      level: "SUB",
      order: 1,
      icon: "Sneaker",
      parentId: sportShoes.id,
      isActive: true,
      isPublic: true,
      keywords: '["sneaker", "spor ayakkabı", "casual shoes", "günlük"]',
      tags: "#sneaker #spor_ayakkabı #casual #günlük",
      createdById: admin.id,
    },
  });

  const runningShoes = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-001-002",
      name: "Koşu Ayakkabısı",
      description: "Koşu ve egzersiz ayakkabı ürünleri",
      level: "SUB",
      order: 2,
      icon: "RunningShoe",
      parentId: sportShoes.id,
      isActive: true,
      isPublic: true,
      keywords: '["koşu ayakkabısı", "running shoes", "exercise", "fitness"]',
      tags: "#koşu_ayakkabısı #running_shoes #fitness #exercise",
      createdById: admin.id,
    },
  });

  const leatherShoes = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-002-001",
      name: "Deri Ayakkabı",
      description: "Klasik deri ayakkabı ürünleri",
      level: "SUB",
      order: 1,
      icon: "LeatherShoe",
      parentId: classicShoes.id,
      isActive: true,
      isPublic: true,
      keywords: '["deri ayakkabı", "leather shoes", "dress shoes", "formal"]',
      tags: "#deri_ayakkabı #leather_shoes #formal #dress",
      createdById: admin.id,
    },
  });

  const loafers = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-002-002",
      name: "Loafer",
      description: "Loafer ve benzeri rahat klasik ayakkabılar",
      level: "SUB",
      order: 2,
      icon: "Loafer",
      parentId: classicShoes.id,
      isActive: true,
      isPublic: true,
      keywords: '["loafer", "slip-on", "moccasin", "rahat"]',
      tags: "#loafer #slip_on #moccasin #rahat",
      createdById: admin.id,
    },
  });

  // ==========================================
  // DETAIL LEVEL CATEGORIES (4th Level)
  // ==========================================

  // KADIN - Elbise Detail Categories
  const cocktailDresses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-004-001-001",
      name: "Kokteyl Elbise",
      description: "Özel davetler için kokteyl elbiseleri",
      level: "DETAIL",
      order: 1,
      icon: "CocktailDress",
      parentId: womenDress.id,
      isActive: true,
      isPublic: true,
      keywords: '["kokteyl elbise", "cocktail dress", "özel", "davet", "gece"]',
      tags: "#kokteyl_elbise #cocktail_dress #özel #davet #gece",
      createdById: admin.id,
    },
  });

  const casualDresses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-004-001-002",
      name: "Günlük Elbise",
      description: "Günlük kullanım için rahat elbiseler",
      level: "DETAIL",
      order: 2,
      icon: "CasualDress",
      parentId: womenDress.id,
      isActive: true,
      isPublic: true,
      keywords: '["günlük elbise", "casual dress", "rahat", "günlük"]',
      tags: "#günlük_elbise #casual_dress #rahat #günlük",
      createdById: admin.id,
    },
  });

  const maxiDresses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-004-001-003",
      name: "Maxi Elbise",
      description: "Uzun ve akıcı maxi elbiseler",
      level: "DETAIL",
      order: 3,
      icon: "MaxiDress",
      parentId: womenDress.id,
      isActive: true,
      isPublic: true,
      keywords: '["maxi elbise", "uzun elbise", "maxi dress", "akıcı"]',
      tags: "#maxi_elbise #uzun_elbise #maxi_dress #akıcı",
      createdById: admin.id,
    },
  });

  // KADIN - Pantolon Detail Categories
  const skinnyJeans = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002-002-001",
      name: "Skinny Pantolon",
      description: "Dar kesim skinny pantolon ürünleri",
      level: "DETAIL",
      order: 1,
      icon: "SkinnyPants",
      parentId: womenTrousers.id,
      isActive: true,
      isPublic: true,
      keywords:
        '["skinny pantolon", "dar pantolon", "skinny jeans", "dar kesim"]',
      tags: "#skinny_pantolon #dar_pantolon #skinny_jeans #dar_kesim",
      createdById: admin.id,
    },
  });

  const wideLegPants = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002-002-002",
      name: "Bol Paça Pantolon",
      description: "Geniş paça pantolon ürünleri",
      level: "DETAIL",
      order: 2,
      icon: "WideLegPants",
      parentId: womenTrousers.id,
      isActive: true,
      isPublic: true,
      keywords: '["bol paça", "wide leg", "geniş paça", "palazzo"]',
      tags: "#bol_paça #wide_leg #geniş_paça #palazzo",
      createdById: admin.id,
    },
  });

  const highWaistPants = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-002-002-003",
      name: "Yüksek Bel Pantolon",
      description: "Yüksek bel pantolon ürünleri",
      level: "DETAIL",
      order: 3,
      icon: "HighWaistPants",
      parentId: womenTrousers.id,
      isActive: true,
      isPublic: true,
      keywords: '["yüksek bel", "high waist", "yüksek bel pantolon"]',
      tags: "#yüksek_bel #high_waist #yüksek_bel_pantolon",
      createdById: admin.id,
    },
  });

  // KADIN - Gömlek/Bluz Detail Categories
  const silkBlouses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-001-002-001",
      name: "İpek Bluz",
      description: "İpek kumaş bluz ürünleri",
      level: "DETAIL",
      order: 1,
      icon: "SilkBlouse",
      parentId: womenShirtsBlouses.id,
      isActive: true,
      isPublic: true,
      keywords: '["ipek bluz", "silk blouse", "ipek", "silk"]',
      tags: "#ipek_bluz #silk_blouse #ipek #silk",
      createdById: admin.id,
    },
  });

  const chiffon_blouses = await prisma.standardCategory.create({
    data: {
      code: "WOM-001-001-002-002",
      name: "Şifon Bluz",
      description: "Şifon kumaş bluz ürünleri",
      level: "DETAIL",
      order: 2,
      icon: "ChiffonBlouse",
      parentId: womenShirtsBlouses.id,
      isActive: true,
      isPublic: true,
      keywords: '["şifon bluz", "chiffon blouse", "şifon", "chiffon"]',
      tags: "#şifon_bluz #chiffon_blouse #şifon #chiffon",
      createdById: admin.id,
    },
  });

  // ERKEK - Gömlek Detail Categories
  const formalShirts = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001-002-001",
      name: "Klasik Gömlek",
      description: "İş ve formal kullanım için klasik gömlek'ler",
      level: "DETAIL",
      order: 1,
      icon: "FormalShirt",
      parentId: menShirts.id,
      isActive: true,
      isPublic: true,
      keywords:
        '["klasik gömlek", "formal shirt", "iş gömlegi", "dress shirt"]',
      tags: "#klasik_gömlek #formal_shirt #iş_gömlegi #dress_shirt",
      createdById: admin.id,
    },
  });

  const casualMensShirts = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001-002-002",
      name: "Casual Gömlek",
      description: "Günlük kullanım için rahat gömlek'ler",
      level: "DETAIL",
      order: 2,
      icon: "CasualShirt",
      parentId: menShirts.id,
      isActive: true,
      isPublic: true,
      keywords:
        '["casual gömlek", "günlük gömlek", "rahat gömlek", "casual shirt"]',
      tags: "#casual_gömlek #günlük_gömlek #rahat_gömlek #casual_shirt",
      createdById: admin.id,
    },
  });

  const linenShirts = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-001-002-003",
      name: "Keten Gömlek",
      description: "Keten kumaş gömlek ürünleri",
      level: "DETAIL",
      order: 3,
      icon: "LinenShirt",
      parentId: menShirts.id,
      isActive: true,
      isPublic: true,
      keywords: '["keten gömlek", "linen shirt", "keten", "linen"]',
      tags: "#keten_gömlek #linen_shirt #keten #linen",
      createdById: admin.id,
    },
  });

  // ERKEK - Pantolon Detail Categories
  const slimFitPants = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-002-002-001",
      name: "Slim Fit Pantolon",
      description: "Dar kesim slim fit pantolon ürünleri",
      level: "DETAIL",
      order: 1,
      icon: "SlimFitPants",
      parentId: menTrousers.id,
      isActive: true,
      isPublic: true,
      keywords: '["slim fit", "dar kesim", "slim fit pantolon"]',
      tags: "#slim_fit #dar_kesim #slim_fit_pantolon",
      createdById: admin.id,
    },
  });

  const regularFitPants = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-002-002-002",
      name: "Regular Fit Pantolon",
      description: "Normal kesim regular fit pantolon ürünleri",
      level: "DETAIL",
      order: 2,
      icon: "RegularFitPants",
      parentId: menTrousers.id,
      isActive: true,
      isPublic: true,
      keywords: '["regular fit", "normal kesim", "regular fit pantolon"]',
      tags: "#regular_fit #normal_kesim #regular_fit_pantolon",
      createdById: admin.id,
    },
  });

  const chinos = await prisma.standardCategory.create({
    data: {
      code: "MEN-001-002-002-003",
      name: "Chino Pantolon",
      description: "Chino tarzı pantolon ürünleri",
      level: "DETAIL",
      order: 3,
      icon: "ChinoPants",
      parentId: menTrousers.id,
      isActive: true,
      isPublic: true,
      keywords: '["chino", "chino pantolon", "casual pantolon"]',
      tags: "#chino #chino_pantolon #casual_pantolon",
      createdById: admin.id,
    },
  });

  // ÇOCUK - Çocuk T-Shirt Detail Categories
  const printedKidsShirts = await prisma.standardCategory.create({
    data: {
      code: "KID-001-003-001-001",
      name: "Baskılı Tişört",
      description: "Desenli ve baskılı çocuk tişört ürünleri",
      level: "DETAIL",
      order: 1,
      icon: "PrintedTShirt",
      parentId: boysTshirts.id,
      isActive: true,
      isPublic: true,
      keywords: '["baskılı tişört", "printed t-shirt", "desenli", "çocuk"]',
      tags: "#baskılı_tişört #printed_tshirt #desenli #çocuk",
      createdById: admin.id,
    },
  });

  const plainKidsShirts = await prisma.standardCategory.create({
    data: {
      code: "KID-001-003-001-002",
      name: "Düz Tişört",
      description: "Düz renk çocuk tişört ürünleri",
      level: "DETAIL",
      order: 2,
      icon: "PlainTShirt",
      parentId: boysTshirts.id,
      isActive: true,
      isPublic: true,
      keywords: '["düz tişört", "plain t-shirt", "düz renk", "çocuk"]',
      tags: "#düz_tişört #plain_tshirt #düz_renk #çocuk",
      createdById: admin.id,
    },
  });

  // AYAKKABI - Sneaker Detail Categories
  const runningShoeDetails = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-001-002-001",
      name: "Profesyonel Koşu",
      description: "Profesyonel koşu için özel tasarım ayakkabılar",
      level: "DETAIL",
      order: 1,
      icon: "ProfessionalRunning",
      parentId: runningShoes.id,
      isActive: true,
      isPublic: true,
      keywords: '["profesyonel koşu", "professional running", "athletics"]',
      tags: "#profesyonel_koşu #professional_running #athletics",
      createdById: admin.id,
    },
  });

  const casualRunning = await prisma.standardCategory.create({
    data: {
      code: "SHO-001-001-002-002",
      name: "Günlük Koşu",
      description: "Günlük koşu ve egzersiz için ayakkabılar",
      level: "DETAIL",
      order: 2,
      icon: "CasualRunning",
      parentId: runningShoes.id,
      isActive: true,
      isPublic: true,
      keywords: '["günlük koşu", "casual running", "fitness", "egzersiz"]',
      tags: "#günlük_koşu #casual_running #fitness #egzersiz",
      createdById: admin.id,
    },
  });

  console.log("✅ Created Standard Categories hierarchy:");
  console.log(
    "   • 5 ROOT categories (Kadın, Erkek, Çocuk, Aksesuar, Ayakkabı)"
  );
  console.log("   • 16 MAIN categories (Üst Giyim, Alt Giyim, Dış Giyim, vb.)");
  console.log("   • 34 SUB categories (Bluz, Elbise, Pantolon, Mont, vb.)");
  console.log(
    "   • 18 DETAIL categories (Kokteyl Elbise, Skinny Pantolon, vb.)"
  );
  console.log("   • Total: 73 categories in 4-level hierarchy");

  // ==========================================
  // SUMMARY
  // ==========================================
  // 7. COLLECTIONS
  // ==========================================
  console.log("\n👗 Creating Collections...");

  // Collection image definitions
  const collectionImageQueries = [
    {
      query: "business woman office outfit",
      fileNames: [
        "business-women-1.jpg",
        "business-women-2.jpg",
        "business-women-3.jpg",
      ],
    },
    {
      query: "men casual streetwear urban",
      fileNames: ["urban-men-1.jpg", "urban-men-2.jpg"],
    },
    { query: "school uniform children", fileNames: ["school-kids-1.jpg"] },
    {
      query: "woman athletic sportswear",
      fileNames: ["active-women-1.jpg", "active-women-2.jpg"],
    },
    {
      query: "denim jeans fashion",
      fileNames: ["denim-1.jpg", "denim-2.jpg", "denim-3.jpg"],
    },
  ];

  // Download collection images from Unsplash
  console.log("🖼️  Fetching collection images from Unsplash...");
  const collectionImages: Record<string, string[]> = {};

  for (let i = 0; i < collectionImageQueries.length; i++) {
    const { query, fileNames } = collectionImageQueries[i];
    collectionImages[`collection-${i + 1}`] = [];

    for (const fileName of fileNames) {
      const imageUrl = await getUnsplashImage(query);
      if (imageUrl) {
        const savedPath = await downloadAndSaveCollectionImage(
          imageUrl,
          fileName
        );
        collectionImages[`collection-${i + 1}`].push(savedPath);
        console.log(`✅ Image fetched for collection ${i + 1}: ${fileName}`);
      } else {
        collectionImages[`collection-${i + 1}`].push(
          `/uploads/collections/${fileName}`
        );
        console.log(`⚠️ Using placeholder for: ${fileName}`);
      }

      // Add delay to respect Unsplash rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Manufacturer Collections (TextilePro Manufacturing)
  const manufacturerCollections = await Promise.all([
    // Collection 1: Kadın İş Giyim
    prisma.collection.create({
      data: {
        name: "Business Essentials Women",
        description:
          "Kadın iş giyim koleksiyonu - şık ve rahat ofis kıyafetleri",
        modelCode: "BEW-2024-001",
        season: "Spring/Summer 2024",
        gender: "WOMEN",
        fit: "Regular",
        trend: "Minimalist",
        colors: JSON.stringify([
          "Navy Blue",
          "Charcoal Gray",
          "Ivory White",
          "Burgundy",
        ]),
        sizeRange: "Women EU Standard (34-48)",
        fabricComposition:
          "98% Cotton 2% Elastane, 70% Wool 28% Polyester 2% Elastane",
        accessories: "Horn Buttons, Metallic Zippers",
        images: JSON.stringify(collectionImages["collection-1"]),
        moq: 500,
        targetPrice: 45.5,
        currency: "USD",
        deadlineDays: 45,
        notes:
          "Professional iş giyim koleksiyonu. Yüksek kalite kumaş ve işçilik. Özel logo ve etiket opsiyonları mevcut.",
        companyId: manufacturer.id,
        isActive: true,
        isFeatured: true,
        viewCount: 24,
        likesCount: 8,
      },
    }),

    // Collection 2: Erkek Casual
    prisma.collection.create({
      data: {
        name: "Urban Comfort Men",
        description:
          "Erkek günlük giyim koleksiyonu - rahat ve şık casual wear",
        modelCode: "UCM-2024-002",
        season: "Fall/Winter 2024",
        gender: "MEN",
        fit: "Slim",
        trend: "Urban Streetwear",
        colors: JSON.stringify([
          "Black",
          "Olive Green",
          "Denim Blue",
          "Heather Gray",
        ]),
        sizeRange: "Men EU Standard (S-XXL)",
        fabricComposition:
          "100% Organic Cotton, 85% Recycled Polyester 15% Cotton",
        accessories: "Recycled Plastic Buttons, Cotton Drawstrings",
        images: JSON.stringify(collectionImages["collection-2"]),
        moq: 300,
        targetPrice: 28.75,
        currency: "USD",
        deadlineDays: 35,
        notes:
          "Sürdürülebilir malzemeler ile üretilen casual koleksiyon. Genç erkek hedef kitle.",
        companyId: manufacturer.id,
        isActive: true,
        isFeatured: false,
        viewCount: 18,
        likesCount: 5,
      },
    }),

    // Collection 3: Çocuk Okul Üniformaları
    prisma.collection.create({
      data: {
        name: "Smart School Kids",
        description: "Çocuk okul üniformaları - dayanıklı ve konforlu",
        modelCode: "SSK-2024-003",
        season: "All Season",
        gender: "UNISEX",
        fit: "Regular",
        trend: "Classic School",
        colors: JSON.stringify(["Navy Blue", "White", "Gray", "Burgundy"]),
        sizeRange: "Kids EU Standard (4-16 yaş)",
        fabricComposition: "65% Cotton 35% Polyester",
        accessories: "School Badge Embroidery, Reinforced Knee Patches",
        images: JSON.stringify(collectionImages["collection-3"]),
        moq: 1000,
        targetPrice: 18.9,
        currency: "USD",
        deadlineDays: 60,
        notes:
          "Okul üniformaları için özel tasarım. Logo ve amblem uygulaması dahil. Dayanıklı dikişler.",
        companyId: manufacturer.id,
        isActive: true,
        isFeatured: true,
        viewCount: 31,
        likesCount: 12,
      },
    }),

    // Collection 4: Kadın Spor Giyim
    prisma.collection.create({
      data: {
        name: "Active Life Women",
        description: "Kadın spor giyim koleksiyonu - performans ve konfor",
        modelCode: "ALW-2024-004",
        season: "Spring/Summer 2025",
        gender: "WOMEN",
        fit: "Fitted",
        trend: "Athleisure",
        colors: JSON.stringify([
          "Black",
          "Pink Coral",
          "Electric Blue",
          "Mint Green",
        ]),
        sizeRange: "Women Sports (XS-XL)",
        fabricComposition: "88% Polyester 12% Elastane, 92% Nylon 8% Spandex",
        accessories: "Reflective Strips, Mesh Panels",
        images: JSON.stringify(collectionImages["collection-4"]),
        moq: 250,
        targetPrice: 32.4,
        currency: "USD",
        deadlineDays: 40,
        notes:
          "Yüksek performans spor giyim. Anti-bakteriyel ve nem emici özellikler.",
        companyId: manufacturer.id,
        isActive: true,
        isFeatured: false,
        viewCount: 15,
        likesCount: 6,
      },
    }),

    // Collection 5: Premium Denim
    prisma.collection.create({
      data: {
        name: "Premium Denim Classic",
        description: "Unisex premium denim koleksiyonu - kaliteli kot giyim",
        modelCode: "PDC-2024-005",
        season: "All Season",
        gender: "UNISEX",
        fit: "Relaxed",
        trend: "Vintage Classic",
        colors: JSON.stringify([
          "Indigo Blue",
          "Black Wash",
          "Light Blue",
          "Raw Denim",
        ]),
        sizeRange: "Unisex Denim (26-42)",
        fabricComposition: "98% Cotton 2% Elastane",
        accessories:
          "Vintage Metal Buttons, Leather Patch Label, Contrast Stitching Thread",
        images: JSON.stringify(collectionImages["collection-5"]),
        moq: 200,
        targetPrice: 52.8,
        currency: "USD",
        deadlineDays: 50,
        notes:
          "Premium kalite denim. Özel yıkama ve vintage efektler uygulanabilir. Custom fit opsiyonları.",
        companyId: manufacturer.id,
        isActive: true,
        isFeatured: true,
        viewCount: 42,
        likesCount: 18,
      },
    }),
  ]);

  console.log(
    `✅ Created ${manufacturerCollections.length} manufacturer collections`
  );

  // ==========================================
  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n� Users & Companies:");
  console.log("   • 1 Admin user");
  console.log("   • 2 Companies (Manufacturer + Customer)");
  console.log("   • 7 Company users with different roles");
  console.log("\n📚 Library Items:");
  console.log(`   • ${allPlatformStandards.length} Platform Standard items:`);
  console.log(`     - ${fabricsData.length} Fabrics`);
  console.log(`     - ${materialsData.length} Materials/Accessories`);
  console.log(`     - ${sizeGroupsData.length} Size Groups`);
  console.log(`     - ${certificationsData.length} Certifications`);
  console.log(`     - ${colorsData.length} Colors`);
  console.log(`     - ${fitData.length} Fit Templates`);
  console.log(`     - ${seasonData.length} Seasons`);
  console.log(`   • ${allCompanyItems.length} Company Custom items:`);
  console.log(
    `     - ${manufacturerCustomItems.length} Manufacturer custom (Fabric, Material, Color, Season)`
  );
  console.log(
    `     - ${customerCustomItems.length} Customer custom (Size Group, Material, Color, Fit)`
  );

  console.log("\n📂 Standard Categories:");
  console.log(
    "   • Gender-based hierarchical category system with 73 categories"
  );
  console.log("   • 4-level structure: ROOT → MAIN → SUB → DETAIL");
  console.log("   • Categories: Kadın, Erkek, Çocuk, Aksesuar, Ayakkabı");
  console.log(
    "   • Turkish names with English keywords for international support"
  );
  console.log(
    "   • Detailed product categories: Kokteyl Elbise, Skinny Pantolon, Klasik Gömlek vb."
  );
  console.log("\n�🔐 Login Credentials:");
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

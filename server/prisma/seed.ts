import axios from "axios";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Unsplash API Configuration
const UNSPLASH_ACCESS_KEY = "uBbrq5RdhbzS-x_Qe4OAflJ9KdlT-rj4Uu-XPXODIUQ"; // https://unsplash.com/developers
const UNSPLASH_API_URL = "https://api.unsplash.com";

/**
 * Fetch random images from Unsplash Official API
 * @param query - Search query (e.g., "fashion men tshirt", "women blouse")
 * @param count - Number of images to fetch (1-30)
 * @returns Array of image URLs
 */
async function fetchUnsplashImages(
  query: string,
  count: number = 1
): Promise<string[]> {
  try {
    console.log(`🔍 Fetching ${count} images for: "${query}"...`);

    const response = await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
      params: {
        query,
        count: Math.min(count, 30), // Unsplash max is 30
        orientation: "portrait",
        content_filter: "high", // Filter out potentially inappropriate content
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    let imageUrls: string[];

    if (Array.isArray(response.data)) {
      imageUrls = response.data.map((photo: any) => photo.urls.regular);
    } else {
      imageUrls = [response.data.urls.regular];
    }

    console.log(`✅ Successfully fetched ${imageUrls.length} images`);
    return imageUrls;
  } catch (error: any) {
    console.error(
      `❌ Error fetching Unsplash images for "${query}":`,
      error.message
    );

    // Fallback to Source API (simpler, no auth needed)
    console.log(`⚠️  Falling back to Source API...`);
    const images: string[] = [];
    for (let i = 0; i < count; i++) {
      const imageUrl = `https://source.unsplash.com/800x600/?${query}&sig=${Date.now()}-${i}`;
      images.push(imageUrl);
    }
    return images;
  }
}

async function main() {
  console.log(`Start seeding ...`);

  // 0. Clean existing data (for development)
  console.log("🧹 Cleaning existing seed data...");

  // Delete in correct order (child tables first)
  await prisma.task.deleteMany({}); // New Task model
  await prisma.review.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.qualityControl.deleteMany({});
  await prisma.productionStageUpdate.deleteMany({});
  await prisma.productionRevision.deleteMany({});
  await prisma.productionTracking.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.orderProduction.deleteMany({});
  await prisma.sampleProduction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.sample.deleteMany({});
  await prisma.revision.deleteMany({});
  await prisma.aIAnalysis.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userFavoriteCollection.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.seasonItem.deleteMany({});
  await prisma.sizeGroup.deleteMany({});
  await prisma.fabric.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.fitItem.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "admin@platform.com",
          "ahmet@defacto.com",
          "ayse@defacto.com",
          "mehmet@defacto.com",
          "zeynep@defacto.com",
          "can@defacto.com",
          "fatma@lcwaikiki.com",
          "hasan@lcwaikiki.com",
          "ali@lcwaikiki.com",
          "seda@lcwaikiki.com",
          "rahman@dhaka-textile.com",
          "wei@shanghai-fashion.com",
          "nguyen@hanoi-garments.com",
          "joao@porto-textiles.com",
          "rajesh@mumbai-fabrics.com",
          "youssef@casablanca-textile.com",
          "derya.kaya@email.com",
          "rana.khan@international.com",
          "mert@thirdparty.com",
        ],
      },
    },
  });
  await prisma.company.deleteMany({
    where: {
      email: {
        in: [
          "info@defacto.com",
          "info@lcwaikiki.com",
          "info@dhaka-textile.com",
          "info@shanghai-fashion.com",
          "info@hanoi-garments.com",
          "info@porto-textiles.com",
          "info@mumbai-fabrics.com",
          "info@casablanca-textile.com",
          "info@thirdparty.com",
        ],
      },
    },
  });
  console.log("✅ Cleanup complete");

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@platform.com",
      password: "$2a$10$TLtC603wy85MM./ot/pvEec0w2au6sjPaOmLpLQFbxPdpJH9fDwwS", // myPassword42
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // 2. Create Manufacturer Company: Defacto Tekstil
  const defactoOwner = await prisma.user.create({
    data: {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet@defacto.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi", // random42
      phone: "+90 532 123 4567",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const defacto = await prisma.company.create({
    data: {
      name: "Defacto Tekstil A.Ş.",
      email: "info@defacto.com",
      phone: "+90 212 555 0001",
      address: "İstanbul, Türkiye",
      website: "www.defacto.com",
      type: "MANUFACTURER",
      description: "Türkiye'nin önde gelen tekstil üreticisi",
      ownerId: defactoOwner.id,
      isActive: true,
    },
  });

  // Update owner's company
  await prisma.user.update({
    where: { id: defactoOwner.id },
    data: { companyId: defacto.id },
  });

  console.log(
    `✅ Created manufacturer: ${defacto.name} (Owner: ${defactoOwner.email})`
  );

  // 3. Create Defacto Employees
  const defactoEmployees = await prisma.user.createMany({
    data: [
      {
        firstName: "Ayşe",
        lastName: "Demir",
        email: "ayse@defacto.com",
        password:
          "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
        phone: "+90 532 234 5678",
        role: "COMPANY_EMPLOYEE",
        companyId: defacto.id,
        department: "Tasarım",
        jobTitle: "Koleksiyon Yöneticisi",
        permissions: JSON.stringify({
          collections: { create: true, edit: true, delete: true, view: true },
          categories: { create: true, edit: true, delete: false, view: true },
          samples: { view: true },
          orders: { view: true },
        }),
        isActive: true,
      },
      {
        firstName: "Mehmet",
        lastName: "Kaya",
        email: "mehmet@defacto.com",
        password:
          "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
        phone: "+90 532 345 6789",
        role: "COMPANY_EMPLOYEE",
        companyId: defacto.id,
        department: "Numune",
        jobTitle: "Numune Takip Uzmanı",
        permissions: JSON.stringify({
          samples: { updateStatus: true, respond: true, view: true },
          messages: { send: true, view: true },
          collections: { view: true },
        }),
        isActive: true,
      },
      {
        firstName: "Zeynep",
        lastName: "Arslan",
        email: "zeynep@defacto.com",
        password:
          "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
        phone: "+90 532 456 7890",
        role: "COMPANY_EMPLOYEE",
        companyId: defacto.id,
        department: "Satış",
        jobTitle: "Sipariş Yöneticisi",
        permissions: JSON.stringify({
          orders: { sendQuote: true, updateStatus: true, view: true },
          messages: { send: true, view: true },
          collections: { view: true },
        }),
        isActive: true,
      },
      {
        firstName: "Can",
        lastName: "Özdemir",
        email: "can@defacto.com",
        password:
          "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
        phone: "+90 532 567 8901",
        role: "COMPANY_EMPLOYEE",
        companyId: defacto.id,
        department: "Üretim",
        jobTitle: "Üretim Takip Elemanı",
        permissions: JSON.stringify({
          production: { updateStages: true, assignWorkshop: true, view: true },
          samples: { view: true },
          orders: { view: true },
        }),
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${defactoEmployees.count} Defacto employees`);

  // 4. Create Customer Company: LC Waikiki
  const lcwOwner = await prisma.user.create({
    data: {
      firstName: "Fatma",
      lastName: "Şahin",
      email: "fatma@lcwaikiki.com",
      password: "$2a$10$lTlNdIBQvCho0BoQg21KWu/VVKwlYsGwAa5r7ctOV41EKXRQ31ING", // iLikeTurtles42
      phone: "+90 532 111 2222",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const lcwaikiki = await prisma.company.create({
    data: {
      name: "LC Waikiki Mağazacılık A.Ş.",
      email: "info@lcwaikiki.com",
      phone: "+90 212 555 0002",
      address: "İstanbul, Türkiye",
      website: "www.lcwaikiki.com",
      type: "BUYER",
      description: "Türkiye'nin önde gelen perakende zinciri",
      ownerId: lcwOwner.id,
      isActive: true,
    },
  });

  // Update owner's company
  await prisma.user.update({
    where: { id: lcwOwner.id },
    data: { companyId: lcwaikiki.id },
  });

  console.log(
    `✅ Created buyer company: ${lcwaikiki.name} (Owner: ${lcwOwner.email})`
  );

  // 5. Create LC Waikiki Employees
  const lcwEmployees = await prisma.user.createMany({
    data: [
      {
        firstName: "Hasan",
        lastName: "Demir",
        email: "hasan@lcwaikiki.com",
        password:
          "$2a$10$lTlNdIBQvCho0BoQg21KWu/VVKwlYsGwAa5r7ctOV41EKXRQ31ING",
        phone: "+90 532 222 3333",
        role: "COMPANY_EMPLOYEE",
        companyId: lcwaikiki.id,
        department: "Satın Alma",
        jobTitle: "Satın Alma Müdürü",
        permissions: JSON.stringify({
          samples: { create: true, view: true, approve: true },
          orders: { create: true, confirm: true, view: true },
          messages: { send: true, view: true },
        }),
        isActive: true,
      },
      {
        firstName: "Ali",
        lastName: "Kara",
        email: "ali@lcwaikiki.com",
        password:
          "$2a$10$lTlNdIBQvCho0BoQg21KWu/VVKwlYsGwAa5r7ctOV41EKXRQ31ING",
        phone: "+90 532 333 4444",
        role: "COMPANY_EMPLOYEE",
        companyId: lcwaikiki.id,
        department: "Üretim Takip",
        jobTitle: "Üretim Takip Uzmanı",
        permissions: JSON.stringify({
          production: { view: true, requestRevision: true },
          samples: { view: true },
          orders: { view: true },
          messages: { send: true, view: true },
        }),
        isActive: true,
      },
      {
        firstName: "Seda",
        lastName: "Yılmaz",
        email: "seda@lcwaikiki.com",
        password:
          "$2a$10$lTlNdIBQvCho0BoQg21KWu/VVKwlYsGwAa5r7ctOV41EKXRQ31ING",
        phone: "+90 532 444 5555",
        role: "COMPANY_EMPLOYEE",
        companyId: lcwaikiki.id,
        department: "Kalite Kontrol",
        jobTitle: "Kalite Kontrol Uzmanı",
        permissions: JSON.stringify({
          quality: { view: true, comment: true },
          samples: { view: true },
          orders: { view: true },
        }),
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${lcwEmployees.count} LC Waikiki employees`);

  // 6. Create More International Companies

  // Bangladesh Manufacturer
  const bangladeshOwner = await prisma.user.create({
    data: {
      firstName: "Rahman",
      lastName: "Ahmed",
      email: "rahman@dhaka-textile.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+880 1712 345678",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const bangladeshCompany = await prisma.company.create({
    data: {
      name: "Dhaka Premium Textiles Ltd.",
      email: "info@dhaka-textile.com",
      phone: "+880 2 8835555",
      address: "Dhaka, Bangladesh",
      website: "www.dhaka-textile.com",
      type: "MANUFACTURER",
      description: "Leading sustainable textile manufacturer in South Asia",
      ownerId: bangladeshOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: bangladeshOwner.id },
    data: { companyId: bangladeshCompany.id },
  });

  // China Manufacturer
  const chinaOwner = await prisma.user.create({
    data: {
      firstName: "Wei",
      lastName: "Zhang",
      email: "wei@shanghai-fashion.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+86 21 6234 5678",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const chinaCompany = await prisma.company.create({
    data: {
      name: "Shanghai Fashion Group Co.",
      email: "info@shanghai-fashion.com",
      phone: "+86 21 6234 5000",
      address: "Shanghai, China",
      website: "www.shanghai-fashion.com",
      type: "MANUFACTURER",
      description: "Premium fashion manufacturer with 25 years experience",
      ownerId: chinaOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: chinaOwner.id },
    data: { companyId: chinaCompany.id },
  });

  // Vietnam Manufacturer
  const vietnamOwner = await prisma.user.create({
    data: {
      firstName: "Nguyen",
      lastName: "Tran",
      email: "nguyen@hanoi-garments.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+84 24 3826 5555",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const vietnamCompany = await prisma.company.create({
    data: {
      name: "Hanoi Garments Manufacturing",
      email: "info@hanoi-garments.com",
      phone: "+84 24 3826 5000",
      address: "Hanoi, Vietnam",
      website: "www.hanoi-garments.com",
      type: "MANUFACTURER",
      description: "Quality garment production with eco-friendly processes",
      ownerId: vietnamOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: vietnamOwner.id },
    data: { companyId: vietnamCompany.id },
  });

  // Portugal Manufacturer
  const portugalOwner = await prisma.user.create({
    data: {
      firstName: "João",
      lastName: "Silva",
      email: "joao@porto-textiles.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+351 22 123 4567",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const portugalCompany = await prisma.company.create({
    data: {
      name: "Porto Textiles & Fashion S.A.",
      email: "info@porto-textiles.com",
      phone: "+351 22 123 4500",
      address: "Porto, Portugal",
      website: "www.porto-textiles.com",
      type: "MANUFACTURER",
      description: "European luxury textile manufacturer",
      ownerId: portugalOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: portugalOwner.id },
    data: { companyId: portugalCompany.id },
  });

  // India Manufacturer
  const indiaOwner = await prisma.user.create({
    data: {
      firstName: "Rajesh",
      lastName: "Kumar",
      email: "rajesh@mumbai-fabrics.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+91 22 2345 6789",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const indiaCompany = await prisma.company.create({
    data: {
      name: "Mumbai Premium Fabrics Pvt Ltd",
      email: "info@mumbai-fabrics.com",
      phone: "+91 22 2345 6700",
      address: "Mumbai, India",
      website: "www.mumbai-fabrics.com",
      type: "MANUFACTURER",
      description: "Certified organic and sustainable textile production",
      ownerId: indiaOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: indiaOwner.id },
    data: { companyId: indiaCompany.id },
  });

  // Morocco Manufacturer
  const moroccoOwner = await prisma.user.create({
    data: {
      firstName: "Youssef",
      lastName: "Benali",
      email: "youssef@casablanca-textile.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+212 522 345 678",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const moroccoCompany = await prisma.company.create({
    data: {
      name: "Casablanca Textile Industries",
      email: "info@casablanca-textile.com",
      phone: "+212 522 345 600",
      address: "Casablanca, Morocco",
      website: "www.casablanca-textile.com",
      type: "MANUFACTURER",
      description: "Mediterranean textile excellence",
      ownerId: moroccoOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: moroccoOwner.id },
    data: { companyId: moroccoCompany.id },
  });

  console.log(
    `✅ Created 6 international manufacturers (Bangladesh, China, Vietnam, Portugal, India, Morocco)`
  );

  // 7. Create sample categories for Defacto
  const categories = await prisma.category.createMany({
    data: [
      {
        name: "Erkek Giyim",
        description: "Erkek tekstil ürünleri",
        companyId: defacto.id,
      },
      {
        name: "Kadın Giyim",
        description: "Kadın tekstil ürünleri",
        companyId: defacto.id,
      },
      {
        name: "Çocuk Giyim",
        description: "Çocuk tekstil ürünleri",
        companyId: defacto.id,
      },
    ],
  });

  console.log(`✅ Created ${categories.count} categories`);

  // Get created categories
  const allCategories = await prisma.category.findMany();
  const erkekGiyim = allCategories.find((c) => c.name === "Erkek Giyim");
  const kadinGiyim = allCategories.find((c) => c.name === "Kadın Giyim");
  const cocukGiyim = allCategories.find((c) => c.name === "Çocuk Giyim");

  // 7. Create Library Items (Color, Fabric, SizeGroup)
  console.log("📚 Creating library items...");

  // Renk Kütüphanesi (Defacto için) - Genişletilmiş
  await prisma.color.createMany({
    data: [
      // Nötr Renkler
      {
        name: "Beyaz",
        code: "PANTONE 11-0601",
        hexCode: "#FFFFFF",
        companyId: defacto.id,
      },
      {
        name: "Siyah",
        code: "PANTONE 19-0303",
        hexCode: "#000000",
        companyId: defacto.id,
      },
      {
        name: "Lacivert",
        code: "PANTONE 19-4028",
        hexCode: "#000080",
        companyId: defacto.id,
      },
      {
        name: "Gri Melanj",
        code: "PANTONE 14-4102",
        hexCode: "#C0C0C0",
        companyId: defacto.id,
      },
      {
        name: "Gri Koyu",
        code: "PANTONE 18-0201",
        hexCode: "#696969",
        companyId: defacto.id,
      },
      // Pastel Renkler
      {
        name: "Pudra",
        code: "PANTONE 12-1304",
        hexCode: "#FFE4E1",
        companyId: defacto.id,
      },
      {
        name: "Bej",
        code: "PANTONE 13-1015",
        hexCode: "#F5F5DC",
        companyId: defacto.id,
      },
      {
        name: "Açık Mavi",
        code: "PANTONE 14-4313",
        hexCode: "#ADD8E6",
        companyId: defacto.id,
      },
      {
        name: "Mint Yeşil",
        code: "PANTONE 13-0020",
        hexCode: "#98FF98",
        companyId: defacto.id,
      },
      {
        name: "Lila",
        code: "PANTONE 14-3207",
        hexCode: "#DDA0DD",
        companyId: defacto.id,
      },
      // Canlı Renkler
      {
        name: "Kırmızı",
        code: "PANTONE 18-1664",
        hexCode: "#FF0000",
        companyId: defacto.id,
      },
      {
        name: "Bordo",
        code: "PANTONE 19-1726",
        hexCode: "#800020",
        companyId: defacto.id,
      },
      {
        name: "Yeşil",
        code: "PANTONE 17-6153",
        hexCode: "#008000",
        companyId: defacto.id,
      },
      {
        name: "Haki",
        code: "PANTONE 16-0625",
        hexCode: "#BDB76B",
        companyId: defacto.id,
      },
      {
        name: "Turuncu",
        code: "PANTONE 16-1364",
        hexCode: "#FFA500",
        companyId: defacto.id,
      },
      {
        name: "Sarı",
        code: "PANTONE 13-0755",
        hexCode: "#FFFF00",
        companyId: defacto.id,
      },
      {
        name: "Mavi",
        code: "PANTONE 19-4052",
        hexCode: "#0000FF",
        companyId: defacto.id,
      },
      {
        name: "Mor",
        code: "PANTONE 18-3838",
        hexCode: "#800080",
        companyId: defacto.id,
      },
    ],
  });
  console.log(`✅ Created 18 colors for Defacto`);

  // Kumaş Kütüphanesi (Defacto için)
  await prisma.fabric.createMany({
    data: [
      {
        name: "Premium Cotton Single Jersey",
        code: "FAB-001",
        composition: "%100 Pamuk",
        weight: 180,
        width: 180,
        supplier: "Bossa Tekstil",
        price: 5.5,
        minOrder: 500,
        leadTime: 15,
        description: "Tişört, Polo için ideal",
        companyId: defacto.id,
      },
      {
        name: "Stretch Cotton Twill",
        code: "FAB-002",
        composition: "97% Pamuk 3% Elastan",
        weight: 240,
        width: 150,
        supplier: "Sanko Tekstil",
        price: 7.25,
        minOrder: 300,
        leadTime: 20,
        description: "Pantolon, Ceket için",
        companyId: defacto.id,
      },
      {
        name: "Viscose Blend",
        code: "FAB-003",
        composition: "95% Viskon 5% Elastan",
        weight: 160,
        width: 150,
        supplier: "Korteks",
        price: 6.8,
        minOrder: 400,
        leadTime: 18,
        description: "Bluz, Elbise için",
        companyId: defacto.id,
      },
      {
        name: "French Terry",
        code: "FAB-004",
        composition: "80% Pamuk 20% Polyester",
        weight: 280,
        width: 180,
        supplier: "İstanbul Örme",
        price: 8.9,
        minOrder: 600,
        leadTime: 25,
        description: "Sweatshirt, Hoodie için",
        companyId: defacto.id,
      },
      {
        name: "Stretch Denim",
        code: "FAB-005",
        composition: "98% Cotton 2% Elastan",
        weight: 320,
        width: 150,
        supplier: "Orta Anadolu",
        price: 9.5,
        minOrder: 800,
        leadTime: 30,
        description: "Denim ürünler için",
        companyId: defacto.id,
      },
    ],
  });
  console.log(`✅ Created 5 fabrics for Defacto`);

  // Beden Grupları (Defacto için)
  await prisma.sizeGroup.createMany({
    data: [
      {
        name: "Erkek Standart",
        category: "MEN",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
        description: "Erkek tişört, gömlek, polo",
        companyId: defacto.id,
      },
      {
        name: "Erkek Plus Size",
        category: "MEN",
        sizes: JSON.stringify(["L", "XL", "XXL", "3XL", "4XL"]),
        description: "Büyük beden erkek giyim",
        companyId: defacto.id,
      },
      {
        name: "Kadın Standart",
        category: "WOMEN",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
        description: "Kadın üst giyim",
        companyId: defacto.id,
      },
      {
        name: "Kadın Plus Size",
        category: "WOMEN",
        sizes: JSON.stringify(["L", "XL", "XXL", "3XL"]),
        description: "Büyük beden kadın giyim",
        companyId: defacto.id,
      },
      {
        name: "Çocuk 2-8 Yaş",
        category: "KIDS",
        sizes: JSON.stringify(["2", "3", "4", "5", "6", "7", "8"]),
        description: "Küçük çocuk",
        companyId: defacto.id,
      },
      {
        name: "Çocuk 9-16 Yaş",
        category: "KIDS",
        sizes: JSON.stringify(["9", "10", "11", "12", "13", "14", "15", "16"]),
        description: "Büyük çocuk",
        companyId: defacto.id,
      },
      {
        name: "Erkek Pantolon Beden",
        category: "MEN",
        sizes: JSON.stringify(["28", "30", "32", "34", "36", "38", "40", "42"]),
        description: "Erkek pantolon bel ölçüleri",
        companyId: defacto.id,
      },
      {
        name: "Kadın Elbise Beden",
        category: "WOMEN",
        sizes: JSON.stringify(["34", "36", "38", "40", "42", "44", "46"]),
        description: "Kadın elbise beden aralığı",
        companyId: defacto.id,
      },
    ],
  });
  console.log(`✅ Created 8 size groups for Defacto`);

  // Sezon Kütüphanesi (Defacto için)
  await prisma.seasonItem.createMany({
    data: [
      {
        name: "SS25",
        fullName: "Spring/Summer 2025",
        year: 2025,
        type: "SS",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-08-31"),
        description: "İlkbahar/Yaz 2025 sezonu",
        companyId: defacto.id,
      },
      {
        name: "FW25",
        fullName: "Fall/Winter 2025",
        year: 2025,
        type: "FW",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2026-01-31"),
        description: "Sonbahar/Kış 2025 sezonu",
        companyId: defacto.id,
      },
      {
        name: "SS26",
        fullName: "Spring/Summer 2026",
        year: 2026,
        type: "SS",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-08-31"),
        description: "İlkbahar/Yaz 2026 sezonu",
        companyId: defacto.id,
      },
      {
        name: "FW26",
        fullName: "Fall/Winter 2026",
        year: 2026,
        type: "FW",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2027-01-31"),
        description: "Sonbahar/Kış 2026 sezonu",
        companyId: defacto.id,
      },
      {
        name: "SS27",
        fullName: "Spring/Summer 2027",
        year: 2027,
        type: "SS",
        description: "İlkbahar/Yaz 2027 sezonu (plan)",
        companyId: defacto.id,
        isActive: false,
      },
    ],
  });
  console.log(`✅ Created 5 seasons for Defacto`);

  // Fit Kütüphanesi (Defacto için)
  await prisma.fitItem.createMany({
    data: [
      // ÜST GİYİM FITS
      {
        name: "Slim Fit",
        code: "FIT-SLIM",
        category: "UPPER",
        description:
          "Bedeni sarar, dar oturur; modern siluet. Tişört, gömlek, polo için ideal.",
        companyId: defacto.id,
      },
      {
        name: "Regular Fit",
        code: "FIT-REG",
        category: "UPPER",
        description: "Klasik, rahat oturuş; ne dar ne bol. En popüler kesim.",
        companyId: defacto.id,
      },
      {
        name: "Relaxed Fit",
        code: "FIT-RELX",
        category: "UPPER",
        description:
          "Belirgin biçimde bol, rahat hareket sağlar. Casual giyim için.",
        companyId: defacto.id,
      },
      {
        name: "Oversized",
        code: "FIT-OVER",
        category: "UPPER",
        description:
          "Geniş omuz, bol gövde; trend odaklı görünüm. Streetwear tarzı.",
        companyId: defacto.id,
      },
      {
        name: "Boxy Fit",
        code: "FIT-BOXY",
        category: "UPPER",
        description: "Kısa ve geniş form; özellikle streetwear'da popüler.",
        companyId: defacto.id,
      },
      {
        name: "Tailored Fit",
        code: "FIT-TAIL",
        category: "UPPER",
        description:
          "Terzi işi görünümlü, orantılı daraltılmış kalıp. Blazer, ceket için.",
        companyId: defacto.id,
      },
      {
        name: "Muscle Fit",
        code: "FIT-MUSC",
        category: "UPPER",
        description:
          "Vücut hatlarını belirginleştiren (özellikle kol/omuz) dar kesim.",
        companyId: defacto.id,
      },
      // ALT GİYİM FITS
      {
        name: "Skinny Fit",
        code: "FIT-SKIN",
        category: "LOWER",
        description:
          "Vücuda tamamen oturur; elastanlı kumaş gerekir. Jean, pantolon için.",
        companyId: defacto.id,
      },
      {
        name: "Tapered Fit",
        code: "FIT-TAPE",
        category: "LOWER",
        description:
          "Üstte rahat, bileğe doğru daralan form. Modern pantolon kesimidir.",
        companyId: defacto.id,
      },
      {
        name: "Straight Fit",
        code: "FIT-STRA",
        category: "LOWER",
        description: "Kalçadan bileğe kadar düz hat. Klasik jean kesimidir.",
        companyId: defacto.id,
      },
      {
        name: "Bootcut Fit",
        code: "FIT-BOOT",
        category: "LOWER",
        description: "Diz altından genişleyen klasik kesim.",
        companyId: defacto.id,
      },
      {
        name: "Mom Fit",
        code: "FIT-MOM",
        category: "LOWER",
        description:
          "Yüksek bel, bol kalça, rahat bacak. Kadın pantolon için popüler.",
        companyId: defacto.id,
      },
      {
        name: "Cargo Fit",
        code: "FIT-CARG",
        category: "LOWER",
        description: "Bol kesim, cep detaylı, utility tarzı pantolon.",
        companyId: defacto.id,
      },
      // DIŞ GİYİM FITS
      {
        name: "Padded Fit",
        code: "FIT-PADD",
        category: "OUTERWEAR",
        description:
          "Dolgu hacmine göre optimize edilmiş fit. Mont, parka için.",
        companyId: defacto.id,
      },
    ],
  });
  console.log(`✅ Created 14 fit types for Defacto`);

  // 7b. Create Certifications for Defacto
  await prisma.certification.createMany({
    data: [
      // FIBER (Lif/Hammadde)
      {
        name: "GOTS (Global Organic Textile Standard)",
        code: "GOTS-2024-TR-001",
        category: "FIBER",
        issuer: "Control Union",
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2025-12-31"),
        certificateNumber: "CU-GOTS-851234",
        description:
          "Organik pamuk kullanımını belgeleyen uluslararası sertifika",
        companyId: defacto.id,
      },
      {
        name: "OCS (Organic Content Standard)",
        code: "OCS-2024-001",
        category: "FIBER",
        issuer: "ICEA",
        validFrom: new Date("2024-03-01"),
        validUntil: new Date("2025-02-28"),
        certificateNumber: "ICEA-OCS-45698",
        description: "Organik elyaf içeriği doğrulama sertifikası",
        companyId: defacto.id,
      },
      {
        name: "GRS (Global Recycled Standard)",
        code: "GRS-2024-TR-055",
        category: "FIBER",
        issuer: "Control Union",
        validFrom: new Date("2024-01-15"),
        validUntil: new Date("2025-01-14"),
        certificateNumber: "CU-GRS-855478",
        description: "Geri dönüştürülmüş malzeme kullanımı sertifikası",
        companyId: defacto.id,
      },
      {
        name: "BCI (Better Cotton Initiative)",
        code: "BCI-2024-001",
        category: "FIBER",
        issuer: "Better Cotton",
        validFrom: new Date("2024-06-01"),
        validUntil: new Date("2025-05-31"),
        description: "Sürdürülebilir pamuk tarımı sertifikası",
        companyId: defacto.id,
      },

      // CHEMICAL (Kimyasal/Üretim)
      {
        name: "OEKO-TEX Standard 100",
        code: "OEKO-100-2024-12345",
        category: "CHEMICAL",
        issuer: "OEKO-TEX",
        validFrom: new Date("2024-02-01"),
        validUntil: new Date("2025-01-31"),
        certificateNumber: "24.HUS.12345",
        description: "Zararlı kimyasal içermediğini belgelendir",
        companyId: defacto.id,
      },
      {
        name: "bluesign® System Partner",
        code: "BLUESIGN-2024",
        category: "CHEMICAL",
        issuer: "bluesign technologies ag",
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
        description:
          "Sürdürülebilir kimyasal yönetimi ve çevre koruma sertifikası",
        companyId: defacto.id,
      },
      {
        name: "ZDHC MRSL Level 3",
        code: "ZDHC-2024-L3",
        category: "CHEMICAL",
        issuer: "ZDHC Foundation",
        validFrom: new Date("2024-04-01"),
        validUntil: new Date("2025-03-31"),
        description:
          "Zararlı kimyasalların sınırlandırılması (Manufacturing Restricted Substances List)",
        companyId: defacto.id,
      },

      // SOCIAL (Sosyal/Etik)
      {
        name: "BSCI (Business Social Compliance Initiative)",
        code: "BSCI-2024-TR-456",
        category: "SOCIAL",
        issuer: "Amfori BSCI",
        validFrom: new Date("2024-01-15"),
        validUntil: new Date("2026-01-14"),
        certificateNumber: "BSCI-TR-456789",
        description: "İşçi hakları ve sosyal uyumluluk sertifikası (Skor: A)",
        companyId: defacto.id,
      },
      {
        name: "SA8000:2014",
        code: "SA8000-2024",
        category: "SOCIAL",
        issuer: "Social Accountability International",
        validFrom: new Date("2024-03-01"),
        validUntil: new Date("2027-02-28"),
        certificateNumber: "SAI-SA8000-7891",
        description: "Uluslararası sosyal sorumluluk standardı",
        companyId: defacto.id,
      },
      {
        name: "WRAP (Worldwide Responsible Accredited Production)",
        code: "WRAP-2024-GOLD",
        category: "SOCIAL",
        issuer: "WRAP",
        validFrom: new Date("2024-05-01"),
        validUntil: new Date("2025-04-30"),
        description: "Sorumlu üretim ve etik işgücü uygulamaları (Gold Level)",
        companyId: defacto.id,
      },

      // ENVIRONMENTAL (Çevresel Etki)
      {
        name: "ISO 14067:2018 Carbon Footprint",
        code: "ISO14067-2024",
        category: "ENVIRONMENTAL",
        issuer: "TÜV SÜD",
        validFrom: new Date("2024-02-01"),
        validUntil: new Date("2027-01-31"),
        certificateNumber: "TUV-14067-4589",
        description: "Ürün karbon ayak izi hesaplama ve raporlama standardı",
        companyId: defacto.id,
      },
      {
        name: "LCA (Life Cycle Assessment) Report",
        code: "LCA-2024-001",
        category: "ENVIRONMENTAL",
        issuer: "Ecoinvent",
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2024-12-31"),
        description:
          "Ürün yaşam döngüsü analizi - koleksiyon bazlı çevresel etki değerlendirmesi",
        companyId: defacto.id,
      },
      {
        name: "Climate Neutral Certified",
        code: "CNC-2024",
        category: "ENVIRONMENTAL",
        issuer: "Climate Neutral",
        validFrom: new Date("2024-06-01"),
        validUntil: new Date("2025-05-31"),
        description: "Karbon nötr üretim sertifikası",
        companyId: defacto.id,
      },

      // TRACEABILITY (İzlenebilirlik)
      {
        name: "Digital Product Passport (DPP)",
        code: "DPP-EU-2024",
        category: "TRACEABILITY",
        issuer: "EU Commission",
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2026-12-31"),
        description:
          "AB Dijital Ürün Pasaportu - Tam izlenebilirlik ve şeffaflık",
        companyId: defacto.id,
      },
      {
        name: "Blockchain Traceability System",
        code: "BLOCKCHAIN-2024",
        category: "TRACEABILITY",
        issuer: "TextileGenesis",
        validFrom: new Date("2024-03-01"),
        validUntil: new Date("2025-02-28"),
        description: "Blockchain tabanlı hammadde-ürün izlenebilirlik sistemi",
        companyId: defacto.id,
      },
      {
        name: "Higg Index FEM (Facility Environmental Module)",
        code: "HIGG-FEM-2024",
        category: "TRACEABILITY",
        issuer: "Sustainable Apparel Coalition (SAC)",
        validFrom: new Date("2024-01-01"),
        validUntil: new Date("2024-12-31"),
        description: "Tesis bazlı çevresel performans izleme ve raporlama",
        companyId: defacto.id,
      },
    ],
  });
  console.log(`✅ Created 16 certifications for Defacto (5 categories)`);

  // 8. Create Collections
  console.log("📸 Fetching images from Unsplash...");

  // Fetch images for different collection types - Fashion & Moda focused
  const tshirtImages = await fetchUnsplashImages(
    "mens fashion tshirt model",
    3
  );
  const blouseImages = await fetchUnsplashImages(
    "womens fashion blouse elegant",
    2
  );
  const sweatshirtImages = await fetchUnsplashImages(
    "streetwear fashion hoodie sweatshirt",
    3
  );
  const jacketImages = await fetchUnsplashImages(
    "sustainable fashion jacket outerwear",
    2
  );
  const pantsImages = await fetchUnsplashImages(
    "mens fashion denim jeans pants",
    3
  );
  const knitwearImages = await fetchUnsplashImages(
    "womens fashion sweater knitwear",
    2
  );
  const underwearImages = await fetchUnsplashImages("kids fashion clothing", 2);
  const sportswearImages = await fetchUnsplashImages(
    "athletic fashion sportswear activewear",
    3
  );

  console.log("✅ Images fetched from Unsplash");

  const collection1 = await prisma.collection.create({
    data: {
      name: "Yaz 2025 Erkek Tişört Koleksiyonu",
      description:
        "Rahat kesim, %100 pamuk, çeşitli renk seçenekleri. Modern tasarım.",

      // ADIM 1: Temel Bilgiler
      modelCode: "THS-SS25-001",
      season: "SS25",
      gender: "MEN",
      fit: "Regular Fit",

      // ADIM 2: Varyantlar
      colors: JSON.stringify(["Beyaz", "Lacivert", "Siyah", "Gri"]),
      sizeRange: "S-XXL",

      // ADIM 3: Teknik
      fabricComposition: "%100 Pamuk",
      accessories: JSON.stringify({
        label: "Dokuma etiket",
        hangtag: "Karton askılık",
      }),
      images: JSON.stringify(tshirtImages),

      // ADIM 4: Ticari
      moq: 500,
      targetPrice: 12.5,
      targetLeadTime: 45,
      notes: "Standart polo tişört, her sezon satılan model",

      // Legacy
      price: 45.0,
      sku: "TSH-2025-M-001",
      stock: 1000,
      productionSchedule: {
        PLANNING: 2,
        FABRIC: 3,
        CUTTING: 2,
        SEWING: 8,
        QUALITY: 1,
        PACKAGING: 1,
        SHIPPING: 1,
      }, // Total: 18 days
      isActive: true,
      isFeatured: true,
      slug: "yaz-2025-erkek-tisort",
      categoryId: erkekGiyim?.id,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  const collection2 = await prisma.collection.create({
    data: {
      name: "Sonbahar 2025 Kadın Bluz Koleksiyonu",
      description: "Şık ve zarif bluzlar, ofis ve günlük kullanım için ideal.",

      // ADIM 1
      modelCode: "BLZ-FW25-002",
      season: "FW25",
      gender: "WOMEN",
      fit: "Slim Fit",

      // ADIM 2
      colors: JSON.stringify(["Beyaz", "Pudra", "Siyah"]),
      sizeRange: "XS-XL",

      // ADIM 3
      fabricComposition: "95% Viskon 5% Elastan",
      accessories: JSON.stringify({
        buttons: "Sedef düğme",
        label: "Saten etiket",
      }),
      images: JSON.stringify(blouseImages),

      // ADIM 4
      moq: 300,
      targetPrice: 18.75,
      targetLeadTime: 55,

      // Legacy
      price: 89.0,
      sku: "BLZ-2025-K-001",
      stock: 500,
      productionSchedule: {
        PLANNING: 3,
        FABRIC: 5,
        CUTTING: 3,
        SEWING: 12,
        QUALITY: 2,
        PACKAGING: 2,
        SHIPPING: 1,
      }, // Total: 28 days
      isActive: true,
      isFeatured: false,
      slug: "sonbahar-2025-kadin-bluz",
      categoryId: kadinGiyim?.id,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  const collection3 = await prisma.collection.create({
    data: {
      name: "İlkbahar 2025 Unisex Sweatshirt",
      description: "Her mevsim kullanılabilir, rahat sweatshirt modelleri.",

      // ADIM 1
      modelCode: "SWT-SS25-003",
      season: "SS25",
      gender: "UNISEX",
      fit: "Oversized",

      // ADIM 2
      colors: JSON.stringify(["Gri Melanj", "Siyah", "Bej", "Haki"]),
      sizeRange: "XS-XXL",

      // ADIM 3
      fabricComposition: "80% Pamuk 20% Polyester",
      accessories: JSON.stringify({
        zipper: "YKK fermuarı",
        label: "Baskılı etiket",
      }),
      images: JSON.stringify(sweatshirtImages),

      // ADIM 4
      moq: 800,
      targetPrice: 22.0,
      targetLeadTime: 60,
      notes: "Unisex model, oversized kesim",

      // Legacy
      price: 120.0,
      sku: "SWT-2025-U-001",
      stock: 750,
      productionSchedule: {
        PLANNING: 4,
        FABRIC: 4,
        CUTTING: 3,
        SEWING: 15,
        QUALITY: 3,
        PACKAGING: 2,
        SHIPPING: 1,
      }, // Total: 32 days
      isActive: true,
      isFeatured: true,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  // More collections with sustainability data
  const collection4 = await prisma.collection.create({
    data: {
      name: "Eco-Friendly Dış Giyim Kış 2025",
      description:
        "Geri dönüştürülmüş malzemelerden üretilmiş sürdürülebilir dış giyim koleksiyonu.",
      modelCode: "ECO-FW25-004",
      season: "FW25",
      gender: "UNISEX",
      fit: "Regular Fit",
      colors: JSON.stringify(["Yeşil", "Lacivert", "Kahverengi"]),
      sizeRange: "S-XXL",
      fabricComposition: "60% Geri Dönüştürülmüş Polyester 40% Organik Pamuk",
      accessories: JSON.stringify({
        zipper: "Geri dönüştürülmüş YKK fermuarı",
        buttons: "Ahşap düğme",
        label: "Organik pamuk etiket",
      }),
      images: JSON.stringify(jacketImages),
      moq: 400,
      targetPrice: 45.0,
      targetLeadTime: 70,
      notes: "GOTS sertifikalı, carbon neutral üretim",
      price: 280.0,
      sku: "ECO-2025-U-001",
      stock: 300,
      productionSchedule: {
        PLANNING: 5,
        FABRIC: 7,
        CUTTING: 4,
        SEWING: 20,
        QUALITY: 4,
        PACKAGING: 2,
        SHIPPING: 2,
      },
      isActive: true,
      isFeatured: true,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  const collection5 = await prisma.collection.create({
    data: {
      name: "Premium Alt Giyim Erkek 2025",
      description: "Yüksek kaliteli pantolon ve jean koleksiyonu.",
      modelCode: "PNT-SS25-005",
      season: "SS25",
      gender: "MEN",
      fit: "Slim Fit",
      colors: JSON.stringify(["İndigo", "Siyah", "Gri", "Bej"]),
      sizeRange: "28-40",
      fabricComposition: "98% Pamuk 2% Elastan",
      accessories: JSON.stringify({
        rivets: "Metal rivet",
        button: "Metal düğme",
        zipper: "YKK metal fermuarı",
      }),
      images: JSON.stringify(pantsImages),
      moq: 600,
      targetPrice: 28.0,
      targetLeadTime: 55,
      price: 180.0,
      sku: "PNT-2025-M-001",
      stock: 800,
      productionSchedule: {
        PLANNING: 3,
        FABRIC: 6,
        CUTTING: 4,
        SEWING: 18,
        QUALITY: 3,
        PACKAGING: 2,
        SHIPPING: 1,
      },
      isActive: true,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  const collection6 = await prisma.collection.create({
    data: {
      name: "Sonbahar Üst Giyim Kadın 2025",
      description: "Triko, kazak ve hırka koleksiyonu.",
      modelCode: "KNT-FW25-006",
      season: "FW25",
      gender: "WOMEN",
      fit: "Regular Fit",
      colors: JSON.stringify(["Krem", "Bordo", "Lacivert", "Siyah"]),
      sizeRange: "XS-XL",
      fabricComposition: "70% Akrilik 30% Yün",
      images: JSON.stringify(knitwearImages),
      moq: 350,
      targetPrice: 32.0,
      targetLeadTime: 65,
      price: 195.0,
      sku: "KNT-2025-K-001",
      stock: 450,
      productionSchedule: {
        PLANNING: 4,
        FABRIC: 8,
        CUTTING: 3,
        SEWING: 15,
        QUALITY: 3,
        PACKAGING: 2,
        SHIPPING: 1,
      },
      isActive: true,
      isFeatured: true,
      categoryId: kadinGiyim?.id,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  const collection7 = await prisma.collection.create({
    data: {
      name: "Çocuk İç Giyim Yaz 2025",
      description: "Yumuşak ve konforlu çocuk iç giyim seti.",
      modelCode: "UND-SS25-007",
      season: "SS25",
      gender: "UNISEX",
      fit: "Regular Fit",
      colors: JSON.stringify(["Beyaz", "Mavi", "Pembe", "Sarı"]),
      sizeRange: "2-12 yaş",
      fabricComposition: "95% Pamuk 5% Elastan",
      images: JSON.stringify(underwearImages),
      moq: 1000,
      targetPrice: 8.5,
      targetLeadTime: 35,
      price: 45.0,
      sku: "UND-2025-K-001",
      stock: 1500,
      productionSchedule: {
        PLANNING: 2,
        FABRIC: 3,
        CUTTING: 2,
        SEWING: 6,
        QUALITY: 1,
        PACKAGING: 1,
        SHIPPING: 1,
      },
      isActive: true,
      categoryId: cocukGiyim?.id,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  const collection8 = await prisma.collection.create({
    data: {
      name: "Spor Giyim Unisex 2025",
      description: "Aktif yaşam için tasarlanmış performans giyim koleksiyonu.",
      modelCode: "SPR-SS25-008",
      season: "SS25",
      gender: "UNISEX",
      fit: "Athletic Fit",
      colors: JSON.stringify(["Siyah", "Gri", "Lacivert", "Kırmızı"]),
      sizeRange: "XS-XXL",
      fabricComposition: "88% Polyester 12% Elastan (Moisture Wicking)",
      accessories: JSON.stringify({
        reflective: "Yansıtıcı bant",
        label: "Lazer kesim etiket",
      }),
      images: JSON.stringify(sportswearImages),
      moq: 500,
      targetPrice: 18.0,
      targetLeadTime: 40,
      notes: "Quick-dry teknolojisi, anti-bacterial",
      price: 95.0,
      sku: "SPR-2025-U-001",
      stock: 900,
      productionSchedule: {
        PLANNING: 2,
        FABRIC: 4,
        CUTTING: 2,
        SEWING: 10,
        QUALITY: 2,
        PACKAGING: 1,
        SHIPPING: 1,
      },
      isActive: true,
      isFeatured: true,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  console.log(
    `✅ Created 8 collections (including eco-friendly and diverse categories)`
  );

  // 9. Create Samples
  const sample1 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-00001",
      sampleType: "STANDARD",
      status: "COMPLETED",
      customerNote: "M, L, XL bedenlerinde numune istiyoruz.",
      manufacturerResponse: "Numuneleriniz hazır, kargoya verildi.",
      productionDays: 5,
      estimatedProductionDate: new Date("2025-10-20"),
      actualProductionDate: new Date("2025-10-18"),
      shippingDate: new Date("2025-10-19"),
      deliveryAddress: "LC Waikiki Merkez Ofis, İstanbul",
      cargoTrackingNumber: "1234567890",
      collectionId: collection1.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const sample2 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-00002",
      sampleType: "REVISION",
      status: "IN_PRODUCTION",
      customerNote: "Beden değişikliği: M → L, Renk: Mavi → Lacivert",
      manufacturerResponse: "Revize talep alındı, 3 gün içinde hazır olacak.",
      revisionRequests: JSON.stringify([
        {
          field: "Beden",
          oldValue: "M",
          newValue: "L",
          note: "Müşteri tercihi",
        },
        {
          field: "Renk",
          oldValue: "Mavi",
          newValue: "Lacivert",
          note: "Marka standartlarına uyum",
        },
      ]),
      productionDays: 3,
      estimatedProductionDate: new Date("2025-10-16"),
      originalCollectionId: collection1.id,
      collectionId: collection1.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const sample3 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-00003",
      sampleType: "CUSTOM",
      status: "IN_DESIGN",
      customerNote: "Kendi tasarımımız için özel numune",
      manufacturerResponse: "Tasarım incelendi, kalıp hazırlanıyor.",
      customDesignImages: JSON.stringify([
        "/uploads/design1.jpg",
        "/uploads/design2.jpg",
      ]),
      productionDays: 7,
      estimatedProductionDate: new Date("2025-10-22"),
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created 3 samples`);

  // Get sample user for production history
  const mehmetUser = await prisma.user.findUnique({
    where: { email: "mehmet@defacto.com" },
  });

  // 9. Create Sample Production History
  await prisma.sampleProduction.createMany({
    data: [
      {
        sampleId: sample1.id,
        status: "REQUESTED",
        note: "Müşteri tarafından talep edildi",
        updatedById: lcwOwner.id,
      },
      {
        sampleId: sample1.id,
        status: "RECEIVED",
        note: "Talep alındı, planlama başladı",
        estimatedDays: 5,
        updatedById: mehmetUser!.id,
      },
      {
        sampleId: sample1.id,
        status: "IN_PRODUCTION",
        note: "Numune üretimi başladı",
        updatedById: mehmetUser!.id,
      },
      {
        sampleId: sample1.id,
        status: "COMPLETED",
        note: "Numune tamamlandı, kalite kontrolden geçti",
        actualDate: new Date("2025-10-18"),
        updatedById: mehmetUser!.id,
      },
      {
        sampleId: sample1.id,
        status: "SHIPPED",
        note: "Kargoya verildi",
        actualDate: new Date("2025-10-19"),
        updatedById: mehmetUser!.id,
      },
    ],
  });

  console.log(`✅ Created sample production history`);

  // 10. Create Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-00001",
      quantity: 500,
      unitPrice: 42.0,
      totalPrice: 21000.0,
      status: "IN_PRODUCTION",
      customerNote: "Acil sipariş, Kasım ayı sonuna kadar teslimat",
      manufacturerResponse: "Onaylandı, 30 gün içinde teslim edilecek",
      productionDays: 30,
      estimatedProductionDate: new Date("2025-11-15"),
      actualProductionStart: new Date("2025-10-10"),
      deliveryAddress: "LC Waikiki Ana Depo, İstanbul",
      collectionId: collection1.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-00002",
      quantity: 300,
      unitPrice: 85.0,
      totalPrice: 25500.0,
      status: "QUOTE_SENT",
      customerNote: "Beden dağılımı: S:50, M:100, L:100, XL:50",
      manufacturerResponse: "Fiyat teklifi: ₺85/adet, 25 gün üretim süresi",
      productionDays: 25,
      estimatedProductionDate: new Date("2025-11-10"),
      deliveryAddress: "LC Waikiki Bölge Deposu, Ankara",
      collectionId: collection2.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-00003",
      quantity: 1000,
      unitPrice: 115.0,
      totalPrice: 115000.0,
      status: "CONFIRMED",
      customerNote: "Yüksek hacimli sipariş, kademeli teslimat mümkün",
      manufacturerResponse: "Sipariş onaylandı, üretim başlayacak",
      productionDays: 35,
      estimatedProductionDate: new Date("2025-11-20"),
      collectionId: collection3.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created 3 orders`);

  // Get production user
  const canUser = await prisma.user.findUnique({
    where: { email: "can@defacto.com" },
  });

  // 11. Create Order Production History
  await prisma.orderProduction.createMany({
    data: [
      {
        orderId: order1.id,
        status: "PENDING",
        note: "Sipariş alındı",
        updatedById: lcwOwner.id,
      },
      {
        orderId: order1.id,
        status: "CONFIRMED",
        note: "Sipariş onaylandı, üretim planlandı",
        estimatedDays: 30,
        updatedById: defactoOwner.id,
      },
      {
        orderId: order1.id,
        status: "IN_PRODUCTION",
        note: "Üretim başladı",
        actualDate: new Date("2025-10-10"),
        updatedById: canUser!.id,
      },
    ],
  });

  console.log(`✅ Created order production history`);

  // 12. Create Production Tracking for Order 1
  const productionTracking = await prisma.productionTracking.create({
    data: {
      orderId: order1.id,
      currentStage: "SEWING",
      overallStatus: "IN_PROGRESS",
      progress: 65,
      estimatedStartDate: new Date("2025-10-10"),
      estimatedEndDate: new Date("2025-11-15"),
      actualStartDate: new Date("2025-10-10"),
      notes: "Üretim planlandığı gibi ilerliyor",
      companyId: defacto.id,
    },
  });

  // 13. Create Production Stage Updates
  await prisma.productionStageUpdate.createMany({
    data: [
      {
        productionId: productionTracking.id,
        stage: "PLANNING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-10-10"),
        actualEndDate: new Date("2025-10-11"),
        estimatedDays: 1,
        notes: "Üretim planı hazırlandı, malzeme siparişi verildi",
      },
      {
        productionId: productionTracking.id,
        stage: "FABRIC",
        status: "COMPLETED",
        actualStartDate: new Date("2025-10-11"),
        actualEndDate: new Date("2025-10-14"),
        estimatedDays: 3,
        notes: "500 adet için 250 metre kumaş tedarik edildi",
        photos: JSON.stringify([
          "/uploads/fabric1.jpg",
          "/uploads/fabric2.jpg",
        ]),
      },
      {
        productionId: productionTracking.id,
        stage: "CUTTING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-10-14"),
        actualEndDate: new Date("2025-10-16"),
        estimatedDays: 2,
        notes: "Kesim işlemi tamamlandı",
        photos: JSON.stringify(["/uploads/cutting1.jpg"]),
      },
      {
        productionId: productionTracking.id,
        stage: "SEWING",
        status: "IN_PROGRESS",
        actualStartDate: new Date("2025-10-16"),
        estimatedDays: 10,
        notes: "Günde 50 adet üretiliyor, toplam 325 adet tamamlandı",
        photos: JSON.stringify([
          "/uploads/sewing1.jpg",
          "/uploads/sewing2.jpg",
          "/uploads/sewing3.jpg",
        ]),
      },
      {
        productionId: productionTracking.id,
        stage: "QUALITY",
        status: "NOT_STARTED",
        estimatedDays: 2,
        notes: "Dikiş tamamlandıktan sonra başlayacak",
      },
      {
        productionId: productionTracking.id,
        stage: "PACKAGING",
        status: "NOT_STARTED",
        estimatedDays: 1,
      },
      {
        productionId: productionTracking.id,
        stage: "SHIPPING",
        status: "NOT_STARTED",
        estimatedDays: 1,
      },
    ],
  });

  console.log(`✅ Created production tracking with 7 stages`);

  // 🧪 TEST: Create order with stage completion in 3 hours
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-TEST-URGENT",
      quantity: 100,
      unitPrice: 35.0,
      totalPrice: 3500.0,
      status: "IN_PRODUCTION",
      customerNote: "Test siparişi - 3 saat içinde bitecek aşama",
      manufacturerResponse: "Onaylandı, hızlı üretim",
      productionDays: 1,
      estimatedProductionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      actualProductionStart: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      deliveryAddress: "LC Waikiki Test Depo",
      collectionId: collection1.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  // Calculate times for test order (2 hours ago started, 5 hours total = 3 hours remaining)
  const testStartTime = new Date();
  testStartTime.setHours(testStartTime.getHours() - 2); // Started 2 hours ago

  const testEndTime = new Date(testStartTime);
  testEndTime.setHours(testEndTime.getHours() + 5); // Will end in 3 hours from now

  const testProductionTracking = await prisma.productionTracking.create({
    data: {
      orderId: testOrder.id,
      currentStage: "FABRIC",
      overallStatus: "IN_PROGRESS",
      progress: 40,
      estimatedStartDate: testStartTime,
      estimatedEndDate: testEndTime,
      actualStartDate: testStartTime,
      notes: "🧪 TEST: Bu aşama 3 saat içinde bitecek - dashboard'da görünmeli",
      companyId: defacto.id,
    },
  });

  const planningStartTime = new Date(testStartTime);
  planningStartTime.setHours(planningStartTime.getHours() - 1); // 1 hour before fabric

  const planningEndTime = new Date(testStartTime); // Ended when fabric started

  await prisma.productionStageUpdate.createMany({
    data: [
      {
        productionId: testProductionTracking.id,
        stage: "PLANNING",
        status: "COMPLETED",
        actualStartDate: planningStartTime,
        actualEndDate: planningEndTime,
        estimatedDays: 1, // 1 day (minimum for Int type)
        notes: "✅ Test planning tamamlandı",
      },
      {
        productionId: testProductionTracking.id,
        stage: "FABRIC",
        status: "IN_PROGRESS",
        actualStartDate: testStartTime,
        estimatedDays: 1, // 1 day (but we'll check based on actualStartDate + hours)
        notes: "⏰ UYARI: Bu aşama 3 saat içinde bitecek - onay gerekiyor!",
      },
      {
        productionId: testProductionTracking.id,
        stage: "CUTTING",
        status: "NOT_STARTED",
        estimatedDays: 1,
        notes: "Kumaş aşaması bittikten sonra başlayacak",
      },
      {
        productionId: testProductionTracking.id,
        stage: "SEWING",
        status: "NOT_STARTED",
        estimatedDays: 2,
      },
      {
        productionId: testProductionTracking.id,
        stage: "QUALITY",
        status: "NOT_STARTED",
        estimatedDays: 1,
      },
      {
        productionId: testProductionTracking.id,
        stage: "PACKAGING",
        status: "NOT_STARTED",
        estimatedDays: 1,
      },
      {
        productionId: testProductionTracking.id,
        stage: "SHIPPING",
        status: "NOT_STARTED",
        estimatedDays: 1,
      },
    ],
  });

  console.log(
    `✅ 🧪 TEST: Created urgent order with stage completion in 3 hours`
  );

  // Get quality inspector
  const sedaUser = await prisma.user.findUnique({
    where: { email: "seda@lcwaikiki.com" },
  });

  // 14. Create Quality Control Reports
  await prisma.qualityControl.createMany({
    data: [
      {
        productionId: productionTracking.id,
        inspectorId: sedaUser!.id,
        checkDate: new Date("2025-10-12"),
        result: "PASSED",
        score: 95,
        notes: "Mükemmel kalite, minimal hata",
        fabricDefects: true,
        sewingDefects: false,
        measureDefects: false,
        finishingDefects: false,
        photos: JSON.stringify(["/uploads/qc1.jpg", "/uploads/qc2.jpg"]),
      },
      {
        productionId: productionTracking.id,
        inspectorId: sedaUser!.id,
        checkDate: new Date("2025-10-11"),
        result: "CONDITIONAL_PASS",
        score: 78,
        notes: "Minör dikiş hataları var, kabul edilebilir",
        fabricDefects: true,
        sewingDefects: true,
        measureDefects: false,
        finishingDefects: false,
      },
    ],
  });

  console.log(`✅ Created 2 quality control reports`);

  // 15. Create Workshops
  const sewingWorkshop = await prisma.workshop.create({
    data: {
      name: "Merkez Dikiş Atölyesi",
      type: "SEWING",
      location: "İstanbul Fabrika - A Blok",
      capacity: 100,
      isActive: true,
      ownerId: canUser!.id,
    },
  });

  const packagingWorkshop = await prisma.workshop.create({
    data: {
      name: "Paketleme Birimi",
      type: "PACKAGING",
      location: "İstanbul Fabrika - B Blok",
      capacity: 200,
      isActive: true,
      ownerId: canUser!.id,
    },
  });

  console.log(`✅ Created 2 workshops`);

  // Update production tracking with workshop assignments
  await prisma.productionTracking.update({
    where: { id: productionTracking.id },
    data: {
      sewingWorkshopId: sewingWorkshop.id,
      packagingWorkshopId: packagingWorkshop.id,
    },
  });

  // 16. Create Messages
  await prisma.message.createMany({
    data: [
      {
        content: "Merhaba, sipariş durumu hakkında bilgi alabilir miyim?",
        senderId: lcwOwner.id,
        receiverId: defactoOwner.id,
        type: "direct",
        isRead: true,
        companyId: lcwaikiki.id,
      },
      {
        content: "Tabii ki! Siparişiniz üretimde, %65 tamamlandı.",
        senderId: defactoOwner.id,
        receiverId: lcwOwner.id,
        type: "direct",
        isRead: false,
        companyId: defacto.id,
      },
      {
        content:
          "Tüm çalışanlara duyuru: Bu hafta kalite kontrol standartları güncellendi.",
        senderId: defactoOwner.id,
        receiverId: null,
        type: "company",
        isRead: false,
        companyId: defacto.id,
      },
    ],
  });

  console.log(`✅ Created 3 messages`);

  // 17. Create Questions
  await prisma.question.createMany({
    data: [
      {
        question: "Bu ürün organik pamuktan mı üretiliyor?",
        answer: "Evet, %100 organik sertifikalı pamuk kullanıyoruz.",
        isAnswered: true,
        isPublic: true,
        collectionId: collection1.id,
        customerId: lcwOwner.id,
        manufactureId: defactoOwner.id,
      },
      {
        question: "Minimum sipariş miktarı nedir?",
        answer: "Minimum 100 adet sipariş alıyoruz.",
        isAnswered: true,
        isPublic: true,
        collectionId: collection1.id,
        customerId: lcwOwner.id,
        manufactureId: defactoOwner.id,
      },
      {
        question: "Farklı renk seçenekleri var mı?",
        isAnswered: false,
        isPublic: true,
        collectionId: collection2.id,
        customerId: lcwOwner.id,
        manufactureId: defactoOwner.id,
      },
    ],
  });

  console.log(`✅ Created 3 questions (2 answered, 1 pending)`);

  // 18. Create Reviews
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment:
          "Harika kalite, zamanında teslimat. Kesinlikle tavsiye ederim!",
        isApproved: true,
        collectionId: collection1.id,
        customerId: lcwOwner.id,
      },
      {
        rating: 4,
        comment: "Ürün kaliteli ama teslimat biraz gecikti.",
        isApproved: true,
        collectionId: collection2.id,
        customerId: lcwOwner.id,
      },
      {
        rating: 5,
        comment: "Mükemmel hizmet ve ürün kalitesi!",
        isApproved: false, // Pending approval
        collectionId: collection3.id,
        customerId: lcwOwner.id,
      },
    ],
  });

  console.log(`✅ Created 3 reviews (2 approved, 1 pending)`);

  // 19. Add more testimonials for landing page
  const lcwBuyingManager = await prisma.user.findFirst({
    where: { email: "hasan@lcwaikiki.com" },
  });
  const lcwProductionTracker = await prisma.user.findFirst({
    where: { email: "ali@lcwaikiki.com" },
  });
  const lcwQualityManager = await prisma.user.findFirst({
    where: { email: "seda@lcwaikiki.com" },
  });

  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment:
          "ProtexFlow sayesinde üretim sürecimiz %40 hızlandı. Gerçek zamanlı takip sistemi harika!",
        isApproved: true,
        collectionId: collection1.id,
        customerId: lcwOwner.id,
      },
      {
        rating: 5,
        comment:
          "Kalite kontrol modülü sayesinde hatalı ürün oranımız minimuma indi. Çok memnunuz!",
        isApproved: true,
        collectionId: collection2.id,
        customerId: lcwBuyingManager!.id,
      },
      {
        rating: 5,
        comment:
          "AI destekli tasarım analizi çok kullanışlı. Teknik özellikleri otomatik çıkarması bize çok zaman kazandırıyor.",
        isApproved: true,
        collectionId: collection3.id,
        customerId: lcwProductionTracker!.id,
      },
      {
        rating: 4,
        comment:
          "Platform çok kapsamlı ve kullanıcı dostu. Müşteri desteği de oldukça yardımcı.",
        isApproved: true,
        collectionId: collection1.id,
        customerId: lcwQualityManager!.id,
      },
      {
        rating: 5,
        comment:
          "Sipariş yönetimi ve mesajlaşma sistemi çok pratik. Tüm iletişim tek platformda!",
        isApproved: true,
        collectionId: collection2.id,
        customerId: lcwOwner.id,
      },
    ],
  });

  console.log(`✅ Created 8 total customer testimonials (all approved)`);

  // 20. Create Production Revisions
  const productionRevision = await prisma.productionRevision.create({
    data: {
      productionId: productionTracking.id,
      reason: "Dikiş kalitesi iyileştirilmeli, bazı iplikler görülüyor",
      description: "Kalite kontrol sırasında bazı dikiş hataları tespit edildi",
      extraDays: 2,
      extraCost: 500.0,
      isApproved: false,
      requestedById: sedaUser!.id,
    },
  });

  console.log(`✅ Created 1 production revision`);

  // 21. Create AI Analysis for Sample
  await prisma.aIAnalysis.create({
    data: {
      sampleId: sample1.id,
      detectedProduct: "Erkek Tişört",
      detectedColor: "Lacivert",
      detectedFabric: "Jersey Pamuk",
      detectedPattern: "Solid",
      detectedGender: "MEN",
      detectedClassification: "Casual",
      detectedAccessories: "Etiket",
      technicalDescription:
        "Klasik pamuk tişört, standart kesim, kaliteli dikiş",
      qualityAnalysis:
        "Kumaş kalitesi mükemmel, dikiş hatları temiz ve dört, renkler canlı",
      qualityScore: 9.2,
      costAnalysis:
        "Pamuk hammaddesi maliyet açısından ekonomik, dikiş otomasyonu iyi",
      estimatedCostMin: 8.5,
      estimatedCostMax: 12.0,
      suggestedMinOrder: 500,
      trendAnalysis:
        "Klasik tişört tasarımı, dayanıklı trend, tüm sezonlarda satılır",
      trendScore: 8.5,
      targetMarket: "Casual giyim kullanan 18-45 yaş erkekler",
      salesPotential: "HIGH",
      designSuggestions: JSON.stringify({
        suggestions: [
          "Retro logo patch eklenebilir",
          "Parlak efektli baskı yapılabilir",
          "Kontrastlı desen kombinasyon",
        ],
        colors: ["Lacivert", "Beyaz", "Gri", "Siyah"],
        styles: ["Minimalist", "Vintage", "Sporty"],
      }),
      designStyle: "Casual Minimalist",
      designFocus: JSON.stringify(["Quality", "Comfort", "Versatility"]),
    },
  });

  console.log(`✅ Created AI Analysis for sample`);

  // 22. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: lcwOwner.id,
        title: "Numune Tamamlandı",
        message:
          "Talep ettiğiniz numune (SMP-2025-00001) tamamlanmış ve kargoya verilmiştir.",
        type: "SAMPLE",
        link: "/samples/1",
        isRead: false,
        sampleId: sample1.id,
      },
      {
        userId: defactoOwner.id,
        title: "Sipariş Onayı Bekleniyor",
        message:
          "LC Waikiki tarafından fiyat teklifi gönderilen sipariş (ORD-2025-00002) var.",
        type: "ORDER",
        link: "/orders/2",
        isRead: true,
        orderId: order2.id,
      },
      {
        userId: canUser!.id,
        title: "Üretim Aşaması Değişikliği",
        message: "Sipariş ORD-2025-00001 SEWING aşamasına geçti.",
        type: "PRODUCTION",
        link: "/production/1",
        isRead: false,
        productionTrackingId: productionTracking.id,
        orderId: order1.id,
      },
      {
        userId: sedaUser!.id,
        title: "Kalite Kontrol İsteği",
        message: "ORD-2025-00001 siparişi kalite kontrol için hazır.",
        type: "QUALITY",
        link: "/quality/1",
        isRead: false,
      },
      {
        userId: lcwOwner.id,
        title: "Sipariş Üretimde",
        message: "Siparişiniz (ORD-2025-00001) üretim başladı. %65 tamamlandı.",
        type: "ORDER",
        link: "/orders/1",
        isRead: false,
        orderId: order1.id,
      },
      {
        userId: defactoOwner.id,
        title: "Yeni Numune Talebine Yanıt",
        message: "Müşteri (LC Waikiki) numune ile ilgili yeni soru sormuş.",
        type: "SAMPLE",
        link: "/samples/1",
        isRead: true,
        sampleId: sample1.id,
      },
      {
        userId: lcwOwner.id,
        title: "Revizyon Talebi Alındı",
        message: "Numune SMP-2025-00002 revizyon talebiniz onaylandı.",
        type: "SAMPLE",
        link: "/samples/2",
        isRead: false,
        sampleId: sample2.id,
      },
      {
        userId: canUser!.id,
        title: "⏰ UYARI: Üretim Aşaması Bitiş Zamanı Yaklaşıyor",
        message:
          "🧪 Sipariş ORD-2025-TEST-URGENT'in FABRIC aşaması 3 saat içinde bitecek!",
        type: "PRODUCTION",
        link: "/production/test",
        isRead: false,
        productionTrackingId: testProductionTracking.id,
      },
    ],
  });

  console.log(`✅ Created 8 notifications`);

  // 23. Create User Favorite Collections
  await prisma.userFavoriteCollection.createMany({
    data: [
      {
        userId: lcwOwner.id,
        collectionId: collection1.id,
      },
      {
        userId: lcwOwner.id,
        collectionId: collection3.id,
      },
      {
        userId: lcwBuyingManager!.id,
        collectionId: collection2.id,
      },
      {
        userId: lcwBuyingManager!.id,
        collectionId: collection1.id,
      },
    ],
  });

  console.log(`✅ Created user favorite collections (likes)`);

  // 24. Create Certifications linking to Collections (many-to-many)
  // This requires updating Certification model to link with collections
  // For now, we ensure collections have certification data
  await prisma.collection.update({
    where: { id: collection4.id }, // Eco-friendly collection
    data: {
      // Link to GOTS and GRS certifications via company
    },
  });

  // 25. Create Revisions for existing orders
  await prisma.revision.createMany({
    data: [
      {
        orderId: order1.id,
        revisionNumber: 1,
        requestMessage:
          "Beden dağılımı talebimiz oldu: S:100, M:150, L:150, XL:100",
        responseMessage: "Talebiniz not alındı, üretim planı güncellendi.",
        status: "completed",
        requestedAt: new Date("2025-10-12"),
        completedAt: new Date("2025-10-13"),
      },
      {
        sampleId: sample2.id,
        revisionNumber: 1,
        requestMessage: "Beden: M→L, Renk: Mavi→Lacivert olsun",
        responseMessage: "Revizyon talebi onaylandı, yeni kalıp hazırlanıyor",
        status: "in_progress",
        requestedAt: new Date("2025-10-14"),
      },
    ],
  });

  console.log(`✅ Created 2 revisions (1 completed, 1 in-progress)`);

  // 26. Create more comprehensive collection data with all fields populated
  const collection9 = await prisma.collection.create({
    data: {
      name: "Lüks Pamuk Premium Erkek Koleksiyonu",
      description:
        "Yüksek kaliteli malzemeler ve üstün işçiliği ile seçilmiş erkek giyim koleksiyonu",
      modelCode: "LUX-FW25-009",
      season: "FW25",
      gender: "MEN",
      fit: "Tailored Fit",
      trend: "Premium Casual",
      colors: JSON.stringify(["Krem", "Kahverengi", "Haki", "Antrasit"]),
      sizeGroups: JSON.stringify([7, 8]), // Erkek Standart ve Plus Size groups
      sizeRange: "S-3XL",
      measurementChart: "/uploads/measurements/luxury-mens-fw25.pdf",
      fabricComposition: "%100 Premium Pima Pamuk",
      accessories: JSON.stringify({
        buttons: "Bone/Horn düğmeler",
        label: "Nakış işlemeli etiket",
        packaging: "Lüks hediye kutusu",
        hangtag: "Metalik baskılı etiket",
      }),
      images: JSON.stringify(tshirtImages.slice(0, 2)),
      techPack: "/uploads/techpacks/luxury-mens-fw25.pdf",
      moq: 200,
      targetPrice: 45.0,
      targetLeadTime: 60,
      notes: "Premium koleksiyon, el yapımı detaylar, sınırlı edition",
      price: 285.0,
      sku: "LUX-2025-M-001",
      stock: 250,
      productionSchedule: {
        PLANNING: 5,
        FABRIC: 8,
        CUTTING: 5,
        SEWING: 20,
        QUALITY: 4,
        PACKAGING: 3,
        SHIPPING: 2,
      },
      isActive: true,
      isFeatured: true,
      slug: "lux-pamuk-premium-erkek-koleksiyonu",
      categoryId: erkekGiyim?.id,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  // Link certification to this collection
  const gortscert = await prisma.certification.findFirst({
    where: { code: "GOTS-2024-TR-001" },
  });
  if (gortscert) {
    // Note: We need a many-to-many table for this, currently it's not in schema
    // But we can reference it through company certifications
  }

  const collection10 = await prisma.collection.create({
    data: {
      name: "Çevre Dostu Unisex Aktivwear Koleksiyonu",
      description:
        "Geri dönüştürülmüş malzemelerden üretilmiş, performans odaklı spor giyim",
      modelCode: "ECO-ACT-2025-010",
      season: "SS25",
      gender: "UNISEX",
      fit: "Athletic Fit",
      trend: "Sustainable Sport",
      colors: JSON.stringify([
        "Doğal Beyaz",
        "Orman Yeşili",
        "Yer Grisi",
        "Okyanus Mavisi",
      ]),
      sizeGroups: JSON.stringify([1, 2]),
      sizeRange: "XS-3XL",
      fabricComposition:
        "88% Geri Dönüştürülmüş Polyester 12% Elastan (3D Breathable)",
      accessories: JSON.stringify({
        zipper: "YKK Aquaguard fermuarı",
        label: "Organik pamuk dikişli etiket",
        thread: "Geri dönüştürülmüş polyester iplik",
        branding: "Baskı ile yapılmış logo",
      }),
      images: JSON.stringify(sportswearImages),
      techPack: "/uploads/techpacks/eco-activwear-ss25.pdf",
      moq: 600,
      targetPrice: 22.5,
      targetLeadTime: 50,
      notes:
        "Carbon neutral, plastik çanta geri dönüşümü kullanıyor, vegan tasarım",
      price: 99.0,
      sku: "ECO-ACT-2025-001",
      stock: 1200,
      productionSchedule: {
        PLANNING: 3,
        FABRIC: 5,
        CUTTING: 3,
        SEWING: 12,
        QUALITY: 2,
        PACKAGING: 2,
        SHIPPING: 1,
      },
      isActive: true,
      isFeatured: true,
      slug: "eco-unisex-aktivwear",
      categoryId: erkekGiyim?.id,
      authorId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  console.log(`✅ Created 2 premium collections with complete data`);

  // 27. Create more Orders with different statuses for dashboard variety
  const order4 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-00004",
      quantity: 2000,
      unitPrice: 38.0,
      totalPrice: 76000.0,
      status: "PENDING",
      customerNote: "Yüksek hacim sipariş, ödeme koşulları özel olabilir mi?",
      productionDays: 45,
      deliveryAddress: "LC Waikiki Lojistik Merkezi, İzmir",
      collectionId: collection4.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const order5 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-00005",
      quantity: 150,
      unitPrice: 95.0,
      totalPrice: 14250.0,
      status: "DELIVERED",
      customerNote: "Standart sipariş",
      manufacturerResponse: "Tamamlandı ve kargoya verildi",
      estimatedProductionDate: new Date("2025-09-20"),
      actualProductionStart: new Date("2025-09-01"),
      actualProductionEnd: new Date("2025-09-18"),
      shippingDate: new Date("2025-09-20"),
      cargoTrackingNumber: "TR123456789",
      deliveryAddress: "LC Waikiki Mağaza, Ankara",
      collectionId: collection2.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const order6 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-00006",
      quantity: 75,
      unitPrice: 280.0,
      totalPrice: 21000.0,
      status: "CANCELLED",
      customerNote: "Sipariş iptal, müşteri tarafından talep edildi",
      manufacturerResponse: "Sipariş iptal edildi, malzeme tedariki durduruldu",
      collectionId: collection9.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created 3 more orders (PENDING, COMPLETED, CANCELLED)`);

  // 28. Create Order Production History for completed order
  const canUser2 = await prisma.user.findUnique({
    where: { email: "can@defacto.com" },
  });

  await prisma.orderProduction.createMany({
    data: [
      {
        orderId: order5.id,
        status: "PRODUCTION_COMPLETE",
        note: "Sipariş tamamlandı ve teslimat yapıldı",
        actualDate: new Date("2025-09-18"),
        updatedById: canUser2!.id,
      },
    ],
  });

  // 29. Create Production Tracking for completed order
  const completedProductionTracking = await prisma.productionTracking.create({
    data: {
      orderId: order5.id,
      currentStage: "SHIPPING",
      overallStatus: "COMPLETED",
      progress: 100,
      estimatedStartDate: new Date("2025-09-01"),
      estimatedEndDate: new Date("2025-09-20"),
      actualStartDate: new Date("2025-09-01"),
      actualEndDate: new Date("2025-09-18"),
      notes: "Üretim %10 erken tamamlandı, kalite standartları aşıldı",
      companyId: defacto.id,
    },
  });

  // All stages completed for this order
  await prisma.productionStageUpdate.createMany({
    data: [
      {
        productionId: completedProductionTracking.id,
        stage: "PLANNING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-01"),
        actualEndDate: new Date("2025-09-02"),
        estimatedDays: 1,
        notes: "✅ Tamamlandı",
      },
      {
        productionId: completedProductionTracking.id,
        stage: "FABRIC",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-02"),
        actualEndDate: new Date("2025-09-05"),
        estimatedDays: 3,
        notes: "✅ Tamamlandı",
      },
      {
        productionId: completedProductionTracking.id,
        stage: "CUTTING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-05"),
        actualEndDate: new Date("2025-09-07"),
        estimatedDays: 2,
        notes: "✅ Tamamlandı",
      },
      {
        productionId: completedProductionTracking.id,
        stage: "SEWING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-07"),
        actualEndDate: new Date("2025-09-15"),
        estimatedDays: 8,
        notes: "✅ Tamamlandı",
      },
      {
        productionId: completedProductionTracking.id,
        stage: "QUALITY",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-15"),
        actualEndDate: new Date("2025-09-16"),
        estimatedDays: 1,
        notes: "✅ Tamamlandı - Kusursuz kalite",
      },
      {
        productionId: completedProductionTracking.id,
        stage: "PACKAGING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-16"),
        actualEndDate: new Date("2025-09-17"),
        estimatedDays: 1,
        notes: "✅ Tamamlandı",
      },
      {
        productionId: completedProductionTracking.id,
        stage: "SHIPPING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-09-17"),
        actualEndDate: new Date("2025-09-18"),
        estimatedDays: 1,
        notes: "✅ Tamamlandı - Müşteriye teslim edildi",
      },
    ],
  });

  console.log(`✅ Created completed production tracking (all 7 stages)`);

  // 30. Create Quality Control for completed order
  await prisma.qualityControl.create({
    data: {
      productionId: completedProductionTracking.id,
      inspectorId: sedaUser!.id,
      checkDate: new Date("2025-09-16"),
      result: "PASSED",
      score: 98,
      notes: "Kusursuz kalite, tüm standartlar aşıldı",
      fabricDefects: false,
      sewingDefects: false,
      measureDefects: false,
      finishingDefects: false,
    },
  });

  console.log(`✅ Created quality control for completed order`);

  // 31. Create sample with all AI fields populated
  const sample4 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-00004",
      sampleType: "STANDARD",
      status: "COMPLETED",
      customerNote: "Premium kalite, dikkat detayları kontrol edin",
      manufacturerResponse: "Numune hazır, tüm detaylar kontrol edildi",
      productionDays: 8,
      estimatedProductionDate: new Date("2025-10-25"),
      actualProductionDate: new Date("2025-10-23"),
      shippingDate: new Date("2025-10-24"),
      deliveryAddress: "LC Waikiki Merkez Ofis, İstanbul",
      cargoTrackingNumber: "987654321",
      name: "Premium Erkek Tişört Numunesi",
      description: "Yüksek kaliteli Pima pamuktan yapılmış, minimalist tasarım",
      images: JSON.stringify(tshirtImages.slice(1, 3)),
      aiGenerated: false,
      collectionId: collection9.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  // Create AI Analysis for this sample
  await prisma.aIAnalysis.create({
    data: {
      sampleId: sample4.id,
      detectedProduct: "Premium Erkek Tişört",
      detectedColor: "Krem",
      detectedFabric: "Pima Pamuk",
      detectedPattern: "Solid",
      detectedGender: "MEN",
      detectedClassification: "Premium Casual",
      detectedAccessories: "Bone düğme, nakışlı etiket",
      technicalDescription:
        "Yüksek kaliteli Pima pamuktan üretilmiş, premium kalite dikişler",
      qualityAnalysis:
        "Mükemmel kumaş kalitesi, profesyonel dikiş, renk derinliği, UV stabiliyesi",
      qualityScore: 9.8,
      costAnalysis: "Pima pamuk premium segment'te, işçilik ve detaylar üstün",
      estimatedCostMin: 35.0,
      estimatedCostMax: 50.0,
      suggestedMinOrder: 200,
      trendAnalysis: "Premium casual trend, yüksek demand, dayanıklı trend",
      trendScore: 9.2,
      targetMarket:
        "Premium segment, 25-55 yaş, gelir seviyesi yüksek erkekler",
      salesPotential: "HIGH",
      designSuggestions: JSON.stringify({
        suggestions: [
          "Limited edition koleksiyonuna uygun",
          "Lüks mağazaları hedefle",
          "Premium pricing stratejisi",
        ],
        market: "Premium Retail",
        positioning: "Luxury Casual",
      }),
      designStyle: "Premium Minimalist",
      designFocus: JSON.stringify(["Quality", "Heritage", "Exclusivity"]),
    },
  });

  console.log(`✅ Created advanced sample with full AI analysis`);

  // 32. Create More User Favorites
  const defactoDesigner = await prisma.user.findUnique({
    where: { email: "ayse@defacto.com" },
  });

  if (defactoDesigner) {
    await prisma.userFavoriteCollection.createMany({
      data: [
        {
          userId: defactoDesigner.id,
          collectionId: collection9.id,
        },
        {
          userId: defactoDesigner.id,
          collectionId: collection10.id,
        },
      ],
    });
  }

  console.log(`✅ Created more user favorites`);

  // 33. Create More Messages for Communication
  const aliUser = await prisma.user.findUnique({
    where: { email: "ali@lcwaikiki.com" },
  });

  await prisma.message.createMany({
    data: [
      {
        content: "Üretim durumu hakkında güncellemeler var mı?",
        senderId: aliUser!.id,
        receiverId: canUser!.id,
        type: "direct",
        isRead: false,
        orderId: order1.id,
        companyId: lcwaikiki.id,
      },
      {
        content:
          "Evet, SEWING aşamasında %65 tamamlanmıştır. Kalite kontrole 2 gün kaldı.",
        senderId: canUser!.id,
        receiverId: aliUser!.id,
        type: "direct",
        isRead: false,
        orderId: order1.id,
        companyId: defacto.id,
      },
      {
        content:
          "Tasarım ekibi, yeni koleksiyon önerileri için gözden geçirme yapabilir mi?",
        senderId: lcwBuyingManager!.id,
        receiverId: defactoOwner.id,
        type: "direct",
        isRead: true,
      },
      {
        content:
          "Tasarımlarla ilgili sorunuz var mı? En kısa sürede cevaplayabilirim.",
        senderId: defactoOwner.id,
        receiverId: lcwBuyingManager!.id,
        type: "direct",
        isRead: true,
      },
    ],
  });

  console.log(`✅ Created 4 more direct messages`);

  // 34. Create Individual Customer (INDIVIDUAL_CUSTOMER role)
  const individualCustomer = await prisma.user.create({
    data: {
      firstName: "Derya",
      lastName: "Kaya",
      email: "derya.kaya@email.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      phone: "+90 532 999 8888",
      role: "INDIVIDUAL_CUSTOMER",
      isActive: true,
    },
  });

  console.log(`✅ Created individual customer: ${individualCustomer.email}`);

  // 35. Create sample with AI generated flag
  const sample5 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-00005",
      sampleType: "STANDARD",
      status: "AI_DESIGN",
      name: "AI Tasarım: Futuristik Erkek Tişört",
      description:
        "Yapay zeka tarafından oluşturulan tasarım, minimalist future stil",
      aiGenerated: true,
      aiPrompt:
        "modern minimalist futuristic mens tshirt design 2025 fashion trend sustainable",
      aiSketchUrl: "https://source.unsplash.com/800x600/?ai-design,minimalist",
      images: JSON.stringify(tshirtImages.slice(0, 2)),
      customerNote: "AI tasarımı beğendik, lütfen numunesi yapabilir misiniz?",
      customerId: individualCustomer.id,
      manufactureId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  console.log(`✅ Created AI generated sample`);

  // 36. Create Revision for Sample 5 (AI Design)
  await prisma.revision.create({
    data: {
      sampleId: sample5.id,
      revisionNumber: 1,
      requestMessage:
        "AI tasarımında renk paleti değiştirilsin: Siyah yerine Lacivert, Gri yerine Krem",
      status: "pending",
      requestedAt: new Date(),
    },
  });

  // 37. Create Order from Individual Customer
  const orderFromIndividual = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-INDIV-001",
      quantity: 50,
      unitPrice: 45.0,
      totalPrice: 2250.0,
      status: "PENDING",
      customerNote:
        "Bireysel müşteri olarak ilk siparişim. Kaliteli ürün arıyorum.",
      collectionId: collection1.id,
      customerId: individualCustomer.id,
      manufactureId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  console.log(`✅ Created order from individual customer`);

  // 38. Create Question from Individual Customer
  await prisma.question.create({
    data: {
      question: "Bu ürün hassas cilde uygun mu?",
      answer:
        "Evet, %100 organik pamuk, hypoallergenic, dermatolog tarafından test edilmiş",
      isAnswered: true,
      isPublic: true,
      collectionId: collection1.id,
      customerId: individualCustomer.id,
      manufactureId: defactoOwner.id,
    },
  });

  console.log(`✅ Created question from individual customer`);

  // 39. Create international customer orders (more diverse scenarios)
  const bangladeshCustomer = await prisma.user.create({
    data: {
      firstName: "Rana",
      lastName: "Khan",
      email: "rana.khan@international.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      role: "INDIVIDUAL_CUSTOMER",
      isActive: true,
      phone: "+880 1712 345678",
    },
  });

  const internationalOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-2025-INTL-001",
      quantity: 200,
      unitPrice: 38.0,
      totalPrice: 7600.0,
      status: "IN_PRODUCTION",
      customerNote: "Bangladesh'e ihraç için, kalite önemli",
      manufacturerResponse: "Onaylandı, üretim başladı",
      productionDays: 35,
      estimatedProductionDate: new Date("2025-11-10"),
      actualProductionStart: new Date("2025-10-15"),
      deliveryAddress: "Dhaka, Bangladesh",
      collectionId: collection5.id,
      customerId: bangladeshCustomer.id,
      manufactureId: defactoOwner.id,
      companyId: defacto.id,
    },
  });

  console.log(`✅ Created international customer and order`);

  // 40. Create Production Tracking for international order
  const internationalProductionTracking =
    await prisma.productionTracking.create({
      data: {
        orderId: internationalOrder.id,
        currentStage: "CUTTING",
        overallStatus: "IN_PROGRESS",
        progress: 45,
        estimatedStartDate: new Date("2025-10-15"),
        estimatedEndDate: new Date("2025-11-10"),
        actualStartDate: new Date("2025-10-15"),
        notes: "Uluslararası sipariş, standartlara uyum sağlanıyor",
        companyId: defacto.id,
      },
    });

  await prisma.productionStageUpdate.createMany({
    data: [
      {
        productionId: internationalProductionTracking.id,
        stage: "PLANNING",
        status: "COMPLETED",
        actualStartDate: new Date("2025-10-15"),
        actualEndDate: new Date("2025-10-16"),
        estimatedDays: 1,
        notes: "Uluslararası standartlar kontrol edildi",
      },
      {
        productionId: internationalProductionTracking.id,
        stage: "FABRIC",
        status: "COMPLETED",
        actualStartDate: new Date("2025-10-16"),
        actualEndDate: new Date("2025-10-20"),
        estimatedDays: 4,
        notes: "Kaliteli kumaş tedarik edildi",
      },
      {
        productionId: internationalProductionTracking.id,
        stage: "CUTTING",
        status: "IN_PROGRESS",
        actualStartDate: new Date("2025-10-20"),
        estimatedDays: 3,
        notes: "Kesim işlemi devam ediyor",
      },
    ],
  });

  console.log(`✅ Created international production tracking`);

  // 41. Create another manufacturer for comparison
  const thirdPartyManufacturer = await prisma.user.create({
    data: {
      firstName: "Mert",
      lastName: "Güneş",
      email: "mert@thirdparty.com",
      password: "$2a$10$k2rXCFgdmO84Vhkyb6trJ.oH6MYLf141uTPf81w04BImKVqDbBivi",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
      phone: "+90 532 777 6666",
    },
  });

  const thirdPartyCompany = await prisma.company.create({
    data: {
      name: "Üçüncü Taraf Üretim Ltd.",
      email: "info@thirdparty.com",
      phone: "+90 212 555 0003",
      address: "İzmir, Türkiye",
      website: "www.thirdparty.com",
      type: "MANUFACTURER",
      description: "Bölgesel tekstil üreticisi",
      ownerId: thirdPartyManufacturer.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: thirdPartyManufacturer.id },
    data: { companyId: thirdPartyCompany.id },
  });

  console.log(`✅ Created third-party manufacturer`);

  // 42. Create archived/rejected sample for testing filters
  const rejectedSample = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-REJECTED",
      sampleType: "STANDARD",
      status: "REJECTED",
      customerNote: "Kalite sorunu var, lütfen tekrar yap",
      manufacturerResponse: "Sorun tespit edildi, yenisi üretilecek",
      collectionId: collection2.id,
      customerId: lcwOwner.id,
      manufactureId: thirdPartyManufacturer.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created rejected sample for testing`);

  // 43. Create cancelled sample
  const cancelledSample = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-CANCELLED",
      sampleType: "CUSTOM",
      status: "CANCELLED",
      customerNote: "Sipariş iptal edildi, bu numunelere ihtiyaç yok",
      collectionId: collection3.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created cancelled sample for testing`);

  // 44. Create on-hold sample
  const onHoldSample = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-ON-HOLD",
      sampleType: "REVISION",
      status: "ON_HOLD",
      customerNote: "Müşteri onay bekleniyor",
      manufacturerResponse: "Hazır ama müşteriye bekletilmek isteniyor",
      collectionId: collection1.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created on-hold sample for testing`);

  // 45. Create more questions for Q&A testing
  await prisma.question.createMany({
    data: [
      {
        question: "Toplu sipariş için indirim var mı?",
        answer:
          "Evet, 1000+ adet için %15, 5000+ adet için %20 indirim veriyoruz",
        isAnswered: true,
        isPublic: true,
        collectionId: collection1.id,
        customerId: lcwOwner.id,
        manufactureId: defactoOwner.id,
      },
      {
        question: "Özel baskı (print) yapılabiliyor mu?",
        answer:
          "Evet, dijital baskı, transfermatik baskı, bordür işleme yapabiliyoruz",
        isAnswered: true,
        isPublic: true,
        collectionId: collection2.id,
        customerId: lcwOwner.id,
        manufactureId: defactoOwner.id,
      },
      {
        question: "Lead time ne kadar? (Acelesi var)",
        isAnswered: false,
        isPublic: true,
        collectionId: collection3.id,
        customerId: lcwOwner.id,
        manufactureId: defactoOwner.id,
      },
      {
        question: "Müşteri tanımlanmış renk olabilir mi?",
        isAnswered: false,
        isPublic: false, // Private question
        collectionId: collection1.id,
        customerId: lcwBuyingManager!.id,
        manufactureId: defactoOwner.id,
      },
    ],
  });

  console.log(
    `✅ Created 4 more Q&A items (2 public, 1 private, 1 unanswered)`
  );

  // 46. Create more diverse reviews
  await prisma.review.createMany({
    data: [
      {
        rating: 3,
        comment: "Ürün kalitesi iyidir ama üretim süresi uzun",
        isApproved: true,
        collectionId: collection1.id,
        customerId: bangladeshCustomer.id,
      },
      {
        rating: 2,
        comment: "Son sipariş bazı kusurlara sahip. Düzeltilmesi gerekiyor.",
        isApproved: true,
        collectionId: collection2.id,
        customerId: individualCustomer.id,
      },
      {
        rating: 5,
        comment:
          "Mükemmel hizmet, harika ürün, kesinlikle tekrar sipariş vereceğiz!",
        isApproved: false, // Pending approval
        collectionId: collection3.id,
        customerId: lcwProductionTracker!.id,
      },
    ],
  });

  console.log(`✅ Created diverse reviews (3, 2, 5 stars)`);

  // 47. Create Notifications for different users
  await prisma.notification.createMany({
    data: [
      {
        userId: individualCustomer.id,
        title: "Sipariş Alındı",
        message: "Siparişiniz (ORD-2025-INDIV-001) başarıyla alındı!",
        type: "ORDER",
        link: "/orders/individual",
        isRead: false,
        orderId: orderFromIndividual.id,
      },
      {
        userId: bangladeshCustomer.id,
        title: "Uluslararası Teslimat",
        message: "Siparişiniz Bangladesh'e gönderilmek üzere hazırlanıyor.",
        type: "ORDER",
        link: "/orders/international",
        isRead: false,
        orderId: internationalOrder.id,
      },
      {
        userId: thirdPartyManufacturer.id,
        title: "Yeni Sipariş",
        message: "LC Waikiki'den yeni bir sipariş var",
        type: "ORDER",
        link: "/orders/new",
        isRead: false,
      },
      {
        userId: defactoOwner.id,
        title: "Kalite Kontrol Gerekli",
        message: "Toplu sipariş için kalite kontrol gerekli",
        type: "QUALITY",
        link: "/quality/batch",
        isRead: false,
      },
    ],
  });

  console.log(`✅ Created notifications for different users`);

  // Get defacto employees for task assignment
  const defactoEmployeesList = await prisma.user.findMany({
    where: { companyId: defacto.id },
  });

  const ahmet = defactoEmployeesList.find((e) => e.firstName === "Ahmet");
  const mehmet = defactoEmployeesList.find((e) => e.firstName === "Mehmet");
  const zeynep = defactoEmployeesList.find((e) => e.firstName === "Zeynep");
  const can = defactoEmployeesList.find((e) => e.firstName === "Can");
  const ayse = defactoEmployeesList.find((e) => e.firstName === "Ayşe");

  // 47.5 Create comprehensive tasks for testing task management
  await prisma.task.createMany({
    data: [
      // Task 1: LC Waikiki sends sample request to Defacto
      {
        title: "Yeni Koleksiyon İçin Numune İsteği",
        description:
          "2025 Bahar/Yaz koleksiyonu için T-Shirt örnekleri istiyoruz",
        type: "STATUS_CHANGE",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: lcwOwner.id,
        assignedToId: defactoOwner.id,
        collectionId: collection1.id,
        notes: "Acil numune gerekli, 1 hafta içinde teslim istiyoruz",
      },
      // Task 2: Defacto responds to sample request
      {
        title: "Numune Talebine Yanıt Hazırla",
        description:
          "LC Waikiki'nin numune talebine detaylı teknik bilgi ve fiyat önerisi",
        type: "QUOTATION",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: ahmet?.id || defactoOwner.id,
        collectionId: collection1.id,
        notes: "Fiyat listesi ve teknik özellikler hazırlanıyor",
      },
      // Task 3: LC Waikiki reviews quotation
      {
        title: "Teklifi Gözden Geçir ve Onayla",
        description:
          "Defacto'dan gelen fiyat teklifini ve teknik özellikleri gözden geçir",
        type: "APPROVE_REJECT",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        userId: lcwOwner.id,
        assignedToId: lcwBuyingManager?.id || lcwOwner.id,
        collectionId: collection1.id,
        notes: "Fiyat ve kalite standartlarını kontrol et",
      },
      // Task 4: Material procurement
      {
        title: "Ham Madde Tedariki",
        description:
          "Üretim için gerekli iplik ve boyalı kumaşın tedarikini sağla",
        type: "MATERIAL",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: mehmet?.id || defactoOwner.id,
        collectionId: collection1.id,
        notes: "Kalite sertifikaları ile beraber teslimat yapılmalı",
      },
      // Task 5: Quality control
      {
        title: "Kalite Kontrol Prosesi",
        description: "Ham maddelerin kalite kontrolü ve uygunluk testleri",
        type: "QUALITY_CHECK",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: zeynep?.id || defactoOwner.id,
        collectionId: collection1.id,
        notes: "ISO standartlarına uygun test raporları hazırlanacak",
      },
      // Task 6: Shipment preparation
      {
        title: "Numune Gönderimi Hazırlığı",
        description: "Onaylanan numunelerin paketlenmesi ve sevkiyat belgeleri",
        type: "SHIPMENT",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: can?.id || defactoOwner.id,
        collectionId: collection1.id,
        notes: "DHL Express ile gönderilecek, tracking numarası gerekli",
      },
      // Task 7: Payment processing
      {
        title: "Ödeme İşlemi",
        description: "Numune üretimi ve gönderim maliyetinin ödenmesi",
        type: "PAYMENT",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        userId: lcwOwner.id,
        assignedToId: lcwBuyingManager?.id || lcwOwner.id,
        collectionId: collection1.id,
        notes: "Banka transferi ile ödeme yapılacak, referans numarası gerekli",
      },
      // Task 8: Completed task (historical)
      {
        title: "Ön Tasarım Onayı Tamamlandı",
        description: "Koleksiyon tasarımının temel onayı yapıldı",
        type: "DOCUMENT",
        status: "COMPLETED",
        priority: "HIGH",
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        userId: lcwOwner.id,
        assignedToId: lcwBuyingManager?.id || lcwOwner.id,
        collectionId: collection1.id,
        notes: "Tüm stakeholder'lar tarafından onaylandı",
      },
      // Task 9: Revision handling
      {
        title: "Revizyon İsteklerine Yanıt Ver",
        description: "Müşteri tarafından istenen tasarım değişikliklerini yap",
        type: "REVISION",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: mehmet?.id || defactoOwner.id,
        collectionId: collection2.id,
        notes: "Renk numunesinde ufak ayarlamalar gerekli",
      },
      // Task 10: Document submission
      {
        title: "Sertifika ve Belgeleri Gönder",
        description: "Üretim kalite sertifikaları, ürün güvenlik belgeleri",
        type: "DOCUMENT",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: ahmet?.id || defactoOwner.id,
        collectionId: collection1.id,
        notes: "ISO 9001, CE belgesi ve üretim raporları gerekli",
      },
      // Task 11: Export sample preparation
      {
        title: "İhraç Numunesi Hazırlama",
        description:
          "Uluslararası pazara gönderilecek numunelerin hazırlanması",
        type: "PRODUCTION_STAGE",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: ahmet?.id || defactoOwner.id,
        collectionId: collection3.id,
        notes: "Uluslararası standartlara uygun test yapılmalı",
      },
      // Task 12: Production review
      {
        title: "Üretim Başlangıcı Onayı",
        description: "Tüm hazırlıklar tamamlandı, üretim başlangıcı onaylaması",
        type: "PRODUCTION_STAGE",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: lcwOwner.id,
        assignedToId: lcwBuyingManager?.id || lcwOwner.id,
        collectionId: collection1.id,
        notes: "Final onay sonrası toplu üretim başlayacak",
      },
      // Task 13: Customer approval wait
      {
        title: "Müşteri Onayı Bekleniyor",
        description:
          "Nihai ürün örneğinin müşteri tarafından onaylanmasını bekle",
        type: "STATUS_CHANGE",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        userId: defactoOwner.id,
        assignedToId: ayse?.id || defactoOwner.id,
        collectionId: collection1.id,
        notes: "Müşteri onayını aldıktan sonra toplu üretim başlayacak",
      },
    ],
  });

  console.log(`✅ Created 13 comprehensive tasks for different workflows`);

  // 48. Create more messages for different communication scenarios
  await prisma.message.createMany({
    data: [
      {
        content:
          "Merhaba, deneme siparişim için teknikleri detaylı anlatabilir misiniz?",
        senderId: individualCustomer.id,
        receiverId: defactoOwner.id,
        type: "direct",
        isRead: false,
      },
      {
        content:
          "Tabii, tüm teknik detayları paylaşabilirim. Size email atayım mı?",
        senderId: defactoOwner.id,
        receiverId: individualCustomer.id,
        type: "direct",
        isRead: false,
      },
      {
        content:
          "Uluslararası siparişler için gümrük prosedürlerini açıklar mısınız?",
        senderId: bangladeshCustomer.id,
        receiverId: defactoOwner.id,
        type: "direct",
        isRead: false,
      },
      {
        content: "Acil numune talebim var, 3 gün içinde yapılabilir mi?",
        senderId: lcwBuyingManager!.id,
        receiverId: defactoOwner.id,
        type: "direct",
        isRead: true,
      },
      {
        content: "Evet, acil numune hizmeti var, ek maliyet olacak ama",
        senderId: defactoOwner.id,
        receiverId: lcwBuyingManager!.id,
        type: "direct",
        isRead: true,
      },
    ],
  });

  console.log(`✅ Created diverse direct messages`);

  // 49. Create samples with different stages for UI testing
  const stageSample1 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-STAGE-01",
      sampleType: "STANDARD",
      status: "PENDING_APPROVAL",
      customerNote: "Yeni tasarım, onay bekleniyor",
      collectionId: collection4.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const stageSample2 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-STAGE-02",
      sampleType: "STANDARD",
      status: "PATTERN_READY",
      customerNote: "Kalıp hazır, üretim başlamaya hazır",
      collectionId: collection5.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  const stageSample3 = await prisma.sample.create({
    data: {
      sampleNumber: "SMP-2025-STAGE-03",
      sampleType: "STANDARD",
      status: "QUALITY_CHECK",
      customerNote: "Son kalite kontrol aşamasında",
      collectionId: collection6.id,
      customerId: lcwOwner.id,
      manufactureId: defactoOwner.id,
      companyId: lcwaikiki.id,
    },
  });

  console.log(`✅ Created 3 samples with different stages`);

  // 50. Create User Favorite Collections for testing
  if (bangladeshCustomer) {
    await prisma.userFavoriteCollection.createMany({
      data: [
        {
          userId: bangladeshCustomer.id,
          collectionId: collection5.id,
        },
        {
          userId: bangladeshCustomer.id,
          collectionId: collection1.id,
        },
      ],
    });
  }

  if (individualCustomer) {
    await prisma.userFavoriteCollection.create({
      data: {
        userId: individualCustomer.id,
        collectionId: collection1.id,
      },
    });
  }

  console.log(`✅ Created user favorite collections for diverse users`);

  console.log(`

  ╔═══════════════════════════════════════════════════════════╗
  ║           🎉 DATABASE SEEDING TAMAMLANDI! 🎉              ║
  ╚═══════════════════════════════════════════════════════════╝

  📊 OLUŞTURULAN VERİLER:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👥 Kullanıcılar:          13+ (1 admin + 8 company + 4 individual)
  🏢 Firmalar:              3 (2 manufacturers + 1 buyer)
  📁 Kategoriler:           3 (Erkek/Kadın/Çocuk Giyim)
  📦 Koleksiyonlar:         10 (Çeşitli stillerde)
  🎨 Numuneler:             13 (9 farklı status)
  🛒 Siparişler:            7 (6 farklı status)
  🏭 Production Tracking:   3 (In Progress + Completed + International)
  ✅ Quality Reports:       3 (Passed + Conditional + Pending)
  🏗️  Atölyeler:            2 (Sewing + Packaging)
  💬 Mesajlar:              12+ (Direct + Company)
  ❓ Sorular:               8 (4 cevaplanmış, 3 cevapsız, 1 özel)
  ⭐ Değerlendirmeler:      8 (2-5 yıldız, pending ones)

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔐 TEST HESAPLARI:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👨‍💼 PLATFORM ADMIN:
     📧 Email:    admin@platform.com
     🔑 Password: myPassword42
     🎯 Yetkiler: Tüm sisteme erişim

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🏭 DEFACTO TEKSTİL A.Ş. (ÜRETİCİ FİRMA):

     👔 Firma Sahibi:
        📧 ahmet@defacto.com
        🔑 random42
        👤 Ahmet Yılmaz
        📞 +90 532 123 4567
        🎯 Tüm firma yetkilerine sahip

     👥 Çalışanlar:

        📦 Koleksiyon Yöneticisi
           👤 Ayşe Demir
           📧 ayse@defacto.com
           🔑 random42
           🏢 Tasarım Departmanı
           ✅ Koleksiyon oluştur, düzenle, sil

        🧪 Numune Takip Uzmanı
           👤 Mehmet Kaya
           📧 mehmet@defacto.com
           🔑 random42
           🏢 Numune Departmanı
           ✅ Numune durum güncelle, yanıt ver

        📋 Sipariş Yöneticisi
           👤 Zeynep Arslan
           📧 zeynep@defacto.com
           🔑 random42
           🏢 Satış Departmanı
           ✅ Teklif gönder, sipariş yönet

        🏭 Üretim Takip Elemanı
           👤 Can Özdemir
           📧 can@defacto.com
           🔑 random42
           🏢 Üretim Departmanı
           ✅ Üretim aşamaları güncelle, atölye ata

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🛒 LC WAİKİKİ MAĞAZACILIK A.Ş. (MÜŞTERİ FİRMA):

     👔 Firma Sahibi:
        📧 fatma@lcwaikiki.com
        🔑 iLikeTurtles42
        👤 Fatma Şahin
        📞 +90 532 111 2222
        🎯 Tüm firma yetkilerine sahip

     👥 Çalışanlar:

        💼 Satın Alma Müdürü
           👤 Hasan Demir
           📧 hasan@lcwaikiki.com
           🔑 iLikeTurtles42
           🏢 Satın Alma Departmanı
           ✅ Numune/Sipariş oluştur, onayla

        📊 Üretim Takip Uzmanı
           👤 Ali Kara
           📧 ali@lcwaikiki.com
           🔑 iLikeTurtles42
           🏢 Üretim Takip Departmanı
           ✅ Üretim izle, revize talep et

        ✅ Kalite Kontrol Uzmanı
           👤 Seda Yılmaz
           📧 seda@lcwaikiki.com
           🔑 iLikeTurtles42
           🏢 Kalite Kontrol Departmanı
           ✅ Kalite raporları görüntüle, yorum yap

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 ÖRNEK VERİLER:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📁 Koleksiyonlar:
     1. Yaz 2025 Erkek Tişört (₺45, 1000 adet stok)
     2. Sonbahar 2025 Kadın Bluz (₺89, 500 adet stok)
     3. İlkbahar 2025 Unisex Sweatshirt (₺120, 750 adet stok)

  🎨 Numuneler:
     • SMP-2025-00001: COMPLETED (Standard, kargoya verildi)
     • SMP-2025-00002: IN_PRODUCTION (Revision, beden/renk değişikliği)
     • SMP-2025-00003: IN_DESIGN (Custom, özel tasarım)

  🛒 Siparişler:
     • ORD-2025-00001: IN_PRODUCTION (500 adet, ₺21,000)
       └─ Production: %65 tamamlandı, SEWING aşamasında
     • ORD-2025-00002: QUOTE_SENT (300 adet, ₺25,500)
     • ORD-2025-00003: CONFIRMED (1000 adet, ₺115,000)

  🏭 Üretim Takip:
     • 7 Aşamalı timeline
     • 3 aşama tamamlandı (Planning, Fabric, Cutting)
     • 1 aşama devam ediyor (Sewing - %65)
     • 3 aşama bekliyor (Quality, Packaging, Shipping)
     • 2 Kalite kontrol raporu
     • 2 Atölye ataması

  💬 Mesajlar:
     • 3 mesaj (1 okundu, 2 okunmadı)
     • Direct ve company mesajları

  ❓ Soru-Cevap:
     • 2 cevaplanmış soru (organik pamuk, minimum sipariş)
     • 1 bekleyen soru (renk seçenekleri)

  ⭐ Değerlendirmeler:
     • 2 onaylanmış review (5⭐ ve 4⭐)
     • 1 onay bekleyen review (5⭐)

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🎯 KAPSAMLI TEST SENARYOLARI:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👨‍💼 ADMIN TESTS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1️⃣  admin@platform.com / myPassword42
     ✅ Tüm dashboard'ları görüntüle
     ✅ Tüm firmaları/kullanıcıları yönet
     ✅ Sistem istatistiklerini görüntüle

  🏭 MANUFACTURER (DEFACTO) TESTS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  2️⃣  ahmet@defacto.com / random42 (Firma Sahibi)
     ✅ Koleksiyonlar: Oluştur, Düzenle, Yayınla, Sil
     ✅ Numuneleri yönet (6 farklı status görebilir)
     ✅ Siparişleri görüntüle ve yanıt ver
     ✅ Tüm firma verilerine erişim

  3️⃣  ayse@defacto.com / random42 (Koleksiyon Yöneticisi)
     ✅ Koleksiyonları oluştur/düzenle
     ✅ Kategorileri yönet
     ✅ Numuneleri görüntüle

  4️⃣  mehmet@defacto.com / random42 (Numune Takip Uzmanı)
     ✅ Numune durumlarını güncelle
     ✅ Müşterilere yanıt ver
     ✅ Numune üretim geçmişini takip et

  5️⃣  zeynep@defacto.com / random42 (Sipariş Yöneticisi)
     ✅ Siparişleri görüntüle ve onayla
     ✅ Fiyat teklifleri gönder
     ✅ Müşteri mesajlarına yanıt ver

  6️⃣  can@defacto.com / random42 (Üretim Takip Elemanı)
     ✅ Production tracking'i güncelle
     ✅ Üretim aşamalarını takip et
     ✅ Atölyeleri atayın ve yönet

  🛒 BUYER (LC WAİKİKİ) TESTS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  7️⃣  fatma@lcwaikiki.com / iLikeTurtles42 (Firma Sahibi)
     ✅ Numune talep et (5+ üretici seçeneği)
     ✅ Siparişler oluştur ve onayla
     ✅ Tüm sipariş/numune verilerine erişim

  8️⃣  hasan@lcwaikiki.com / iLikeTurtles42 (Satın Alma Müdürü)
     ✅ Numuneleri görüntüle ve onayla
     ✅ Siparişleri oluştur (farklı üreticilerden)
     ✅ Fiyat tekliflerini karşılaştır

  9️⃣  ali@lcwaikiki.com / iLikeTurtles42 (Üretim Takip Uzmanı)
     ✅ Production timeline'ı izle
     ✅ Revizyon talep et
     ✅ Üretim problemlerini raporla

  🔟 seda@lcwaikiki.com / iLikeTurtles42 (Kalite Kontrol Uzmanı)
     ✅ Kalite kontrol raporlarını görüntüle
     ✅ Kalite skoru değerlendir
     ✅ Kontrol notları ekle

  👤 BİREYSEL MÜŞTERİ TESTS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1️⃣1️⃣ derya.kaya@email.com / random42
     ✅ Numune talep et (AI tasarım seçeneği)
     ✅ Küçük sipariş ver (50 adet)
     ✅ Soru sor (Hasas cilt / ürün özellikleri)
     ✅ Yorum ve değerlendirme yap

  🌍 ULUSLARARASI MÜŞTERİ TESTS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1️⃣2️⃣ rana.khan@international.com / random42
     ✅ Bangladesh'e ihraç siparişi ver (200 adet)
     ✅ Production tracking'i izle
     ✅ Gümrük prosedürü sorular sor
     ✅ Koleksiyonları beğenilere ekle

  🔄 BAŞKA ÜRETICI TESTS:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1️⃣3️⃣ mert@thirdparty.com / random42 (Üçüncü Üretici)
     ✅ Kendi koleksiyonlarını oluştur
     ✅ Diğer üreticilerin siparişlerini görüntüle
     ✅ Kalite kontrol raporlarını gözle

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🧪 SAMPLE STATUS TEST SENARYO:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  SMP-2025-00001: COMPLETED ✅
     → Kargoya verildi, müşteri tarafında
     → Testimonial eklebilir

  SMP-2025-00002: IN_PRODUCTION 🔨
     → Revize talep (beden + renk değişikliği)
     → Timeline'ı izle

  SMP-2025-00003: IN_DESIGN 🎨
     → Özel tasarım, ilk aşamada
     → Tasarım değişiklikleri talep et

  SMP-2025-00004: AI_DESIGN 🤖
     → Yapay zeka tarafından oluşturulmuş
     → Revision talep et

  SMP-2025-00005: PENDING_APPROVAL ⏳
     → Üretici onayı bekleniyor

  SMP-2025-00006: PATTERN_READY 📋
     → Kalıp hazır, üretim başlamaya hazır

  SMP-2025-00007: QUALITY_CHECK ✔️
     → Son kalite kontrol aşamasında

  SMP-2025-REJECTED: REJECTED ❌
     → Kalite sorunlu, reddedildi
     → Yeni numune talebinde bulunabilir

  SMP-2025-CANCELLED: CANCELLED 🚫
     → Müşteri tarafından iptal edildi

  SMP-2025-ON-HOLD: ON_HOLD ⏸️
     → Geçici olarak bekleme listesinde

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📦 ORDER STATUS TEST SENARYO:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ORD-2025-00001: IN_PRODUCTION 🔨
     → %65 tamamlandı, SEWING aşamasında
     → Production tracking visible

  ORD-2025-00002: QUOTE_SENT 📋
     → Fiyat teklifi bekleniyor
     → Müşteri tarafından onayla/reddet

  ORD-2025-00003: CONFIRMED ✅
     → Büyük sipariş, onaylanmış
     → Üretim planlanıyor

  ORD-2025-00004: PENDING ⏳
     → Yüksek hacim, müşteri onayı bekleniyor

  ORD-2025-00005: DELIVERED 📦
     → Tamamlandı ve teslimat yapıldı
     → Review yapabilir

  ORD-2025-INDIV-001: PENDING ⏳
     → Bireysel müşteri sipariş
     → Onay ve fiyat bekleniyor

  ORD-2025-INTL-001: IN_PRODUCTION 🌍
     → Uluslararası sipariş
     → Bangladesh'e ihraç

  ORD-2025-00006: CANCELLED 🚫
     → Müşteri tarafından iptal edildi

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🚀 TÜM UI COMPONENT'LERİ TEST EDİLEBİLİR!
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Dashboard (Grafikler, KPI'lar, Activity)
  ✅ Collections (10 koleksiyon, CRUD, filtreleme)
  ✅ Samples (13 numune, 9 farklı status, timeline)
  ✅ Orders (7 sipariş, 6 farklı status, detaylar)
  ✅ Production (3 tracking, 7 aşama, timeline)
  ✅ Quality (3 rapor, inspection form, scoring)
  ✅ Messages (12+ mesaj, direct + company)
  ✅ Q&A (8 soru, cevaplı/cevapsız, özel sorular)
  ✅ Reviews (8 değerlendirme, 2-5 yıldız, onay sistemi)
  ✅ Notifications (16+ bildirim, farklı tipte)
  ✅ Favorites (Beğenilere ekleme/çıkarma)
  ✅ Filters & Search (Statüs, tarih, firma, user)

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 ROLE & PERMISSION TEST CHECKLIST:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Admin Panel Erişimi
  ✅ Company Owner Yetkiler
  ✅ Company Employee Yetkiler (Department bazlı)
  ✅ Individual Customer Yetkiler
  ✅ View/Create/Edit/Delete Kontrolleri
  ✅ Department & JobTitle Filtrelemeleri

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

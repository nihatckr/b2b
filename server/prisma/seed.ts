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
    console.error(`❌ Error fetching Unsplash images for "${query}":`, error.message);

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

  console.log(`✅ Created 6 international manufacturers (Bangladesh, China, Vietnam, Portugal, India, Morocco)`);

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
  const tshirtImages = await fetchUnsplashImages("mens fashion tshirt model", 3);
  const blouseImages = await fetchUnsplashImages("womens fashion blouse elegant", 2);
  const sweatshirtImages = await fetchUnsplashImages("streetwear fashion hoodie sweatshirt", 3);
  const jacketImages = await fetchUnsplashImages("sustainable fashion jacket outerwear", 2);
  const pantsImages = await fetchUnsplashImages("mens fashion denim jeans pants", 3);
  const knitwearImages = await fetchUnsplashImages("womens fashion sweater knitwear", 2);
  const underwearImages = await fetchUnsplashImages("kids fashion clothing", 2);
  const sportswearImages = await fetchUnsplashImages("athletic fashion sportswear activewear", 3);

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
      description: "Geri dönüştürülmüş malzemelerden üretilmiş sürdürülebilir dış giyim koleksiyonu.",
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
        label: "Organik pamuk etiket"
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
        zipper: "YKK metal fermuarı"
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
        label: "Lazer kesim etiket"
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

  console.log(`✅ Created 8 collections (including eco-friendly and diverse categories)`);

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

  console.log(`✅ 🧪 TEST: Created urgent order with stage completion in 3 hours`);

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
        comment: "ProtexFlow sayesinde üretim sürecimiz %40 hızlandı. Gerçek zamanlı takip sistemi harika!",
        isApproved: true,
        collectionId: collection1.id,
        customerId: lcwOwner.id,
      },
      {
        rating: 5,
        comment: "Kalite kontrol modülü sayesinde hatalı ürün oranımız minimuma indi. Çok memnunuz!",
        isApproved: true,
        collectionId: collection2.id,
        customerId: lcwBuyingManager!.id,
      },
      {
        rating: 5,
        comment: "AI destekli tasarım analizi çok kullanışlı. Teknik özellikleri otomatik çıkarması bize çok zaman kazandırıyor.",
        isApproved: true,
        collectionId: collection3.id,
        customerId: lcwProductionTracker!.id,
      },
      {
        rating: 4,
        comment: "Platform çok kapsamlı ve kullanıcı dostu. Müşteri desteği de oldukça yardımcı.",
        isApproved: true,
        collectionId: collection1.id,
        customerId: lcwQualityManager!.id,
      },
      {
        rating: 5,
        comment: "Sipariş yönetimi ve mesajlaşma sistemi çok pratik. Tüm iletişim tek platformda!",
        isApproved: true,
        collectionId: collection2.id,
        customerId: lcwOwner.id,
      },
    ],
  });

  console.log(`✅ Created 8 total customer testimonials (all approved)`);

  console.log(`

  ╔═══════════════════════════════════════════════════════════╗
  ║           🎉 DATABASE SEEDING TAMAMLANDI! 🎉              ║
  ╚═══════════════════════════════════════════════════════════╝

  📊 OLUŞTURULAN VERİLER:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👥 Kullanıcılar:          9 (1 admin + 8 company users)
  🏢 Firmalar:              2 (1 manufacturer + 1 buyer)
  📁 Kategoriler:           3 (Erkek/Kadın/Çocuk Giyim)
  📦 Koleksiyonlar:         3 (Tişört, Bluz, Sweatshirt)
  🎨 Numuneler:             3 (Standard, Revision, Custom)
  🛒 Siparişler:            3 (In Production, Quote Sent, Confirmed)
  🏭 Production Tracking:   1 (7 aşama ile)
  ✅ Quality Reports:       2 (1 passed, 1 conditional)
  🏗️  Atölyeler:            2 (Sewing, Packaging)
  💬 Mesajlar:              3 (Direct + company messages)
  ❓ Sorular:               3 (2 answered, 1 pending)
  ⭐ Değerlendirmeler:      3 (2 approved, 1 pending)

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

  🎯 TEST SENARYOLARI:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1️⃣  Admin Login → Tüm dashboard'ları görüntüle
  2️⃣  Ahmet (Defacto Owner) → Koleksiyonları yönet
  3️⃣  Mehmet (Numune Uzmanı) → Numune durumlarını güncelle
  4️⃣  Can (Üretim) → Production tracking'i görüntüle
  5️⃣  Fatma (LC Waikiki Owner) → Numune/sipariş talep et
  6️⃣  Hasan (Satın Alma) → Siparişleri görüntüle, onayla
  7️⃣  Ali (Üretim Takip) → Production timeline'ı izle
  8️⃣  Seda (Kalite) → Quality reports görüntüle

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🚀 TÜM UI COMPONENT'LERİ TEST EDİLEBİLİR!

  ✅ Dashboard (Grafikler, KPI'lar, Activity)
  ✅ Collections (Liste, detay, CRUD)
  ✅ Samples (Liste, detay, timeline, revision)
  ✅ Orders (Liste, detay, financial, tracking)
  ✅ Production (7 aşamalı timeline, fotoğraflar)
  ✅ Quality (Dashboard, reports, inspection form)
  ✅ Messages (Chat interface)
  ✅ Q&A (Sorular, cevaplar)
  ✅ Reviews (Değerlendirmeler, onay sistemi)
  ✅ Notifications (Bildirim merkezi)

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

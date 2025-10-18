import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Temizleniyor: Mevcut kullanıcılar ve şirketler...");
  // Foreign key constraints nedeniyle önce company'leri sil
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Temizlik tamamlandı\n");

  console.log("👥 Kullanıcılar oluşturuluyor...\n");

  // 1. ADMIN
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@platform.com",
      name: "Admin Platform",
      password: await hash("myPassword42", 10),
      phone: "+90 532 000 0000",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin: admin@platform.com / myPassword42");

  // 2. DEFACTO - Firma Sahibi
  const defactoOwner = await prisma.user.create({
    data: {
      email: "ahmet@defacto.com",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      password: await hash("random42", 10),
      phone: "+90 532 123 4567",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const defactoCompany = await prisma.company.create({
    data: {
      name: "Defacto Tekstil A.Ş.",
      email: "info@defacto.com",
      phone: "+90 212 555 0001",
      address: "İstanbul, Türkiye",
      location: "Istanbul",
      website: "www.defacto.com",
      type: "MANUFACTURER",
      description: "Türkiye'nin önde gelen tekstil üreticisi",
      ownerId: defactoOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: defactoOwner.id },
    data: { companyId: defactoCompany.id },
  });
  console.log("✅ Defacto Sahibi: ahmet@defacto.com / random42");

  // 3-6. DEFACTO - Çalışanlar
  const defactoEmployees = [
    {
      email: "ayse@defacto.com",
      firstName: "Ayşe",
      lastName: "Demir",
      department: "Design",
      jobTitle: "Koleksiyon Yöneticisi",
    },
    {
      email: "mehmet@defacto.com",
      firstName: "Mehmet",
      lastName: "Kaya",
      department: "Sample",
      jobTitle: "Numune Takip Uzmanı",
    },
    {
      email: "zeynep@defacto.com",
      firstName: "Zeynep",
      lastName: "Arslan",
      department: "Sales",
      jobTitle: "Sipariş Yöneticisi",
    },
    {
      email: "can@defacto.com",
      firstName: "Can",
      lastName: "Özdemir",
      department: "Production",
      jobTitle: "Üretim Takip Elemanı",
    },
  ];

  for (const emp of defactoEmployees) {
    await prisma.user.create({
      data: {
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        password: await hash("random42", 10),
        phone: "+90 532 111 1111",
        role: "COMPANY_EMPLOYEE",
        companyId: defactoCompany.id,
        department: emp.department,
        jobTitle: emp.jobTitle,
        isActive: true,
      },
    });
    console.log(`✅ Defacto Çalışanı: ${emp.email} / random42`);
  }

  // 7. LC WAIKIKI - Firma Sahibi
  const lcOwner = await prisma.user.create({
    data: {
      email: "fatma@lcwaikiki.com",
      firstName: "Fatma",
      lastName: "Şahin",
      password: await hash("iLikeTurtles42", 10),
      phone: "+90 532 111 2222",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const lcCompany = await prisma.company.create({
    data: {
      name: "LC Waikiki Mağazacılık A.Ş.",
      email: "info@lcwaikiki.com",
      phone: "+90 212 555 0002",
      address: "İstanbul, Türkiye",
      location: "Istanbul",
      website: "www.lcwaikiki.com",
      type: "BUYER",
      description: "Türkiye'nin halka açık tekstil perakendecisi",
      ownerId: lcOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: lcOwner.id },
    data: { companyId: lcCompany.id },
  });
  console.log("✅ LC Waikiki Sahibi: fatma@lcwaikiki.com / iLikeTurtles42");

  // 8-10. LC WAIKIKI - Çalışanlar
  const lcEmployees = [
    {
      email: "hasan@lcwaikiki.com",
      firstName: "Hasan",
      lastName: "Demir",
      department: "Procurement",
      jobTitle: "Satın Alma Müdürü",
    },
    {
      email: "ali@lcwaikiki.com",
      firstName: "Ali",
      lastName: "Kara",
      department: "Production",
      jobTitle: "Üretim Takip Uzmanı",
    },
    {
      email: "seda@lcwaikiki.com",
      firstName: "Seda",
      lastName: "Yılmaz",
      department: "Quality",
      jobTitle: "Kalite Kontrol Uzmanı",
    },
  ];

  for (const emp of lcEmployees) {
    await prisma.user.create({
      data: {
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        password: await hash("iLikeTurtles42", 10),
        phone: "+90 532 111 2222",
        role: "COMPANY_EMPLOYEE",
        companyId: lcCompany.id,
        department: emp.department,
        jobTitle: emp.jobTitle,
        isActive: true,
      },
    });
    console.log(`✅ LC Waikiki Çalışanı: ${emp.email} / iLikeTurtles42`);
  }

  // 11. Bireysel Müşteri 1
  await prisma.user.create({
    data: {
      email: "derya.kaya@email.com",
      firstName: "Derya",
      lastName: "Kaya",
      password: await hash("random42", 10),
      phone: "+90 532 222 3333",
      role: "INDIVIDUAL_CUSTOMER",
      isActive: true,
    },
  });
  console.log("✅ Bireysel Müşteri: derya.kaya@email.com / random42");

  // 12. Uluslararası Müşteri
  await prisma.user.create({
    data: {
      email: "rana.khan@international.com",
      firstName: "Rana",
      lastName: "Khan",
      password: await hash("random42", 10),
      phone: "+880 1234 567890",
      role: "INDIVIDUAL_CUSTOMER",
      isActive: true,
    },
  });
  console.log(
    "✅ Uluslararası Müşteri: rana.khan@international.com / random42"
  );

  // 13. Üçüncü Üretici
  const thirdPartyOwner = await prisma.user.create({
    data: {
      email: "mert@thirdparty.com",
      firstName: "Mert",
      lastName: "Şahin",
      password: await hash("random42", 10),
      phone: "+90 532 444 5555",
      role: "COMPANY_OWNER",
      isCompanyOwner: true,
      isActive: true,
    },
  });

  const thirdPartyCompany = await prisma.company.create({
    data: {
      name: "Third Party Manufacturing Ltd.",
      email: "info@thirdparty.com",
      phone: "+90 232 555 0003",
      address: "İzmir, Türkiye",
      location: "Izmir",
      type: "MANUFACTURER",
      description: "Temel üretim ortağı",
      ownerId: thirdPartyOwner.id,
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: thirdPartyOwner.id },
    data: { companyId: thirdPartyCompany.id },
  });
  console.log("✅ Third Party Sahibi: mert@thirdparty.com / random42");

  // 14-16. Uluslararası Üreticiler
  const internationalManufacturers = [
    {
      email: "ahmed@bangladesh-tex.com",
      firstName: "Ahmed",
      lastName: "Hassan",
      company: "Bangladesh Textiles Co.",
      country: "BD",
      city: "Dhaka",
    },
    {
      email: "wei@china-factory.com",
      firstName: "Wei",
      lastName: "Chen",
      company: "China Factory Group",
      country: "CN",
      city: "Shanghai",
    },
    {
      email: "nguyen@vietnam-tex.com",
      firstName: "Nguyen",
      lastName: "Van",
      company: "Vietnam Textile Export",
      country: "VN",
      city: "Ho Chi Minh",
    },
  ];

  for (const mfg of internationalManufacturers) {
    const mfgOwner = await prisma.user.create({
      data: {
        email: mfg.email,
        firstName: mfg.firstName,
        lastName: mfg.lastName,
        password: await hash("random42", 10),
        phone: "+880 1234 567890",
        role: "COMPANY_OWNER",
        isCompanyOwner: true,
        isActive: true,
      },
    });

    const mfgCompany = await prisma.company.create({
      data: {
        name: mfg.company,
        email: `info@${mfg.company.toLowerCase().replace(/\s+/g, "-")}.com`,
        type: "MANUFACTURER",
        description: `${mfg.country} tabanlı üretim ortağı`,
        location: mfg.city,
        ownerId: mfgOwner.id,
        isActive: true,
      },
    });

    await prisma.user.update({
      where: { id: mfgOwner.id },
      data: { companyId: mfgCompany.id },
    });

    console.log(`✅ Uluslararası Üretici: ${mfg.email} / random42`);
  }

  // 15. Defacto için Color Library Ekle
  const colors = await prisma.color.createMany({
    data: [
      {
        name: "Beyaz",
        code: "PANTONE 11-0605",
        hexCode: "#FFFFFF",
        companyId: defactoCompany.id,
      },
      {
        name: "Siyah",
        code: "PANTONE 19-0303",
        hexCode: "#000000",
        companyId: defactoCompany.id,
      },
      {
        name: "Mavi",
        code: "PANTONE 17-4034",
        hexCode: "#0066FF",
        companyId: defactoCompany.id,
      },
      {
        name: "Beige",
        code: "PANTONE 12-0604",
        hexCode: "#F5F5DC",
        companyId: defactoCompany.id,
      },
    ],
  });
  console.log("✅ 4 Renk Library'ye eklendi");

  // 16. Defacto için Fabric Library Ekle
  const fabrics = await prisma.fabric.createMany({
    data: [
      {
        name: "Premium Cotton",
        code: "FAB-COTTON-001",
        composition: "%100 Pamuk",
        weight: 200,
        width: 150,
        supplier: "Turkish Cotton Mills",
        price: 5.5,
        minOrder: 500,
        leadTime: 14,
        companyId: defactoCompany.id,
      },
      {
        name: "Cotton Blend",
        code: "FAB-BLEND-001",
        composition: "80% Cotton 20% Polyester",
        weight: 180,
        width: 150,
        supplier: "European Textiles",
        price: 4.8,
        minOrder: 1000,
        leadTime: 21,
        companyId: defactoCompany.id,
      },
    ],
  });
  console.log("✅ 2 Kumaş Library'ye eklendi");

  // 17. Defacto için Season Library Ekle
  const seasons = await prisma.seasonItem.createMany({
    data: [
      {
        name: "SS25",
        fullName: "Spring/Summer 2025",
        year: 2025,
        type: "SS",
        companyId: defactoCompany.id,
      },
      {
        name: "FW25",
        fullName: "Fall/Winter 2025",
        year: 2025,
        type: "FW",
        companyId: defactoCompany.id,
      },
    ],
  });
  console.log("✅ 2 Sezon Library'ye eklendi");

  // 18. Defacto için Fit Library Ekle
  const fits = await prisma.fitItem.createMany({
    data: [
      {
        name: "Slim Fit",
        code: "FIT-SLIM",
        category: "UPPER",
        description: "Vücuda uygun dar kesim",
        companyId: defactoCompany.id,
      },
      {
        name: "Regular Fit",
        code: "FIT-REG",
        category: "UPPER",
        description: "Standart rahat kesim",
        companyId: defactoCompany.id,
      },
      {
        name: "Relaxed Fit",
        code: "FIT-RELAX",
        category: "UPPER",
        description: "Çok rahat, bol kesim",
        companyId: defactoCompany.id,
      },
    ],
  });
  console.log("✅ 3 Fit Library'ye eklendi");

  // 19. Defacto için Size Group Ekle
  const sizeGroups = await prisma.sizeGroup.createMany({
    data: [
      {
        name: "Kadın Standart",
        category: "WOMEN",
        sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
        companyId: defactoCompany.id,
      },
      {
        name: "Erkek Standart",
        category: "MEN",
        sizes: JSON.stringify(["S", "M", "L", "XL", "XXL", "3XL"]),
        companyId: defactoCompany.id,
      },
    ],
  });
  console.log("✅ 2 Size Group Library'ye eklendi");

  // 20. Defacto için Certification Ekle
  const certifications = await prisma.certification.createMany({
    data: [
      {
        name: "GOTS",
        code: "GOTS-2023",
        category: "FIBER",
        issuer: "GOTS International",
        certificateNumber: "GOTS-DEF-2025-001",
        description: "Global Organic Textile Standard sertifikası",
        companyId: defactoCompany.id,
      },
      {
        name: "OEKO-TEX Standard 100",
        code: "OEKO-100",
        category: "CHEMICAL",
        issuer: "OEKO-TEX",
        certificateNumber: "OEKO-DEF-2025-001",
        description: "Kimyasal açıdan güvenli tekstil sertifikası",
        companyId: defactoCompany.id,
      },
    ],
  });
  console.log("✅ 2 Sertifika Library'ye eklendi");

  // 17. Defacto için Kategori Oluştur
  const defactoCategory = await prisma.category.create({
    data: {
      name: "Gömlek",
      description: "Erkek ve kadın gömlekleri",
      authorId: defactoOwner.id,
      companyId: defactoCompany.id,
    },
  });
  console.log("✅ Koleksiyon Kategorisi: Gömlek");

  // 18. Defacto için Koleksiyon Oluştur
  const defactoCollection1 = await prisma.collection.create({
    data: {
      name: "Premium Comfort - SS25",
      description:
        "Yaz sezonunda kullanılacak premium kalite gömlek koleksiyonu",
      modelCode: "DEF-SS25-001",
      season: "SS25",
      gender: "WOMEN",
      fit: "Relaxed",
      trend: "Minimalist",
      colors: JSON.stringify(["Beyaz", "Siyah", "Mavi", "Beige"]),
      sizeGroups: JSON.stringify([1, 2, 3]),
      fabricComposition: "%100 Cotton",
      accessories: JSON.stringify({
        buttons: "Seramik",
        zipper: "YKK",
        labels: "Dokuma",
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80",
        "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&q=80",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
      ]),
      moq: 500,
      targetPrice: 15.5,
      targetLeadTime: 21,
      notes: "Premium kalite, ihraç standarında üretim",
      price: 15.5,
      stock: 2500,
      isActive: true,
      isFeatured: true,
      slug: "premium-comfort-ss25",
      productionSchedule: JSON.stringify({
        PLANNING: 3,
        FABRIC: 2,
        CUTTING: 2,
        SEWING: 7,
        QUALITY: 2,
        PACKAGING: 2,
        SHIPPING: 1,
      }),
      categoryId: defactoCategory.id,
      authorId: defactoOwner.id,
      companyId: defactoCompany.id,
    },
  });
  console.log("✅ Koleksiyon 1: " + defactoCollection1.name);

  const defactoCollection2 = await prisma.collection.create({
    data: {
      name: "Urban Casual Denim",
      description: "Modern şehir yaşamı için rahat denim koleksiyonu",
      modelCode: "DEF-SS25-002",
      season: "SS25",
      gender: "UNISEX",
      fit: "Regular",
      trend: "Casual",
      colors: JSON.stringify(["Mavi", "Siyah", "Beyaz"]),
      sizeGroups: JSON.stringify([1, 2]),
      fabricComposition: "98% Cotton, 2% Elastane",
      accessories: JSON.stringify({
        buttons: "Metal",
        zipper: "YKK",
        rivets: "Bakır",
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
        "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80",
        "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&q=80",
      ]),
      moq: 1000,
      targetPrice: 25.0,
      targetLeadTime: 28,
      notes: "Stretch denim, konforu maksimum",
      price: 25.0,
      stock: 3000,
      isActive: true,
      isFeatured: true,
      slug: "urban-casual-denim",
      productionSchedule: JSON.stringify({
        PLANNING: 3,
        FABRIC: 3,
        CUTTING: 2,
        SEWING: 10,
        QUALITY: 3,
        PACKAGING: 2,
        SHIPPING: 2,
      }),
      categoryId: defactoCategory.id,
      authorId: defactoOwner.id,
      companyId: defactoCompany.id,
    },
  });
  console.log("✅ Koleksiyon 2: " + defactoCollection2.name);

  const defactoCollection3 = await prisma.collection.create({
    data: {
      name: "Summer Breeze Collection",
      description: "Hafif ve havadar yaz elbiseleri",
      modelCode: "DEF-SS25-003",
      season: "SS25",
      gender: "WOMEN",
      fit: "Slim Fit",
      trend: "Bohemian",
      colors: JSON.stringify(["Beyaz", "Beige", "Mavi"]),
      sizeGroups: JSON.stringify([1]),
      fabricComposition: "100% Linen",
      accessories: JSON.stringify({
        buttons: "Ahşap",
        labels: "Dokuma",
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
      ]),
      moq: 300,
      targetPrice: 32.0,
      targetLeadTime: 25,
      notes: "Doğal keten kumaş, eco-friendly",
      price: 32.0,
      stock: 1500,
      isActive: true,
      isFeatured: false,
      slug: "summer-breeze-collection",
      productionSchedule: JSON.stringify({
        PLANNING: 2,
        FABRIC: 3,
        CUTTING: 2,
        SEWING: 8,
        QUALITY: 2,
        PACKAGING: 2,
        SHIPPING: 1,
      }),
      categoryId: defactoCategory.id,
      authorId: defactoOwner.id,
      companyId: defactoCompany.id,
    },
  });
  console.log("✅ Koleksiyon 3: " + defactoCollection3.name);

  const defactoCollection4 = await prisma.collection.create({
    data: {
      name: "Active Sport Pro",
      description: "Performans odaklı aktif spor giyim serisi",
      modelCode: "DEF-SS25-004",
      season: "SS25",
      gender: "MEN",
      fit: "Athletic",
      trend: "Athletic",
      colors: JSON.stringify(["Siyah", "Mavi"]),
      sizeGroups: JSON.stringify([2]),
      fabricComposition: "88% Polyester, 12% Elastane",
      accessories: JSON.stringify({
        zipper: "YKK Sport",
        labels: "Silikon baskı",
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=80",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
        "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80",
      ]),
      moq: 800,
      targetPrice: 18.5,
      targetLeadTime: 20,
      notes: "Nefes alan kumaş, nem emici",
      price: 18.5,
      stock: 2000,
      isActive: true,
      isFeatured: true,
      slug: "active-sport-pro",
      productionSchedule: JSON.stringify({
        PLANNING: 2,
        FABRIC: 2,
        CUTTING: 1,
        SEWING: 6,
        QUALITY: 2,
        PACKAGING: 1,
        SHIPPING: 1,
      }),
      categoryId: defactoCategory.id,
      authorId: defactoOwner.id,
      companyId: defactoCompany.id,
    },
  });
  console.log("✅ Koleksiyon 4: " + defactoCollection4.name);

  const defactoCollection5 = await prisma.collection.create({
    data: {
      name: "Winter Elegance FW25",
      description: "Kış sezonu zarif iş kıyafetleri",
      modelCode: "DEF-FW25-001",
      season: "FW25",
      gender: "WOMEN",
      fit: "Slim Fit",
      trend: "Business",
      colors: JSON.stringify(["Siyah", "Beige"]),
      sizeGroups: JSON.stringify([1]),
      fabricComposition: "70% Wool, 30% Polyester",
      accessories: JSON.stringify({
        buttons: "Metal altın kaplama",
        lining: "Satin",
        labels: "Deri",
      }),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
      ]),
      moq: 400,
      targetPrice: 55.0,
      targetLeadTime: 35,
      notes: "Premium yün kumaş, astar dahil",
      price: 55.0,
      stock: 800,
      isActive: true,
      isFeatured: true,
      slug: "winter-elegance-fw25",
      productionSchedule: JSON.stringify({
        PLANNING: 4,
        FABRIC: 4,
        CUTTING: 3,
        SEWING: 12,
        QUALITY: 3,
        PACKAGING: 2,
        SHIPPING: 2,
      }),
      categoryId: defactoCategory.id,
      authorId: defactoOwner.id,
      companyId: defactoCompany.id,
    },
  });
  console.log("✅ Koleksiyon 5: " + defactoCollection5.name);

  console.log("\n" + "=".repeat(60));
  console.log("📋 Test Kimlik Bilgileri Özeti");
  console.log("=".repeat(60));
  console.log("\n🔑 Admin Hesabı:");
  console.log("  Email: admin@platform.com");
  console.log("  Şifre: myPassword42\n");

  console.log("🏢 Defacto Tekstil (Üretici):");
  console.log("  Sahibi: ahmet@defacto.com / random42");
  console.log("  Çalışanlar: ayse@defacto.com, mehmet@defacto.com,");
  console.log("             zeynep@defacto.com, can@defacto.com\n");

  console.log("🛍️ LC Waikiki (Alıcı):");
  console.log("  Sahibi: fatma@lcwaikiki.com / iLikeTurtles42");
  console.log("  Çalışanlar: hasan@lcwaikiki.com, ali@lcwaikiki.com,");
  console.log("             seda@lcwaikiki.com\n");

  console.log("👥 Bireysel Müşteriler:");
  console.log("  derya.kaya@email.com / random42");
  console.log("  rana.khan@international.com / random42\n");

  console.log("🌍 Üçüncü Taraf ve Uluslararası Üreticiler:");
  console.log("  mert@thirdparty.com / random42");
  console.log("  ahmed@bangladesh-tex.com / random42");
  console.log("  wei@china-factory.com / random42");
  console.log("  nguyen@vietnam-tex.com / random42\n");

  console.log("=".repeat(60));
  console.log("✅ Toplam: 16 kullanıcı başarıyla oluşturuldu!");
  console.log("=".repeat(60));
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

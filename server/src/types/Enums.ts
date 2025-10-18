import { enumType } from "nexus";

export const OrderStatus = enumType({
  name: "OrderStatus",
  members: [
    "PENDING", // Sipariş beklemede
    "REVIEWED", // Üretici tarafından inceleniyor
    "QUOTE_SENT", // Üretici süre ve fiyat teklifi gönderdi
    "CUSTOMER_QUOTE_SENT", // Müşteri teklif gönderdi (standart veya revize)
    "MANUFACTURER_REVIEWING_QUOTE", // Üretici müşteri teklifini inceliyor
    "CONFIRMED", // Müşteri siparişi onayladı
    "REJECTED", // Sipariş reddedildi
    "REJECTED_BY_CUSTOMER", // Müşteri tarafından reddedildi
    "REJECTED_BY_MANUFACTURER", // Üretici tarafından reddedildi
    "IN_PRODUCTION", // Üretim aşamasında
    "PRODUCTION_COMPLETE", // Üretim tamamlandı
    "QUALITY_CHECK", // Kalite kontrolü yapılıyor
    "SHIPPED", // Kargoya verildi
    "DELIVERED", // Müşteriye teslim edildi
    "CANCELLED", // İptal edildi
  ],
  description: "Status workflow for order production - Complete quotation and approval flow",
});

export const SampleType = enumType({
  name: "SampleType",
  members: ["STANDARD", "REVISION", "CUSTOM", "DEVELOPMENT"],
  description: "Types of samples that can be requested",
});

export const SampleStatus = enumType({
  name: "SampleStatus",
  members: [
    // === İLK AŞAMALAR (AI ve Talep) ===
    "AI_DESIGN", // AI ile oluşturulmuş tasarım (henüz üreticiye gönderilmedi)
    "PENDING_APPROVAL", // Üretici onayı bekleniyor (eski flow)
    "PENDING", // Beklemede - Yeni talep

    // === İNCELEME ve TEKLİF AŞAMASI ===
    "REVIEWED", // Üretici tarafından inceleniyor
    "QUOTE_SENT", // Üretici süre ve fiyat teklifi gönderdi
    "CUSTOMER_QUOTE_SENT", // Müşteri teklif gönderdi (standart veya revize)
    "MANUFACTURER_REVIEWING_QUOTE", // Üretici müşteri teklifini inceliyor

    // === ONAY/RED DURUMLAR ===
    "CONFIRMED", // Müşteri onayladı, üretim başlayabilir
    "REJECTED", // Genel red
    "REJECTED_BY_CUSTOMER", // Müşteri tarafından reddedildi
    "REJECTED_BY_MANUFACTURER", // Üretici tarafından reddedildi

    // === ÜRETİM AŞAMALARI ===
    "IN_DESIGN", // Tasarım aşamasında (eski flow)
    "PATTERN_READY", // Kalıp hazır (eski flow)
    "IN_PRODUCTION", // Üretim aşamasında
    "PRODUCTION_COMPLETE", // Üretim tamamlandı

    // === KALİTE ve TESLİMAT ===
    "QUALITY_CHECK", // Kalite kontrolde
    "SHIPPED", // Kargoya verildi
    "DELIVERED", // Müşteriye teslim edildi

    // === DİĞER DURUMLAR ===
    "ON_HOLD", // Durduruldu (geçici olarak askıya alındı)
    "CANCELLED", // İptal edildi

    // === ESKİ FLOW İÇİN (Geriye dönük uyumluluk) ===
    "REQUESTED", // Müşteri tarafından talep edildi (eski)
    "RECEIVED", // Üretici talebi aldı (eski)
    "COMPLETED", // Tamamlandı (eski - artık DELIVERED kullanılıyor)
  ],
  description: "Status workflow for sample production - Complete workflow matching Order system with backward compatibility",
});
export const Role = enumType({
  name: "Role",
  members: [
    "ADMIN",
    "COMPANY_OWNER",
    "COMPANY_EMPLOYEE",
    "INDIVIDUAL_CUSTOMER",
    "MANUFACTURE", // Backward compatibility
    "CUSTOMER", // Backward compatibility
  ],
  description: "User roles in the system",
});

export const CompanyType = enumType({
  name: "CompanyType",
  members: ["MANUFACTURER", "BUYER", "BOTH"],
  description: "Type of company (manufacturer/buyer)",
});

export const SortOrder = enumType({
  name: "SortOrder",
  members: ["asc", "desc"],
  description: "Sort order for queries",
});

// Production Tracking Enums
export const ProductionStage = enumType({
  name: "ProductionStage",
  members: [
    "PLANNING",
    "FABRIC",
    "CUTTING",
    "SEWING",
    "QUALITY",
    "PACKAGING",
    "SHIPPING",
  ],
  description: "7-stage production process",
});

export const StageStatus = enumType({
  name: "StageStatus",
  members: [
    "NOT_STARTED",
    "IN_PROGRESS",
    "ON_HOLD",
    "COMPLETED",
    "REQUIRES_REVISION",
  ],
  description: "Status of individual production stage",
});

export const ProductionStatus = enumType({
  name: "ProductionStatus",
  members: ["IN_PROGRESS", "WAITING", "BLOCKED", "COMPLETED", "CANCELLED"],
  description: "Overall production status",
});

export const QualityResult = enumType({
  name: "QualityResult",
  members: ["PENDING", "PASSED", "FAILED", "CONDITIONAL_PASS"],
  description: "Quality control test results",
});

export const WorkshopType = enumType({
  name: "WorkshopType",
  members: ["SEWING", "PACKAGING", "QUALITY_CONTROL", "GENERAL"],
  description: "Types of workshops",
});

// Textile Industry Enums
export const Season = enumType({
  name: "Season",
  members: ["SS25", "FW25", "SS26", "FW26", "SS27", "FW27"],
  description: "Fashion seasons (Spring/Summer, Fall/Winter)",
});

export const Gender = enumType({
  name: "Gender",
  members: ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"],
  description: "Target gender for products",
});

export const Fit = enumType({
  name: "Fit",
  members: ["REGULAR", "SLIM", "RELAXED", "OVERSIZED", "FITTED", "LOOSE"],
  description: "Clothing fit types",
});

export const CertificationCategory = enumType({
  name: "CertificationCategory",
  members: [
    "FIBER", // Lif/Hammadde: GOTS, OCS, RCS, GRS, BCI
    "CHEMICAL", // Üretim/Kimyasal: OEKO-TEX, bluesign, ZDHC
    "SOCIAL", // Sosyal/Etik: BSCI, SA8000, WRAP
    "ENVIRONMENTAL", // Çevresel: LCA, ISO 14067, Carbon Footprint
    "TRACEABILITY", // İzlenebilirlik: DPP, Blockchain, QR
  ],
  description: "Certification categories for products",
});

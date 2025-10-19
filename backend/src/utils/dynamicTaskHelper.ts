/**
 * ====================================
 * DYNAMIC TASK MANAGEMENT SYSTEM
 * ====================================
 *
 * Enterprise-level task automation system for B2B textile platform
 *
 * Features:
 * - Status-based automatic task creation (28 Sample statuses, 15 Order statuses)
 * - Production stage tracking (7 stages)
 * - Dual task creation (customer + manufacturer)
 * - Auto-completion of old tasks
 * - Deadline management
 * - Priority calculation
 * - Rich metadata (JSON actionData)
 *
 * @version 2.0.0
 * @date October 19, 2025
 */

import { PrismaClient, TaskPriority } from "../../lib/generated";

// =============================================
// TYPES & INTERFACES
// =============================================

interface TaskConfig {
  customerTask?: TaskDefinition;
  manufacturerTask?: TaskDefinition;
}

interface TaskDefinition {
  title: string;
  description: string;
  type: string; // TaskType enum value
  priority: TaskPriority;
  dueDays: number; // Kaç gün içinde tamamlanmalı
  targetStatus?: string; // Hedef status (task tamamlandığında gidilecek)
  actionData?: any; // JSON metadata
}

// =============================================
// SAMPLE STATUS → TASK MAPPINGS (28 statuses)
// =============================================

const SAMPLE_STATUS_TASK_MAP: Record<string, TaskConfig> = {
  // === İLK AŞAMALAR ===
  PENDING: {
    manufacturerTask: {
      title: "🔔 Yeni Numune Talebi Alındı",
      description: "Müşteriden yeni bir numune talebi geldi. Teklif hazırlamalısınız.",
      type: "REVIEW_QUOTE",
      priority: "HIGH",
      dueDays: 3,
      targetStatus: "REVIEWED",
    },
    customerTask: {
      title: "⏳ Numune Talebiniz İletildi",
      description: "Numune talebiniz üreticiye iletildi. Teklif bekleniyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 5,
    },
  },

  // === İNCELEME ve TEKLİF AŞAMASI ===
  REVIEWED: {
    manufacturerTask: {
      title: "💰 Fiyat Teklifi Hazırlayın",
      description: "Numune incelendi. Şimdi fiyat ve süre teklifi göndermelisiniz.",
      type: "QUOTATION",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "QUOTE_SENT",
    },
  },

  QUOTE_SENT: {
    customerTask: {
      title: "📋 Teklif Onayı Bekliyor",
      description: "Üretici fiyat ve süre teklifi gönderdi. Onaylamalı veya karşı teklif göndermelisiniz.",
      type: "APPROVE_REJECT",
      priority: "HIGH",
      dueDays: 3,
      targetStatus: "CONFIRMED",
      actionData: {
        actions: ["approve", "counter-offer", "reject"],
      },
    },
    manufacturerTask: {
      title: "⏳ Müşteri Cevabı Bekleniyor",
      description: "Teklifiniz müşteriye iletildi. Onay bekleniyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 5,
    },
  },

  CUSTOMER_QUOTE_SENT: {
    manufacturerTask: {
      title: "💬 Müşteri Karşı Teklif Gönderdi",
      description: "Müşteriden karşı teklif geldi. İncelemeniz ve yanıt vermeniz gerekiyor.",
      type: "REVIEW_QUOTE",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "CONFIRMED",
    },
    customerTask: {
      title: "⏳ Karşı Teklifiniz İletildi",
      description: "Karşı teklifiniz üreticiye iletildi. Yanıt bekleniyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 4,
    },
  },

  MANUFACTURER_REVIEWING_QUOTE: {
    manufacturerTask: {
      title: "🔍 Müşteri Teklifini İnceleyin",
      description: "Müşterinin karşı teklifini incelemeniz ve yanıt vermeniz gerekiyor.",
      type: "REVIEW_QUOTE",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "CONFIRMED",
    },
  },

  // === ONAY DURUMU ===
  CONFIRMED: {
    manufacturerTask: {
      title: "🎉 Numune Onaylandı - Üretime Başlayın",
      description: "Müşteri numuneyi onayladı. Üretim planlayabilirsiniz.",
      type: "PRODUCTION_STAGE",
      priority: "HIGH",
      dueDays: 1,
      targetStatus: "IN_PRODUCTION",
    },
    customerTask: {
      title: "✅ Numune Onayınız Alındı",
      description: "Numune onaylandı. Üretim süreci başlayacak.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 7,
    },
  },

  // === RED DURUMLARI ===
  REJECTED_BY_CUSTOMER: {
    manufacturerTask: {
      title: "❌ Müşteri Numuneyi Reddetti",
      description: "Müşteri numuneyi reddetti. Alternatif teklif gönderebilirsiniz.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  REJECTED_BY_MANUFACTURER: {
    customerTask: {
      title: "❌ Üretici Numuneyi Reddetti",
      description: "Üretici bu numuneyi üretemeyeceğini bildirdi.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  // === ÜRETİM AŞAMALARI ===
  IN_PRODUCTION: {
    manufacturerTask: {
      title: "🏭 Numune Üretimde",
      description: "Numune üretim aşamasında. İlerlemeyi takip edin.",
      type: "PRODUCTION_STAGE",
      priority: "HIGH",
      dueDays: 7,
      targetStatus: "PRODUCTION_COMPLETE",
    },
    customerTask: {
      title: "🔄 Numune Üretiliyor",
      description: "Numuneniz üretim aşamasında. Tamamlanınca bildirim alacaksınız.",
      type: "STATUS_CHANGE",
      priority: "LOW",
      dueDays: 10,
    },
  },

  PRODUCTION_COMPLETE: {
    manufacturerTask: {
      title: "✅ Kalite Kontrolü Yapın",
      description: "Numune üretimi tamamlandı. Kalite kontrolü yapılmalı.",
      type: "QUALITY_CHECK",
      priority: "HIGH",
      dueDays: 1,
      targetStatus: "QUALITY_CHECK",
    },
    customerTask: {
      title: "🎉 Numuneniz Hazır",
      description: "Numuneniz üretildi. Kalite kontrolünden sonra kargoya verilecek.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  // === KALİTE ve TESLİMAT ===
  QUALITY_CHECK: {
    manufacturerTask: {
      title: "🔍 Kalite Kontrolü Devam Ediyor",
      description: "Numune kalite kontrolünde. Testleri tamamlayın.",
      type: "QUALITY_CHECK",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "SHIPPED",
    },
    customerTask: {
      title: "⏳ Kalite Kontrolü Yapılıyor",
      description: "Numuneniz kalite kontrolünden geçiyor.",
      type: "STATUS_CHANGE",
      priority: "LOW",
      dueDays: 3,
    },
  },

  SHIPPED: {
    manufacturerTask: {
      title: "📦 Numune Kargoya Verildi",
      description: "Numune kargoya verildi. Takip numarasını eklemeyi unutmayın.",
      type: "SHIPMENT",
      priority: "MEDIUM",
      dueDays: 1,
    },
    customerTask: {
      title: "🚚 Numuneniz Kargoda",
      description: "Numuneniz kargoya verildi. Yakında teslim alacaksınız.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 5,
    },
  },

  DELIVERED: {
    customerTask: {
      title: "🎉 Numune Teslim Edildi",
      description: "Numuneniz teslim edildi. Geri bildirim bekliyoruz.",
      type: "NOTIFICATION",
      priority: "HIGH",
      dueDays: 2,
      actionData: {
        feedbackRequired: true,
      },
    },
    manufacturerTask: {
      title: "✅ Numune Teslim Edildi",
      description: "Numune müşteriye teslim edildi. Sipariş gelebilir.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 7,
    },
  },

  // === DİĞER DURUMLAR ===
  ON_HOLD: {
    manufacturerTask: {
      title: "⏸️ Numune Askıda",
      description: "Numune geçici olarak askıya alındı.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 7,
    },
    customerTask: {
      title: "⏸️ Numune Beklemede",
      description: "Numuneniz geçici olarak askıya alındı.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 7,
    },
  },

  CANCELLED: {
    manufacturerTask: {
      title: "🚫 Numune İptal Edildi",
      description: "Numune talebi iptal edildi.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 1,
    },
    customerTask: {
      title: "🚫 Numune İptal Edildi",
      description: "Numune talebiniz iptal edildi.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 1,
    },
  },
};

// =============================================
// ORDER STATUS → TASK MAPPINGS (15 statuses)
// =============================================

const ORDER_STATUS_TASK_MAP: Record<string, TaskConfig> = {
  PENDING: {
    manufacturerTask: {
      title: "🔔 Yeni Sipariş Alındı",
      description: "Müşteriden yeni bir sipariş geldi. Teklif hazırlamalısınız.",
      type: "REVIEW_QUOTE",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "REVIEWED",
    },
    customerTask: {
      title: "⏳ Siparişiniz İletildi",
      description: "Siparişiniz üreticiye iletildi. Teklif bekleniyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 4,
    },
  },

  REVIEWED: {
    manufacturerTask: {
      title: "💰 Sipariş Teklifi Hazırlayın",
      description: "Sipariş incelendi. Fiyat ve teslimat süresi teklifi göndermelisiniz.",
      type: "QUOTATION",
      priority: "HIGH",
      dueDays: 1,
      targetStatus: "QUOTE_SENT",
    },
  },

  QUOTE_SENT: {
    customerTask: {
      title: "📋 Sipariş Teklifi Onayı",
      description: "Üretici sipariş teklifi gönderdi. Onaylamalı veya karşı teklif göndermelisiniz.",
      type: "APPROVE_REJECT",
      priority: "HIGH",
      dueDays: 3,
      targetStatus: "CONFIRMED",
      actionData: {
        actions: ["approve", "counter-offer", "reject"],
      },
    },
    manufacturerTask: {
      title: "⏳ Müşteri Yanıtı Bekleniyor",
      description: "Sipariş teklifiniz müşteriye iletildi. Onay bekleniyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 5,
    },
  },

  CUSTOMER_QUOTE_SENT: {
    manufacturerTask: {
      title: "💬 Müşteri Karşı Teklif Gönderdi",
      description: "Müşteriden karşı teklif geldi. İncelemeniz ve yanıt vermeniz gerekiyor.",
      type: "REVIEW_QUOTE",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "CONFIRMED",
    },
    customerTask: {
      title: "⏳ Karşı Teklifiniz İletildi",
      description: "Karşı teklifiniz üreticiye iletildi. Yanıt bekleniyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 4,
    },
  },

  MANUFACTURER_REVIEWING_QUOTE: {
    manufacturerTask: {
      title: "🔍 Müşteri Teklifini İnceleyin",
      description: "Müşterinin karşı teklifini incelemeniz ve yanıt vermeniz gerekiyor.",
      type: "REVIEW_QUOTE",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "CONFIRMED",
    },
  },

  CONFIRMED: {
    manufacturerTask: {
      title: "🎉 Sipariş Onaylandı - Üretime Başlayın",
      description: "Müşteri siparişi onayladı. Üretim planlaması yapmalısınız.",
      type: "PRODUCTION_STAGE",
      priority: "HIGH",
      dueDays: 1,
      targetStatus: "IN_PRODUCTION",
      actionData: {
        requiresProductionPlan: true,
      },
    },
    customerTask: {
      title: "✅ Siparişiniz Onaylandı",
      description: "Sipariş onaylandı. Üretim süreci başlayacak.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 7,
    },
  },

  // === RED DURUMLARI ===
  REJECTED_BY_CUSTOMER: {
    manufacturerTask: {
      title: "❌ Müşteri Siparişi Reddetti",
      description: "Müşteri siparişi reddetti. Alternatif teklif gönderebilirsiniz.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  REJECTED_BY_MANUFACTURER: {
    customerTask: {
      title: "❌ Üretici Siparişi Reddetti",
      description: "Üretici bu siparişi kabul edemeyeceğini bildirdi.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  // === ÜRETİM AŞAMALARI ===
  IN_PRODUCTION: {
    manufacturerTask: {
      title: "🏭 Sipariş Üretimde",
      description: "Sipariş üretim aşamasında. Aşama ilerlemesini güncelleyin.",
      type: "PRODUCTION_STAGE",
      priority: "HIGH",
      dueDays: 14,
      targetStatus: "PRODUCTION_COMPLETE",
    },
    customerTask: {
      title: "🔄 Siparişiniz Üretiliyor",
      description: "Siparişiniz üretim aşamasında. İlerlemeyi takip edebilirsiniz.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 20,
    },
  },

  PRODUCTION_COMPLETE: {
    manufacturerTask: {
      title: "✅ Kalite Kontrolü Yapın",
      description: "Üretim tamamlandı. Kalite kontrolü yapılmalı.",
      type: "QUALITY_CHECK",
      priority: "HIGH",
      dueDays: 1,
      targetStatus: "QUALITY_CHECK",
    },
    customerTask: {
      title: "🎉 Siparişiniz Hazır",
      description: "Siparişiniz üretildi. Kalite kontrolünden sonra kargoya verilecek.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  QUALITY_CHECK: {
    manufacturerTask: {
      title: "🔍 Kalite Kontrolü Yapın",
      description: "Sipariş kalite kontrolünde. Testleri tamamlayın.",
      type: "QUALITY_CHECK",
      priority: "HIGH",
      dueDays: 2,
      targetStatus: "SHIPPED",
    },
    customerTask: {
      title: "⏳ Kalite Kontrolü Yapılıyor",
      description: "Siparişiniz kalite kontrolünden geçiyor.",
      type: "STATUS_CHANGE",
      priority: "MEDIUM",
      dueDays: 3,
    },
  },

  SHIPPED: {
    manufacturerTask: {
      title: "📦 Sipariş Kargoya Verildi",
      description: "Sipariş kargoya verildi. Takip numarasını eklemeyi unutmayın.",
      type: "SHIPMENT",
      priority: "MEDIUM",
      dueDays: 1,
    },
    customerTask: {
      title: "🚚 Siparişiniz Kargoda",
      description: "Siparişiniz kargoya verildi. Yakında teslim alacaksınız.",
      type: "STATUS_CHANGE",
      priority: "HIGH",
      dueDays: 7,
    },
  },

  DELIVERED: {
    customerTask: {
      title: "🎉 Sipariş Teslim Edildi",
      description: "Siparişiniz teslim edildi. Geri bildirim bekliyoruz.",
      type: "NOTIFICATION",
      priority: "HIGH",
      dueDays: 3,
      actionData: {
        feedbackRequired: true,
        orderCompleted: true,
      },
    },
    manufacturerTask: {
      title: "✅ Sipariş Tamamlandı",
      description: "Sipariş başarıyla teslim edildi.",
      type: "NOTIFICATION",
      priority: "LOW",
      dueDays: 7,
    },
  },

  CANCELLED: {
    manufacturerTask: {
      title: "🚫 Sipariş İptal Edildi",
      description: "Sipariş iptal edildi.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 1,
    },
    customerTask: {
      title: "🚫 Sipariş İptal Edildi",
      description: "Siparişiniz iptal edildi.",
      type: "NOTIFICATION",
      priority: "MEDIUM",
      dueDays: 1,
    },
  },
};

// =============================================
// PRODUCTION STAGE → TASK MAPPINGS (7 stages)
// =============================================

const PRODUCTION_STAGE_TASK_MAP: Record<string, TaskDefinition> = {
  PLANNING: {
    title: "📋 Üretim Planlaması",
    description: "Üretim şeması ve kaynak planlaması yapılıyor.",
    type: "PRODUCTION_STAGE",
    priority: "HIGH",
    dueDays: 2,
  },
  FABRIC: {
    title: "🧵 Kumaş Tedarik ve Hazırlık",
    description: "Kumaş tedariki ve hazırlık aşaması.",
    type: "MATERIAL",
    priority: "HIGH",
    dueDays: 5,
  },
  CUTTING: {
    title: "✂️ Kesim Aşaması",
    description: "Kalıp hazırlama ve kesim işlemleri.",
    type: "PRODUCTION_STAGE",
    priority: "HIGH",
    dueDays: 3,
  },
  SEWING: {
    title: "🪡 Dikim Aşaması",
    description: "Montaj ve dikim işlemleri.",
    type: "PRODUCTION_STAGE",
    priority: "HIGH",
    dueDays: 7,
  },
  QUALITY: {
    title: "✅ Kalite Kontrol",
    description: "Ürün kalite testleri yapılıyor.",
    type: "QUALITY_CHECK",
    priority: "HIGH",
    dueDays: 2,
  },
  PACKAGING: {
    title: "📦 Paketleme",
    description: "Ürünler paketleniyor ve etiketleniyor.",
    type: "PRODUCTION_STAGE",
    priority: "MEDIUM",
    dueDays: 1,
  },
  SHIPPING: {
    title: "🚚 Kargo Hazırlık",
    description: "Kargo için son hazırlıklar.",
    type: "SHIPMENT",
    priority: "HIGH",
    dueDays: 1,
  },
};

// =============================================
// MAIN CLASS: DynamicTaskHelper
// =============================================

export class DynamicTaskHelper {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create tasks for Sample status change
   */
  async createTasksForSampleStatus(
    sampleId: number,
    status: string,
    customerId: number,
    manufacturerId: number,
    collectionId?: number
  ): Promise<void> {
    // Get task configuration for this status
    const taskConfig = SAMPLE_STATUS_TASK_MAP[status];
    if (!taskConfig) {
      console.log(`No task mapping for sample status: ${status}`);
      return;
    }

    // Complete old tasks
    await this.completeOldTasks(sampleId, "SAMPLE");

    // Create customer task
    if (taskConfig.customerTask) {
      await this.createTask({
        ...taskConfig.customerTask,
        userId: customerId,
        sampleId,
        ...(collectionId !== undefined && { collectionId }),
        relatedStatus: status,
        entityType: "SAMPLE",
      });
    }

    // Create manufacturer task
    if (taskConfig.manufacturerTask) {
      await this.createTask({
        ...taskConfig.manufacturerTask,
        userId: manufacturerId,
        sampleId,
        ...(collectionId !== undefined && { collectionId }),
        relatedStatus: status,
        entityType: "SAMPLE",
      });
    }
  }

  /**
   * Create tasks for Order status change
   */
  async createTasksForOrderStatus(
    orderId: number,
    status: string,
    customerId: number,
    manufacturerId: number
  ): Promise<void> {
    // Get task configuration for this status
    const taskConfig = ORDER_STATUS_TASK_MAP[status];
    if (!taskConfig) {
      console.log(`No task mapping for order status: ${status}`);
      return;
    }

    // Complete old tasks
    await this.completeOldTasks(orderId, "ORDER");

    // Create customer task
    if (taskConfig.customerTask) {
      await this.createTask({
        ...taskConfig.customerTask,
        userId: customerId,
        orderId,
        relatedStatus: status,
        entityType: "ORDER",
      });
    }

    // Create manufacturer task
    if (taskConfig.manufacturerTask) {
      await this.createTask({
        ...taskConfig.manufacturerTask,
        userId: manufacturerId,
        orderId,
        relatedStatus: status,
        entityType: "ORDER",
      });
    }
  }

  /**
   * Create task for Production stage
   */
  async createTaskForProductionStage(
    productionId: number,
    stage: string,
    manufacturerId: number,
    orderId?: number
  ): Promise<void> {
    const taskDef = PRODUCTION_STAGE_TASK_MAP[stage];
    if (!taskDef) {
      console.log(`No task mapping for production stage: ${stage}`);
      return;
    }

    await this.createTask({
      ...taskDef,
      userId: manufacturerId,
      productionTrackingId: productionId,
      ...(orderId !== undefined && { orderId }),
      productionStage: stage,
      entityType: "PRODUCTION",
    });
  }

  /**
   * Complete old tasks for an entity
   */
  async completeOldTasks(entityId: number, entityType: string): Promise<void> {
    const where: any = {
      status: { in: ["TODO", "IN_PROGRESS"] },
      entityType,
    };

    if (entityType === "SAMPLE") {
      where.sampleId = entityId;
    } else if (entityType === "ORDER") {
      where.orderId = entityId;
    } else if (entityType === "PRODUCTION") {
      where.productionTrackingId = entityId;
    }

    await this.prisma.task.updateMany({
      where,
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }

  /**
   * Create a single task
   */
  private async createTask(params: {
    title: string;
    description: string;
    type: string;
    priority: TaskPriority;
    dueDays: number;
    userId: number;
    targetStatus?: string;
    relatedStatus?: string;
    entityType?: string;
    sampleId?: number;
    orderId?: number;
    collectionId?: number;
    productionTrackingId?: number;
    productionStage?: string;
    actionData?: any;
  }): Promise<void> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + params.dueDays);

    await this.prisma.task.create({
      data: {
        title: params.title,
        description: params.description,
        type: params.type as any,
        priority: params.priority,
        dueDate,
        userId: params.userId,
        status: "TODO",
        targetStatus: params.targetStatus ?? null,
        relatedStatus: params.relatedStatus ?? null,
        entityType: params.entityType ?? null,
        sampleId: params.sampleId ?? null,
        orderId: params.orderId ?? null,
        collectionId: params.collectionId ?? null,
        productionTrackingId: params.productionTrackingId ?? null,
        productionStage: params.productionStage ?? null,
        actionData: params.actionData ?? null,
      },
    });
  }

  /**
   * Create deadline warning notification
   */
  async createDeadlineWarning(
    title: string,
    description: string,
    dueDate: Date,
    assignedToId: number,
    userId: number,
    entityId: number,
    entityType: string
  ): Promise<void> {
    const data: any = {
      title,
      description,
      type: "DEADLINE_WARNING",
      priority: "HIGH",
      dueDate,
      userId,
      assignedToId,
      status: "TODO",
      entityType,
    };

    if (entityType === "SAMPLE") data.sampleId = entityId;
    else if (entityType === "ORDER") data.orderId = entityId;
    else if (entityType === "PRODUCTION") data.productionTrackingId = entityId;

    await this.prisma.task.create({ data });
  }
}

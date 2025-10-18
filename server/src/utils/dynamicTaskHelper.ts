import { PrismaClient } from '../generated/prisma';

// ==========================================
// DYNAMIC TASK HELPER - Status Bazlı Sistem
// ==========================================

interface TaskConfig {
  customerTask?: {
    title: string;
    description: string;
    type: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDays: number;
  };
  manufacturerTask?: {
    title: string;
    description: string;
    type: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDays: number;
  };
  targetStatus?: string;
  actionData?: any;
}

// ==========================================
// SAMPLE STATUS → TASK MAPPING
// ==========================================
const SAMPLE_STATUS_TASK_MAP: Record<string, TaskConfig> = {
  // === İLK AŞAMALAR ===
  PENDING_APPROVAL: {
    customerTask: {
      title: '⏳ Üretici Onayı Bekleniyor',
      description: 'Numune talebiniz üreticiye gönderildi. Onay bekleniyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 3,
    },
    manufacturerTask: {
      title: '✅ Numune Talebini İncele ve Onayla',
      description: 'Müşteriden numune talebi geldi. İnceleyin ve onaylayın veya reddedin.',
      type: 'APPROVE_REJECT',
      priority: 'HIGH',
      dueDays: 2,
    },
    targetStatus: 'PENDING',
  },

  PENDING: {
    customerTask: {
      title: '⏳ İnceleme Bekleniyor',
      description: 'Numune talebiniz üretici tarafından inceleniyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 5,
    },
    manufacturerTask: {
      title: '🔍 Numune Talebini İncele',
      description: 'Müşteri numune talebi gönderdi. Detayları inceleyin ve teklif hazırlayın.',
      type: 'STATUS_CHANGE',
      priority: 'HIGH',
      dueDays: 3,
    },
    targetStatus: 'REVIEWED',
  },

  REVIEWED: {
    customerTask: {
      title: '⏳ Teklif Bekleniyor',
      description: 'Üretici numunenizi inceliyor. Kısa süre içinde teklif gelecek.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 5,
    },
    manufacturerTask: {
      title: '💰 Teklif Hazırla ve Gönder',
      description: 'Numune incelemesi tamamlandı. Fiyat ve süre teklifi hazırlayın.',
      type: 'QUOTATION',
      priority: 'HIGH',
      dueDays: 2,
    },
    targetStatus: 'QUOTE_SENT',
    actionData: {
      requiredFields: ['unitPrice', 'productionDays', 'manufacturerResponse'],
    },
  },

  QUOTE_SENT: {
    customerTask: {
      title: '✅ Teklif Geldi - İncele ve Yanıtla',
      description: 'Üretici size teklif gönderdi. Kabul edin, revize teklif gönderin veya reddedin.',
      type: 'REVIEW_QUOTE',
      priority: 'HIGH',
      dueDays: 3,
    },
    manufacturerTask: {
      title: '⏳ Müşteri Yanıtı Bekleniyor',
      description: 'Teklifiniz müşteriye gönderildi. Yanıt bekleniyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 5,
    },
    targetStatus: 'CUSTOMER_QUOTE_SENT',
    actionData: {
      actions: ['accept', 'counter_offer', 'reject'],
    },
  },

  CUSTOMER_QUOTE_SENT: {
    customerTask: {
      title: '⏳ Üretici Kararı Bekleniyor',
      description: 'Teklifiniz üreticiye gönderildi. Karar bekleniyor.',
      type: 'NOTIFICATION',
      priority: 'HIGH',
      dueDays: 3,
    },
    manufacturerTask: {
      title: '✅ Müşteri Teklifini İncele',
      description: 'Müşteri karşı teklif/onay gönderdi. Kabul edin, revize edin veya reddedin.',
      type: 'REVIEW_QUOTE',
      priority: 'HIGH',
      dueDays: 2,
    },
    targetStatus: 'CONFIRMED',
    actionData: {
      actions: ['approve', 'counter_offer', 'reject'],
    },
  },

  MANUFACTURER_REVIEWING_QUOTE: {
    customerTask: {
      title: '🔄 İnceleme Yapılıyor',
      description: 'Üretici teklifinizi inceliyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 2,
    },
  },

  // === ONAY/RED ===
  CONFIRMED: {
    customerTask: {
      title: '✅ Numune Onaylandı',
      description: 'Harika! Numune onaylandı. Üretim süreci başlayacak.',
      type: 'NOTIFICATION',
      priority: 'HIGH',
      dueDays: 1,
    },
    manufacturerTask: {
      title: '🏭 Üretime Başla',
      description: 'Numune onaylandı. Üretim sürecini başlatın.',
      type: 'STATUS_CHANGE',
      priority: 'HIGH',
      dueDays: 1,
    },
    targetStatus: 'IN_PRODUCTION',
    actionData: {
      nextStep: 'production',
    },
  },

  REJECTED_BY_CUSTOMER: {
    customerTask: {
      title: '❌ Teklifi Reddetdiniz',
      description: 'Üretici teklifi reddettiniz. Süreç sonlandırıldı.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
    manufacturerTask: {
      title: '❌ Müşteri Teklifi Reddetti',
      description: 'Müşteri teklifinizi reddetti. Süreç sonlandırıldı.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
  },

  REJECTED_BY_MANUFACTURER: {
    customerTask: {
      title: '❌ Üretici Reddetti',
      description: 'Üretici numune talebinizi reddetti. Başka üreticilere başvurabilirsiniz.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
    manufacturerTask: {
      title: '❌ Talebi Reddettiniz',
      description: 'Numune talebini reddettiniz. Süreç sonlandırıldı.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
  },

  // === ÜRETİM AŞAMALARI ===
  IN_DESIGN: {
    customerTask: {
      title: '🎨 Tasarım Aşamasında',
      description: 'Numune tasarım aşamasında. Üretici tasarım üzerinde çalışıyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 7,
    },
    manufacturerTask: {
      title: '🎨 Tasarım Hazırla',
      description: 'Numune tasarımını tamamlayın.',
      type: 'PRODUCTION_STAGE',
      priority: 'HIGH',
      dueDays: 5,
    },
    targetStatus: 'PATTERN_READY',
  },

  PATTERN_READY: {
    customerTask: {
      title: '📐 Kalıp Hazırlanıyor',
      description: 'Tasarım tamamlandı, kalıp hazırlanıyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 5,
    },
    manufacturerTask: {
      title: '📐 Kalıbı Tamamla',
      description: 'Kalıp hazırlama işlemini tamamlayın.',
      type: 'PRODUCTION_STAGE',
      priority: 'HIGH',
      dueDays: 3,
    },
    targetStatus: 'IN_PRODUCTION',
  },

  IN_PRODUCTION: {
    customerTask: {
      title: '🏭 Üretimde',
      description: 'Numuneniz üretim aşamasında. İlerleyişi takip edebilirsiniz.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 15,
    },
    manufacturerTask: {
      title: '🏭 Üretim İşlemlerini Tamamla',
      description: 'Numune üretimini tamamlayın. Tüm aşamaları takip edin.',
      type: 'PRODUCTION_STAGE',
      priority: 'HIGH',
      dueDays: 10,
    },
    targetStatus: 'PRODUCTION_COMPLETE',
  },

  PRODUCTION_COMPLETE: {
    customerTask: {
      title: '✅ Üretim Tamamlandı',
      description: 'Numune üretimi tamamlandı. Kalite kontrolüne gönderilecek.',
      type: 'NOTIFICATION',
      priority: 'HIGH',
      dueDays: 2,
    },
    manufacturerTask: {
      title: '✅ Kalite Kontrole Gönder',
      description: 'Üretim tamamlandı. Kalite kontrole gönderin.',
      type: 'QUALITY_CHECK',
      priority: 'HIGH',
      dueDays: 1,
    },
    targetStatus: 'QUALITY_CHECK',
  },

  QUALITY_CHECK: {
    customerTask: {
      title: '🔬 Kalite Kontrolde',
      description: 'Numune kalite kontrolünden geçiyor.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 3,
    },
    manufacturerTask: {
      title: '🔬 Kalite Kontrolü Yap',
      description: 'Numune kalite kontrolünü yapın ve onaylayın.',
      type: 'QUALITY_CHECK',
      priority: 'HIGH',
      dueDays: 2,
    },
    targetStatus: 'SHIPPED',
  },

  SHIPPED: {
    customerTask: {
      title: '📦 Kargoda',
      description: 'Numuneniz kargoya verildi. Takip numarasını kontrol edin.',
      type: 'NOTIFICATION',
      priority: 'HIGH',
      dueDays: 5,
    },
    manufacturerTask: {
      title: '📦 Kargo Takibi',
      description: 'Numune kargoya verildi. Teslimatı takip edin.',
      type: 'SHIPMENT',
      priority: 'MEDIUM',
      dueDays: 7,
    },
    targetStatus: 'DELIVERED',
  },

  DELIVERED: {
    customerTask: {
      title: '🎉 Teslim Edildi',
      description: 'Numune teslim edildi. İnceleyip geri bildirimde bulunabilirsiniz.',
      type: 'NOTIFICATION',
      priority: 'HIGH',
      dueDays: 0,
    },
    manufacturerTask: {
      title: '✅ Teslimat Tamamlandı',
      description: 'Numune başarıyla teslim edildi.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
  },

  // === DİĞER DURUMLAR ===
  ON_HOLD: {
    customerTask: {
      title: '⏸️ Süreç Durduruldu',
      description: 'Numune süreci geçici olarak durduruldu.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 0,
    },
    manufacturerTask: {
      title: '⏸️ Süreç Durduruldu',
      description: 'Numune süreci geçici olarak durduruldu.',
      type: 'NOTIFICATION',
      priority: 'MEDIUM',
      dueDays: 0,
    },
  },

  CANCELLED: {
    customerTask: {
      title: '❌ İptal Edildi',
      description: 'Numune süreci iptal edildi.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
    manufacturerTask: {
      title: '❌ İptal Edildi',
      description: 'Numune süreci iptal edildi.',
      type: 'NOTIFICATION',
      priority: 'LOW',
      dueDays: 0,
    },
  },
};

// ==========================================
// ORDER STATUS → TASK MAPPING (Sample ile aynı)
// ==========================================
const ORDER_STATUS_TASK_MAP: Record<string, TaskConfig> = {
  ...SAMPLE_STATUS_TASK_MAP, // Order ve Sample aynı workflow
};

// ==========================================
// PRODUCTION STAGE → TASK MAPPING
// ==========================================
const PRODUCTION_STAGE_TASK_MAP: Record<string, TaskConfig> = {
  PLANNING: {
    manufacturerTask: {
      title: '📋 Üretim Planlaması',
      description: 'Üretim planlamasını yapın. Malzeme, işçilik ve zaman planı hazırlayın.',
      type: 'PRODUCTION_STAGE',
      priority: 'HIGH',
      dueDays: 2,
    },
    targetStatus: 'FABRIC',
  },
  FABRIC: {
    manufacturerTask: {
      title: '🧵 Kumaş Tedarik',
      description: 'Gerekli kumaşları tedarik edin.',
      type: 'MATERIAL',
      priority: 'HIGH',
      dueDays: 5,
    },
    targetStatus: 'CUTTING',
  },
  CUTTING: {
    manufacturerTask: {
      title: '✂️ Kesim İşlemi',
      description: 'Kumaş kesim işlemlerini tamamlayın.',
      type: 'PRODUCTION_STAGE',
      priority: 'HIGH',
      dueDays: 3,
    },
    targetStatus: 'SEWING',
  },
  SEWING: {
    manufacturerTask: {
      title: '🪡 Dikiş İşlemi',
      description: 'Dikiş işlemlerini tamamlayın.',
      type: 'PRODUCTION_STAGE',
      priority: 'HIGH',
      dueDays: 7,
    },
    targetStatus: 'QUALITY',
  },
  QUALITY: {
    manufacturerTask: {
      title: '✅ Kalite Kontrol',
      description: 'Ürünlerin kalite kontrolünü yapın.',
      type: 'QUALITY_CHECK',
      priority: 'HIGH',
      dueDays: 2,
    },
    targetStatus: 'PACKAGING',
  },
  PACKAGING: {
    manufacturerTask: {
      title: '📦 Paketleme',
      description: 'Ürünleri paketleyin ve sevkiyata hazırlayın.',
      type: 'PRODUCTION_STAGE',
      priority: 'MEDIUM',
      dueDays: 2,
    },
    targetStatus: 'SHIPPING',
  },
  SHIPPING: {
    manufacturerTask: {
      title: '🚚 Kargoya Teslim',
      description: 'Ürünleri kargoya teslim edin.',
      type: 'SHIPMENT',
      priority: 'HIGH',
      dueDays: 1,
    },
  },
};

// ==========================================
// DYNAMIC TASK HELPER CLASS
// ==========================================
export class DynamicTaskHelper {
  constructor(private prisma: PrismaClient) {}

  /**
   * Sample status değiştiğinde otomatik task oluştur
   */
  async createTasksForSampleStatus(
    sampleId: number,
    status: string,
    customerId: number,
    manufacturerId: number,
    collectionId?: number
  ) {
    const config = SAMPLE_STATUS_TASK_MAP[status];
    if (!config) {
      console.warn(`No task config for sample status: ${status}`);
      return;
    }

    try {
      // Önceki TODO task'ları COMPLETED yap
      await this.completeOldTasks('SAMPLE', sampleId);

      // Müşteri task'ı oluştur
      if (config.customerTask) {
        await this.createTask({
          ...config.customerTask,
          userId: customerId,
          sampleId,
          collectionId,
          relatedStatus: status,
          targetStatus: config.targetStatus,
          entityType: 'SAMPLE',
          actionData: config.actionData,
        });
      }

      // Üretici task'ı oluştur
      if (config.manufacturerTask) {
        await this.createTask({
          ...config.manufacturerTask,
          userId: manufacturerId,
          assignedToId: manufacturerId,
          sampleId,
          collectionId,
          relatedStatus: status,
          targetStatus: config.targetStatus,
          entityType: 'SAMPLE',
          actionData: config.actionData,
        });
      }
    } catch (error) {
      console.error('Error creating tasks for sample status:', error);
    }
  }

  /**
   * Order status değiştiğinde otomatik task oluştur
   */
  async createTasksForOrderStatus(
    orderId: number,
    status: string,
    customerId: number,
    manufacturerId: number,
    collectionId?: number
  ) {
    const config = ORDER_STATUS_TASK_MAP[status];
    if (!config) {
      console.warn(`No task config for order status: ${status}`);
      return;
    }

    try {
      // Önceki TODO task'ları COMPLETED yap
      await this.completeOldTasks('ORDER', orderId);

      // Müşteri task'ı oluştur
      if (config.customerTask) {
        await this.createTask({
          ...config.customerTask,
          userId: customerId,
          orderId,
          collectionId,
          relatedStatus: status,
          targetStatus: config.targetStatus,
          entityType: 'ORDER',
          actionData: config.actionData,
        });
      }

      // Üretici task'ı oluştur
      if (config.manufacturerTask) {
        await this.createTask({
          ...config.manufacturerTask,
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId,
          collectionId,
          relatedStatus: status,
          targetStatus: config.targetStatus,
          entityType: 'ORDER',
          actionData: config.actionData,
        });
      }
    } catch (error) {
      console.error('Error creating tasks for order status:', error);
    }
  }

  /**
   * Production stage değiştiğinde otomatik task oluştur
   */
  async createTaskForProductionStage(
    productionTrackingId: number,
    stage: string,
    manufacturerId: number,
    orderId?: number,
    sampleId?: number
  ) {
    const config = PRODUCTION_STAGE_TASK_MAP[stage];
    if (!config || !config.manufacturerTask) {
      console.warn(`No task config for production stage: ${stage}`);
      return;
    }

    try {
      await this.createTask({
        ...config.manufacturerTask,
        userId: manufacturerId,
        assignedToId: manufacturerId,
        productionTrackingId,
        orderId,
        sampleId,
        productionStage: stage,
        entityType: 'PRODUCTION',
        actionData: config.actionData,
      });
    } catch (error) {
      console.error('Error creating task for production stage:', error);
    }
  }

  /**
   * Generic task oluşturma metodu
   */
  private async createTask(data: {
    title: string;
    description: string;
    type: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDays: number;
    userId: number;
    assignedToId?: number;
    sampleId?: number;
    orderId?: number;
    collectionId?: number;
    productionTrackingId?: number;
    relatedStatus?: string;
    targetStatus?: string;
    entityType?: string;
    productionStage?: string;
    actionData?: any;
  }) {
    const dueDate = data.dueDays > 0
      ? new Date(Date.now() + data.dueDays * 24 * 60 * 60 * 1000)
      : null;

    await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as any,
        status: 'TODO' as any,
        priority: data.priority as any,
        dueDate,
        userId: data.userId,
        assignedToId: data.assignedToId,
        sampleId: data.sampleId,
        orderId: data.orderId,
        collectionId: data.collectionId,
        productionTrackingId: data.productionTrackingId,
        relatedStatus: data.relatedStatus,
        targetStatus: data.targetStatus,
        entityType: data.entityType,
        productionStage: data.productionStage,
        actionData: data.actionData || undefined,
      },
    });
  }

  /**
   * Eski TODO task'ları COMPLETED yap
   */
  private async completeOldTasks(entityType: 'SAMPLE' | 'ORDER' | 'PRODUCTION', entityId: number) {
    const where: any = {
      status: 'TODO',
    };

    if (entityType === 'SAMPLE') {
      where.sampleId = entityId;
    } else if (entityType === 'ORDER') {
      where.orderId = entityId;
    } else if (entityType === 'PRODUCTION') {
      where.productionTrackingId = entityId;
    }

    await this.prisma.task.updateMany({
      where,
      data: {
        status: 'COMPLETED' as any,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Termin uyarısı task'ı oluştur
   */
  async createDeadlineWarning(
    entityType: 'SAMPLE' | 'ORDER',
    entityId: number,
    userId: number,
    daysLeft: number,
    dueDate: Date
  ) {
    const entity = entityType === 'SAMPLE' ? 'Numune' : 'Sipariş';

    await this.createTask({
      title: `⚠️ Termin Uyarısı - ${daysLeft} Gün Kaldı`,
      description: `${entity} teslim tarihine ${daysLeft} gün kaldı! Lütfen ilerlemeyi kontrol edin.`,
      type: 'DEADLINE_WARNING',
      priority: daysLeft <= 1 ? 'HIGH' : 'MEDIUM',
      dueDays: 0,
      userId,
      sampleId: entityType === 'SAMPLE' ? entityId : undefined,
      orderId: entityType === 'ORDER' ? entityId : undefined,
      entityType,
      actionData: { daysLeft, dueDate: dueDate.toISOString() },
    });
  }
}

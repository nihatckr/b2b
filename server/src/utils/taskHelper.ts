import { PrismaClient } from '../generated/prisma';


export class TaskHelper {
  constructor(private prisma: PrismaClient) {}

  /**
   * Numune isteği gönderildiğinde otomatik görev oluştur
   * - Müşteri: SAMPLE_REQUEST görevi (TODO)
   * - Üretici: SAMPLE_RESPONSE görevi (TODO - incelemeye başlaması lazım)
   */
  async createSampleRequestTasks(
    sampleId: number,
    customerId: number,
    manufacturerId: number,
    collectionId: number
  ) {
    try {
      // Müşteri görevi
      await this.prisma.task.create({
        data: {
          title: "Numune İsteği Gönderildi",
          description:
            "Üreticiye numune isteği gönderdiniz. Cevabı bekliyoruz.",
          type: "SAMPLE_REQUEST" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
          userId: customerId,
          sampleId: sampleId,
          collectionId: collectionId,
        },
      });

      // Üretici görevi
      await this.prisma.task.create({
        data: {
          title: "Numune İnceleme Talebesi",
          description:
            "Müşteri sizden numune incelemesi istedi. Lütfen kontrol edin ve müşteriye bildirin.",
          type: "SAMPLE_RESPONSE" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
          userId: manufacturerId,
          assignedToId: manufacturerId,
          sampleId: sampleId,
          collectionId: collectionId,
        },
      });
    } catch (error) {
      console.error("Error creating sample request tasks:", error);
    }
  }

  /**
   * Numune onaylandığında/reddedildiğinde otomatik görev oluştur
   */
  async createSampleResponseTasks(
    sampleId: number,
    customerId: number,
    manufacturerId: number,
    collectionId: number,
    approved: boolean
  ) {
    try {
      if (approved) {
        // Müşteri: Numune onaylandı, sipariş vermeye hazırlanması lazım
        await this.prisma.task.create({
          data: {
            title: "Numune Onaylandı - Sipariş Hazırlığı",
            description:
              "Üretici numuneni onayladı. Artık sipariş vermek için hazırlanabilirsin.",
            type: "PURCHASE_ORDER" as any,
            status: "TODO" as any,
            priority: "HIGH" as any,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            userId: customerId,
            sampleId: sampleId,
            collectionId: collectionId,
          },
        });

        // Üretici: Onaylanan numune, sipariş gelmeyi bekle
        await this.prisma.task.create({
          data: {
            title: "Numune Onaylandı - Sipariş Bekleniyor",
            description:
              "Müşteri numuneyi onayladı. Şimdi sipariş alınız için bekleyin.",
            type: "SAMPLE_PRODUCTION" as any,
            status: "TODO" as any,
            priority: "MEDIUM" as any,
            userId: manufacturerId,
            assignedToId: manufacturerId,
            sampleId: sampleId,
            collectionId: collectionId,
          },
        });
      } else {
        // Müşteri: Numune reddedildi, yeni numune istemeliyiz
        await this.prisma.task.create({
          data: {
            title: "Numune Reddedildi - Yeniden İstek",
            description:
              "Üretici numuneyi reddetti. Lütfen değişiklikleri belirtin.",
            type: "REVISION_REQUEST" as any,
            status: "TODO" as any,
            priority: "HIGH" as any,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userId: customerId,
            sampleId: sampleId,
            collectionId: collectionId,
          },
        });

        // Üretici: Revizyon yapması lazım
        await this.prisma.task.create({
          data: {
            title: "Numune Revizyonu Gerekli",
            description:
              "Müşteri numuneyi reddetti. Lütfen gerekli değişiklikleri yapın.",
            type: "REVISION_REQUEST" as any,
            status: "TODO" as any,
            priority: "HIGH" as any,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userId: manufacturerId,
            assignedToId: manufacturerId,
            sampleId: sampleId,
            collectionId: collectionId,
          },
        });
      }
    } catch (error) {
      console.error("Error creating sample response tasks:", error);
    }
  }

  /**
   * Sipariş oluşturulduğunda otomatik görev oluştur
   * - Müşteri: Bekleme durumu (sipariş verdi)
   * - Üretici: İnceleme görevi
   */
  async createOrderTasks(
    orderId: number,
    customerId: number,
    manufacturerId: number,
    collectionId: number
  ) {
    console.log("🎯 Creating order tasks:", {
      orderId,
      customerId,
      manufacturerId,
      collectionId,
    });

    try {
      // Müşteri: Sipariş verdi, bekleniyor
      const customerTask = await this.prisma.task.create({
        data: {
          title: "Sipariş Verildi - Bekleniyor",
          description:
            "Siparişinizi gönderdik. Üretici tarafından incelenmeyi bekliyoruz.",
          type: "PURCHASE_ORDER" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 hafta
          userId: customerId,
          orderId: orderId,
          collectionId: collectionId,
        },
      });
      console.log("✅ Customer task created:", customerTask.id);

      // Üretici: Sipariş incelemeye geçme
      const manufacturerTask = await this.prisma.task.create({
        data: {
          title: "Sipariş İncelemesine Başla",
          description:
            "Yeni bir sipariş aldınız. Lütfen detayları inceleyin ve uygunluğunu kontrol edin.",
          type: "QUOTATION" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          collectionId: collectionId,
        },
      });
      console.log("✅ Manufacturer task created:", manufacturerTask.id);
      console.log("🎉 Order tasks created successfully!");
    } catch (error) {
      console.error("❌ Error creating order tasks:", error);
    }
  }

  /**
   * Üretici sipariş incelemesini tamamladığında
   * Müşteriye: İncelendi cevabı görevi oluştur
   */
  async createOrderApprovalTask(
    orderId: number,
    customerId: number,
    manufacturerId: number,
    collectionId: number,
    message: string
  ) {
    try {
      // Önce QUOTATION taskını tamamla
      await this.prisma.task.updateMany({
        where: {
          orderId: orderId,
          type: "QUOTATION",
          status: { not: "COMPLETED" },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Müşteri: Üretici cevap verdi, onaylaması lazım
      await this.prisma.task.create({
        data: {
          title: "Sipariş Teklifi - Onay Bekleniyor",
          description: `Üretici siparişinizi inceledi: "${message}". Lütfen onaylayın veya reddedin.`,
          type: "APPROVE_SAMPLE" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          userId: customerId,
          orderId: orderId,
          collectionId: collectionId,
          notes: message,
        },
      });

      console.log("✅ Order approval task created for customer:", customerId);
    } catch (error) {
      console.error("Error creating order approval task:", error);
    }
  }

  /**
   * Üretici revize teklif sunduğunda
   * Müşteriye yeni teklif için task oluştur
   */
  async createRevisionQuoteTask(
    orderId: number,
    customerId: number,
    manufacturerId: number,
    collectionId: number,
    revisionMessage: string,
    revisedPrice?: number,
    revisedDays?: number
  ) {
    try {
      let description = `Üretici revize teklif gönderdi: "${revisionMessage}".`;
      if (revisedPrice) {
        description += ` Yeni fiyat: ${revisedPrice} TL.`;
      }
      if (revisedDays) {
        description += ` Yeni üretim süresi: ${revisedDays} gün.`;
      }
      description += " Lütfen inceleyin ve onaylayın.";

      // Müşteri: Revize teklif geldi
      await this.prisma.task.create({
        data: {
          title: "Revize Teklif - Onay Bekleniyor",
          description: description,
          type: "APPROVE_SAMPLE" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          userId: customerId,
          orderId: orderId,
          collectionId: collectionId,
          notes: revisionMessage,
        },
      });

      console.log("✅ Revision quote task created for customer:", customerId);
    } catch (error) {
      console.error("Error creating revision quote task:", error);
    }
  }

  /**
   * Müşteri teklif gönderdiğinde üreticiye inceleme görevi oluştur
   * CUSTOMER_QUOTE_SENT durumunda çağrılır
   */
  async createReviewCustomerQuoteTask(
    orderId: number,
    manufacturerId: number,
    customerId: number,
    collectionId: number,
    customerQuoteType: string,
    quotedPrice: number,
    quoteDays: number,
    quoteNote?: string
  ) {
    try {
      console.log("🎯 Creating review customer quote task:", {
        orderId,
        manufacturerId,
        customerQuoteType,
        quotedPrice,
        quoteDays,
      });

      const quoteTypeLabel =
        customerQuoteType === "STANDARD"
          ? "Standart Teklif"
          : "Revize Teklif";

      let description = `Müşteri ${quoteTypeLabel} gönderdi:\n`;
      description += `💰 Teklif Fiyatı: ${quotedPrice} TL (birim)\n`;
      description += `⏱️ İstenen Süre: ${quoteDays} gün\n`;
      if (quoteNote) {
        description += `📝 Not: "${quoteNote}"\n`;
      }
      description += `\nLütfen tekli inceleyin ve onaylayın veya reddedin.`;

      // Üretici: Müşteri teklifi inceleme görevi
      const task = await this.prisma.task.create({
        data: {
          title: `${quoteTypeLabel} - Müşteri Teklifi İnceleme`,
          description: description,
          type: "REVIEW_CUSTOMER_QUOTE" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 gün
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          collectionId: collectionId,
          notes: `Teklif Tipi: ${customerQuoteType}, Fiyat: ${quotedPrice} TL, Süre: ${quoteDays} gün`,
        },
      });

      console.log(
        "✅ Review customer quote task created for manufacturer:",
        manufacturerId,
        "Task ID:",
        task.id
      );
    } catch (error) {
      console.error("❌ Error creating review customer quote task:", error);
    }
  }

  /**
   * Müşteri sipariş onaylandığında
   * Üreticiye: Üretim başlama görevi
   */
  async createProductionStartTask(
    orderId: number,
    manufacturerId: number,
    collectionId: number,
    quantity: number
  ) {
    try {
      // Üretici: Üretim başlama
      await this.prisma.task.create({
        data: {
          title: "Üretim Başlama - Hazırlık",
          description: `Müşteri siparişi onayladı. ${quantity} adet ürün üretmeye başlayabilirsin.`,
          type: "PRODUCTION_START" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          collectionId: collectionId,
          notes: `Toplam: ${quantity} adet`,
        },
      });
    } catch (error) {
      console.error("Error creating production start task:", error);
    }
  }

  /**
   * Üretim tamamlandığında kalite kontrolü başlat
   */
  async createQualityCheckTask(
    orderId: number,
    manufacturerId: number,
    collectionId: number
  ) {
    try {
      await this.prisma.task.create({
        data: {
          title: "Kalite Kontrolü - Kontrol Edin",
          description:
            "Üretim tamamlandı. Lütfen kalite kontrolü yapın ve müşteriye bildirin.",
          type: "PRODUCTION_QUALITY_CHECK" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          collectionId: collectionId,
        },
      });
    } catch (error) {
      console.error("Error creating quality check task:", error);
    }
  }

  /**
   * Kalite kontrolü tamamlandığında kargo hazırlama
   */
  async createShipmentTask(
    orderId: number,
    manufacturerId: number,
    collectionId: number,
    customerId?: number
  ) {
    try {
      await this.prisma.task.create({
        data: {
          title: "Kargo Hazırlama - Paketleme",
          description:
            "Kalite kontrolü tamamlandı. Lütfen ürünleri paketleyin ve kargo gönderin.",
          type: "PRODUCTION_SHIPMENT" as any,
          status: "TODO" as any,
          priority: "HIGH" as any,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          collectionId: collectionId,
        },
      });

      // Müşteri: Kargo gelmeyi bekleme
      if (customerId) {
        await this.prisma.task.create({
          data: {
            title: "Ürün Teslimatı - Bekleme",
            description: "Üretici ürünü kargoya verdi. Teslimatı bekliyoruz.",
            type: "REVIEW_PRODUCTION" as any,
            status: "TODO" as any,
            priority: "MEDIUM" as any,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            userId: customerId,
            orderId: orderId,
            collectionId: collectionId,
          },
        });
      }
    } catch (error) {
      console.error("Error creating shipment task:", error);
    }
  }

  /**
   * Tüm ilişkili görevleri bitir (task completed)
   */
  async completeRelatedTasks(sampleId?: number, orderId?: number) {
    try {
      if (sampleId) {
        await this.prisma.task.updateMany({
          where: {
            sampleId: sampleId,
            status: { not: "COMPLETED" },
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }

      if (orderId) {
        await this.prisma.task.updateMany({
          where: {
            orderId: orderId,
            status: { not: "COMPLETED" },
          },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error completing related tasks:", error);
    }
  }

  /**
   * Üretim aşaması başladığında görev oluştur
   * Her aşama için üretici için görev var
   */
  async createProductionStageTask(
    orderId: number,
    manufacturerId: number,
    stage: string,
    estimatedDays: number
  ) {
    try {
      const stageLabels: Record<string, string> = {
        PLANNING: "📋 Planlama",
        FABRIC: "🧵 Kumaş Tedariki",
        CUTTING: "✂️ Kesim",
        SEWING: "🪡 Dikiş",
        QUALITY: "✔️ Kalite Kontrolü",
        PACKAGING: "📦 Paketleme",
        SHIPPING: "🚚 Kargo",
      };

      const stageDescriptions: Record<string, string> = {
        PLANNING: "Üretim planlaması yapılmalı ve kaynaklar hazırlanmalı",
        FABRIC: "Gerekli kumaşlar tedarik edilmeli",
        CUTTING: "Kumaş kesilmesi başlamalı",
        SEWING: "Dikiş işleri gerçekleştirilmeli",
        QUALITY: "Kalite kontrolü yapılmalı",
        PACKAGING: "Ürünler paketlenmeye hazırlanmalı",
        SHIPPING: "Ürünler kargoya verilerek gönderilmeli",
      };

      await this.prisma.task.create({
        data: {
          title: `${stageLabels[stage] || stage} - Aşama Başlama`,
          description: stageDescriptions[stage] || `${stage} aşaması başlamalı`,
          type: "PRODUCTION_STAGE" as any,
          status: "TODO" as any,
          priority: "LOW" as any, // Başlangıçta LOW, zaman geçince HIGH olacak
          dueDate: new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000),
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          notes: `${stage} aşaması için tahmini süre: ${estimatedDays} gün`,
        },
      });
    } catch (error) {
      console.error("Error creating production stage task:", error);
    }
  }

  /**
   * Aşama tamamlandığında: mevcut aşama görevini tamamla, sonraki aşama görevini oluştur
   */
  async handleStageCompletion(
    orderId: number,
    completedStage: string,
    nextStage: string | null,
    manufacturerId: number,
    estimatedDaysForNext: number
  ) {
    try {
      // Tamamlanan aşama görevini COMPLETED olarak işaretle
      await this.prisma.task.updateMany({
        where: {
          orderId: orderId,
          type: "PRODUCTION_STAGE" as any,
          title: { contains: completedStage },
          status: { not: "COMPLETED" },
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Sonraki aşama varsa görev oluştur
      if (nextStage) {
        await this.createProductionStageTask(
          orderId,
          manufacturerId,
          nextStage,
          estimatedDaysForNext
        );
      }
    } catch (error) {
      console.error("Error handling stage completion:", error);
    }
  }

  /**
   * Aşama geri alındığında: mevcut aşama görevini yeniden TODO yap, sonraki aşama görevini sil
   */
  async handleStageRevert(
    orderId: number,
    revertedStage: string,
    nextStage: string | null
  ) {
    try {
      // Geri alınan aşama görevini yeniden TODO olarak işaretle
      await this.prisma.task.updateMany({
        where: {
          orderId: orderId,
          type: "PRODUCTION_STAGE" as any,
          title: { contains: revertedStage },
          status: "COMPLETED",
        },
        data: {
          status: "TODO",
          completedAt: null,
        },
      });

      // Sonraki aşama görevini sil (varsa)
      if (nextStage) {
        await this.prisma.task.deleteMany({
          where: {
            orderId: orderId,
            type: "PRODUCTION_STAGE" as any,
            title: { contains: nextStage },
            status: "TODO",
          },
        });
      }
    } catch (error) {
      console.error("Error handling stage revert:", error);
    }
  }

  /**
   * Zamanı kontrol et: aşama sonuna yaklaştıkça önceliği arttır
   * 75% geçildi: MEDIUM, 90% geçildi: HIGH
   */
  async updateTaskPriorityByTime(
    orderId: number,
    stage: string,
    elapsedDays: number,
    estimatedDays: number
  ) {
    try {
      let newPriority = "LOW";
      const percentage = (elapsedDays / estimatedDays) * 100;

      if (percentage >= 90) {
        newPriority = "HIGH";
      } else if (percentage >= 75) {
        newPriority = "MEDIUM";
      }

      await this.prisma.task.updateMany({
        where: {
          type: "PRODUCTION_STAGE" as any,
          title: { contains: stage },
          orderId: orderId,
          status: "TODO",
        },
        data: {
          priority: newPriority as any,
        },
      });
    } catch (error) {
      console.error("Error updating task priority:", error);
    }
  }

  /**
   * Sonraki aşamaya geçme uyarısı görevini oluştur
   */
  async createNextStageWarningTask(
    orderId: number,
    completedStage: string,
    nextStageName: string,
    manufacturerId: number
  ) {
    try {
      await this.prisma.task.create({
        data: {
          title: `Sonraki Aşama: ${nextStageName}`,
          description: `${completedStage} aşaması tamamlandı. Şimdi ${nextStageName} aşamasına hazırlanmalısınız.`,
          type: "STAGE_TRANSITION_WARNING" as any,
          status: "TODO" as any,
          priority: "LOW" as any, // Uyarı görevleri LOW priority
          userId: manufacturerId,
          assignedToId: manufacturerId,
          orderId: orderId,
          dueDate: new Date(), // Hemen
        },
      });
    } catch (error) {
      console.error("Error creating next stage warning task:", error);
    }
  }
}

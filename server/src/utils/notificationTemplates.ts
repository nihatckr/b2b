/**
 * Standardized notification message templates
 * Prevents code duplication and ensures consistent messaging
 */

export const NotificationTemplates = {
  ORDER: {
    CREATED: (orderNumber: string) => ({
      title: "🛍️ Yeni Sipariş Alındı",
      message: `#${orderNumber} numaralı yeni sipariş oluşturuldu`,
    }),
    UPDATED: (orderNumber: string) => ({
      title: "📝 Sipariş Güncellendi",
      message: `#${orderNumber} numaralı sipariş detayları güncellendi`,
    }),
    CANCELLED: (orderNumber: string, by: "customer" | "manufacturer") => ({
      title: "❌ Sipariş İptal Edildi",
      message:
        by === "customer"
          ? `#${orderNumber} numaralı sipariş müşteri tarafından iptal edildi`
          : `#${orderNumber} numaralı sipariş üretici tarafından reddedildi`,
    }),
    CONFIRMED: (orderNumber: string) => ({
      title: "✅ Sipariş Onaylandı",
      message: `#${orderNumber} numaralı sipariş onaylandı ve üretime alındı`,
    }),
    STATUS_CHANGED: (orderNumber: string, newStatus: string) => ({
      title: "📦 Sipariş Durumu Güncellendi",
      message: `#${orderNumber} sipariş durumu: ${newStatus}`,
    }),
    REJECTED: (orderNumber: string, reason?: string) => ({
      title: "❌ Sipariş Reddedildi",
      message: reason
        ? `#${orderNumber} reddedildi. Sebep: ${reason}`
        : `#${orderNumber} numaralı sipariş reddedildi`,
    }),
    QUOTE_SENT: (orderNumber: string, price: number) => ({
      title: "💰 Teklif Gönderildi",
      message: `#${orderNumber} için ₺${price.toFixed(2)} teklif gönderildi`,
    }),
  },

  SAMPLE: {
    REQUESTED: (sampleNumber: string, collectionName: string) => ({
      title: "🎨 Yeni Numune Talebi",
      message: `${collectionName} için #${sampleNumber} numune talebi alındı`,
    }),
    CREATED: (sampleNumber: string) => ({
      title: "🎨 Numune Oluşturuldu",
      message: `#${sampleNumber} numaralı numune oluşturuldu`,
    }),
    UPDATED: (sampleNumber: string) => ({
      title: "📝 Numune Güncellendi",
      message: `#${sampleNumber} numaralı numune detayları güncellendi`,
    }),
    CANCELLED: (sampleNumber: string) => ({
      title: "❌ Numune İptal Edildi",
      message: `#${sampleNumber} numaralı numune iptal edildi`,
    }),
    STATUS_CHANGED: (sampleNumber: string, newStatus: string) => ({
      title: "🎨 Numune Durumu Güncellendi",
      message: `#${sampleNumber} numune durumu: ${newStatus}`,
    }),
    APPROVED: (sampleNumber: string) => ({
      title: "✅ Numune Onaylandı",
      message: `#${sampleNumber} numaralı numune onaylandı`,
    }),
    REJECTED: (sampleNumber: string, reason?: string) => ({
      title: "❌ Numune Reddedildi",
      message: reason
        ? `#${sampleNumber} reddedildi. Sebep: ${reason}`
        : `#${sampleNumber} numaralı numune reddedildi`,
    }),
    COMPLETED: (sampleNumber: string) => ({
      title: "🎉 Numune Tamamlandı",
      message: `#${sampleNumber} numaralı numune hazır`,
    }),
  },

  PRODUCTION: {
    STAGE_COMPLETED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      stage: string
    ) => ({
      title: "📦 Üretim Aşaması Tamamlandı",
      message: `${entityType} #${entityNumber} - ${stage} aşaması tamamlandı`,
    }),
    STAGE_STARTED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      stage: string
    ) => ({
      title: "🚀 Yeni Aşama Başladı",
      message: `${entityType} #${entityNumber} - ${stage} aşaması başladı`,
    }),
    STAGE_APPROVED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      stage: string
    ) => ({
      title: "✅ Aşama Onaylandı",
      message: `${entityType} #${entityNumber} - ${stage} aşaması onaylandı`,
    }),
    STAGE_REJECTED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      stage: string,
      reason?: string
    ) => ({
      title: "❌ Aşama Reddedildi",
      message: reason
        ? `${entityType} #${entityNumber} - ${stage} reddedildi: ${reason}`
        : `${entityType} #${entityNumber} - ${stage} aşaması reddedildi`,
    }),
    DEADLINE_APPROACHING: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      hours: number
    ) => ({
      title: "⚠️ Deadline Yaklaşıyor",
      message: `${entityType} #${entityNumber} için ${hours.toFixed(1)} saat kaldı`,
    }),
    OVERDUE: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      days: number
    ) => ({
      title: "🚨 Üretim Gecikti",
      message: `${entityType} #${entityNumber} ${days} gün gecikmiş durumda!`,
    }),
    NOTE_ADDED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      by: string
    ) => ({
      title: "📝 Yeni Not Eklendi",
      message: `${entityType} #${entityNumber} için ${by} tarafından not eklendi`,
    }),
    DATE_CHANGED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      newDate: Date
    ) => ({
      title: "📅 Tahmini Tarih Değişti",
      message: `${entityType} #${entityNumber} için yeni tarih: ${newDate.toLocaleDateString("tr-TR")}`,
    }),
  },

  QUALITY: {
    ISSUE_FOUND: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      issue: string
    ) => ({
      title: "⚠️ Kalite Sorunu Tespit Edildi",
      message: `${entityType} #${entityNumber} - ${issue}`,
    }),
    APPROVED: (entityType: "Order" | "Sample", entityNumber: string) => ({
      title: "✅ Kalite Kontrolden Geçti",
      message: `${entityType} #${entityNumber} kalite kontrolden başarıyla geçti`,
    }),
    REJECTED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      reason: string
    ) => ({
      title: "❌ Kalite Kontrolden Geçemedi",
      message: `${entityType} #${entityNumber} - ${reason}`,
    }),
    INSPECTION_SCHEDULED: (
      entityType: "Order" | "Sample",
      entityNumber: string,
      date: Date
    ) => ({
      title: "🔍 Kalite Kontrolü Planlandı",
      message: `${entityType} #${entityNumber} için ${date.toLocaleDateString("tr-TR")} tarihinde kontrol`,
    }),
  },

  MESSAGE: {
    NEW_MESSAGE: (senderName: string) => ({
      title: "💬 Yeni Mesaj",
      message: `${senderName} tarafından yeni mesaj`,
    }),
    QUESTION: (topic: string, asker: string) => ({
      title: "❓ Yeni Soru",
      message: `${asker} tarafından ${topic} hakkında soru soruldu`,
    }),
    ANSWER: (topic: string) => ({
      title: "✅ Soru Yanıtlandı",
      message: `${topic} hakkındaki sorunuz yanıtlandı`,
    }),
  },

  REVIEW: {
    NEW_REVIEW: (rating: number, customerName: string) => ({
      title: "⭐ Yeni Değerlendirme",
      message: `${customerName} tarafından ${rating} yıldız değerlendirme yapıldı`,
    }),
    REVIEW_RESPONSE: (companyName: string) => ({
      title: "💬 Değerlendirmenize Yanıt Verildi",
      message: `${companyName} değerlendirmenize yanıt verdi`,
    }),
  },

  WORKSHOP: {
    NEW_ASSIGNMENT: (
      workshopType: string,
      entityType: "Order" | "Sample",
      entityNumber: string
    ) => ({
      title: "🏭 Yeni Atölye Ataması",
      message: `${workshopType} - ${entityType} #${entityNumber} atandı`,
    }),
    STATUS_UPDATED: (workshopName: string, newStatus: string) => ({
      title: "🏭 Atölye Durumu Güncellendi",
      message: `${workshopName} - Durum: ${newStatus}`,
    }),
  },

  SYSTEM: {
    ACCOUNT_APPROVED: () => ({
      title: "✅ Hesabınız Onaylandı",
      message: "Hoş geldiniz! Hesabınız onaylandı, platformu kullanmaya başlayabilirsiniz",
    }),
    ACCOUNT_REJECTED: (reason?: string) => ({
      title: "❌ Hesap Başvurusu Reddedildi",
      message: reason
        ? `Üzgünüz, hesap başvurunuz reddedildi. Sebep: ${reason}`
        : "Üzgünüz, hesap başvurunuz onaylanmadı",
    }),
    ROLE_CHANGED: (newRole: string) => ({
      title: "🔄 Rol Değişikliği",
      message: `Rolünüz ${newRole} olarak güncellendi`,
    }),
    COMPANY_APPROVED: (companyName: string) => ({
      title: "✅ Firma Onaylandı",
      message: `${companyName} firması onaylandı`,
    }),
  },

  COLLECTION: {
    NEW_COLLECTION: (collectionName: string, authorName: string) => ({
      title: "✨ Yeni Koleksiyon",
      message: `${authorName} tarafından ${collectionName} koleksiyonu eklendi`,
    }),
    COLLECTION_UPDATED: (collectionName: string) => ({
      title: "📝 Koleksiyon Güncellendi",
      message: `${collectionName} koleksiyonu güncellendi`,
    }),
    COLLECTION_LIKED: (collectionName: string, userName: string) => ({
      title: "❤️ Koleksiyon Beğenildi",
      message: `${userName} ${collectionName} koleksiyonunuzu beğendi`,
    }),
  },
};

/**
 * Helper type for notification template results
 */
export type NotificationTemplate = {
  title: string;
  message: string;
};

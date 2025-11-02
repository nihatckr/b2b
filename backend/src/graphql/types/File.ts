/**
 * ============================================================================
 * FILE TYPE
 * ============================================================================
 * Dosya: File.ts
 * Amaç: Dosya Yönetimi (File) GraphQL type tanımı
 * Versiyon: 2.0.0
 *
 * Sistem Açıklaması:
 * Sisteme yüklenen tüm dosyaların (görseller, dokümanlar, teknik paketler)
 * metadata bilgilerini tutar.
 *
 * Dosya Tipleri:
 * - Görseller: JPG, PNG, WEBP (ürün fotoğrafları, tasarımlar)
 * - Dokümanlar: PDF (teknik paketler, sözleşmeler, dekontlar)
 * - Arşiv: ZIP (toplu dosya paylaşımı)
 *
 * Özellikler:
 * - Multer ile backend upload
 * - Sharp ile görsel optimizasyonu
 * - Metadata takibi (boyut, mimetype, encoding)
 * - Açıklama/etiketleme desteği
 *
 * Not: GraphQL'de "FileRecord" olarak expose edilir (File scalar ile çakışma önlenir)
 * ============================================================================
 */

import builder from "../builder";

/**
 * File Type - Dosya Yönetimi Entity
 *
 * Prisma object (numeric ID)
 * GraphQL'de "FileRecord" olarak expose edilir
 */
export const File = builder.prismaObject("File", {
  name: "FileRecord",
  fields: (t) => ({
    /** Benzersiz dosya ID'si */
    id: t.exposeID("id"),

    /** Orijinal dosya adı */
    filename: t.exposeString("filename"),

    /** Sunucudaki dosya yolu (relative path) */
    path: t.exposeString("path"),

    /** Dosya boyutu (bytes) */
    size: t.exposeInt("size"),

    /** MIME tipi (image/jpeg, application/pdf vb.) */
    mimetype: t.exposeString("mimetype"),

    /** Encoding (utf-8, base64 vb.) */
    encoding: t.exposeString("encoding", { nullable: true }),

    /** Dosya açıklaması/notlar */
    description: t.exposeString("description", { nullable: true }),

    /** Dosya yüklenme zamanı */
    createdAt: t.expose("createdAt", { type: "DateTime" }),

    /** Son güncelleme zamanı */
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

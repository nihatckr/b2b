/**
 * File Queries - FILE MANAGEMENT SYSTEM
 *
 * 🎯 Amaç: Dosya listeleme, sorgulama
 *
 * 📋 Mevcut Query'ler:
 * - files: Tüm dosyalar (paginated)
 * - file: Tek dosya ID ile
 * - filesByMimetype: Dosyaları tip ile filtrele (image/*, application/pdf, etc.)
 *
 * 🔒 Güvenlik:
 * - Tüm query'ler doğrulanmış kullanıcı gerektirir
 *
 * 💡 Özellikler:
 * - Pagination desteği
 * - Mimetype filtering
 * - Search by filename
 */

import { handleError, requireAuth } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const FileFilterInput = builder.inputType("FileFilterInput", {
  fields: (t) => ({
    mimetype: t.string(),
    search: t.string(),
  }),
});

const FilePaginationInput = builder.inputType("FilePaginationInput", {
  fields: (t) => ({
    skip: t.int(),
    take: t.int(),
  }),
});

// ========================================
// FILE QUERIES
// ========================================

/**
 * QUERY: files
 *
 * Açıklama: Tüm dosyaları listele (paginated)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: File[]
 */
builder.queryField("files", (t) =>
  t.prismaField({
    type: ["File"],
    args: {
      filter: t.arg({ type: FileFilterInput }),
      pagination: t.arg({ type: FilePaginationInput }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("files");
      try {
        requireAuth(ctx.user?.id);

        const where: any = {};

        // Filters
        if (args.filter?.mimetype) {
          const mimetype = sanitizeString(args.filter.mimetype);
          where.mimetype = { contains: mimetype };
        }

        if (args.filter?.search) {
          const search = sanitizeString(args.filter.search);
          where.filename = { contains: search };
        }

        const files = await ctx.prisma.file.findMany({
          ...query,
          where,
          orderBy: { createdAt: "desc" },
          skip: args.pagination?.skip || 0,
          take: args.pagination?.take || 50,
        });

        logInfo("Files listed", {
          count: files.length,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        return files;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * QUERY: file
 *
 * Açıklama: Tek dosya getir (ID ile)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: File
 */
builder.queryField("file", (t) =>
  t.prismaField({
    type: "File",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("file");
      try {
        requireAuth(ctx.user?.id);

        const fileId = sanitizeString(args.id);

        const file = await ctx.prisma.file.findUnique({
          ...query,
          where: { id: fileId! },
        });

        logInfo("File retrieved", {
          fileId,
          found: !!file,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        return file;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * QUERY: filesByMimetype
 *
 * Açıklama: Dosyaları mimetype ile filtrele
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: File[]
 */
builder.queryField("filesByMimetype", (t) =>
  t.prismaField({
    type: ["File"],
    args: {
      mimetype: t.arg.string({ required: true }),
      limit: t.arg.int(),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("filesByMimetype");
      try {
        requireAuth(ctx.user?.id);

        const mimetype = sanitizeString(args.mimetype);
        const limit = args.limit ? sanitizeInt(args.limit) : 50;

        const files = await ctx.prisma.file.findMany({
          ...query,
          where: {
            mimetype: { contains: mimetype! },
          },
          orderBy: { createdAt: "desc" },
          take: limit!,
        });

        logInfo("Files by mimetype retrieved", {
          mimetype,
          count: files.length,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        return files;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

/**
 * QUERY: fileStats
 *
 * Açıklama: Dosya istatistikleri (toplam dosya sayısı, boyut)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: JSON
 */
builder.queryField("fileStats", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: async (_root, _args, ctx) => {
      const timer = createTimer("fileStats");
      try {
        requireAuth(ctx.user?.id);

        const [totalFiles, totalSize, byMimetype] = await Promise.all([
          ctx.prisma.file.count(),
          ctx.prisma.file.aggregate({
            _sum: { size: true },
          }),
          ctx.prisma.file.groupBy({
            by: ["mimetype"],
            _count: { mimetype: true },
            _sum: { size: true },
          }),
        ]);

        const stats = {
          totalFiles,
          totalSizeBytes: totalSize._sum.size || 0,
          totalSizeMB:
            Math.round(((totalSize._sum.size || 0) / 1024 / 1024) * 100) / 100,
          byMimetype: byMimetype.map((m) => ({
            mimetype: m.mimetype,
            count: m._count.mimetype,
            sizeBytes: m._sum.size || 0,
            sizeMB: Math.round(((m._sum.size || 0) / 1024 / 1024) * 100) / 100,
          })),
        };

        logInfo("File stats retrieved", {
          totalFiles,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        return stats;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

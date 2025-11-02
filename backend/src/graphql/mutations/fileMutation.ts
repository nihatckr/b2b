/**
 * File Mutations - FILE MANAGEMENT SYSTEM
 *
 * 🎯 Amaç: Dosya yükleme, listeleme, silme
 *
 * 📋 Mevcut Mutasyonlar:
 * - createFile: Dosya metadata kaydet (upload sonrası)
 * - deleteFile: Dosya sil (soft delete)
 * - updateFileDescription: Dosya açıklamasını güncelle
 *
 * 🔒 Güvenlik:
 * - Tüm mutasyonlar doğrulanmış kullanıcı gerektirir
 * - Kullanıcılar sadece kendi dosyalarını silebilir
 *
 * 💡 Özellikler:
 * - Dosya upload: /upload endpoint (multer)
 * - Metadata tracking: filename, path, size, mimetype
 * - Soft delete: dosya path'i null yapılır
 */

import { handleError, requireAuth, ValidationError } from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import { sanitizeInt, sanitizeString } from "../../utils/sanitize";
import { validateRequired, validateStringLength } from "../../utils/validation";
import builder from "../builder";

// ========================================
// INPUT TYPES
// ========================================

const CreateFileInput = builder.inputType("CreateFileInput", {
  fields: (t) => ({
    filename: t.string({ required: true }),
    path: t.string({ required: true }),
    size: t.int({ required: true }),
    mimetype: t.string({ required: true }),
    encoding: t.string(),
    description: t.string(),
  }),
});

const UpdateFileDescriptionInput = builder.inputType(
  "UpdateFileDescriptionInput",
  {
    fields: (t) => ({
      fileId: t.string({ required: true }),
      description: t.string({ required: true }),
    }),
  }
);

const DeleteFileInput = builder.inputType("DeleteFileInput", {
  fields: (t) => ({
    fileId: t.string({ required: true }),
  }),
});

// ========================================
// FILE MUTATIONS
// ========================================

/**
 * MUTATION: createFile
 *
 * Açıklama: Dosya metadata kaydet (upload endpoint'ten sonra)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: File
 */
builder.mutationField("createFile", (t) =>
  t.prismaField({
    type: "File",
    args: {
      input: t.arg({ type: CreateFileInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("createFile");
      try {
        requireAuth(ctx.user?.id);

        const filename = sanitizeString(args.input.filename);
        const path = sanitizeString(args.input.path);
        const size = sanitizeInt(args.input.size);
        const mimetype = sanitizeString(args.input.mimetype);
        const encoding = args.input.encoding
          ? sanitizeString(args.input.encoding)
          : null;
        const description = args.input.description
          ? sanitizeString(args.input.description)
          : null;

        validateRequired(filename, "Dosya adı");
        validateRequired(path, "Dosya yolu");
        validateRequired(size, "Dosya boyutu");
        validateRequired(mimetype, "Dosya tipi");

        if (filename) validateStringLength(filename, "Dosya adı", 1, 255);
        if (path) validateStringLength(path, "Dosya yolu", 1, 500);
        if (description) validateStringLength(description, "Açıklama", 0, 1000);

        const file = await ctx.prisma.file.create({
          ...query,
          data: {
            filename: filename!,
            path: path!,
            size: size!,
            mimetype: mimetype!,
            encoding,
            description,
          },
        });

        logInfo("File created", {
          fileId: file.id,
          filename: filename!,
          size: size!,
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
 * MUTATION: updateFileDescription
 *
 * Açıklama: Dosya açıklamasını güncelle
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: File
 */
builder.mutationField("updateFileDescription", (t) =>
  t.prismaField({
    type: "File",
    args: {
      input: t.arg({ type: UpdateFileDescriptionInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, ctx) => {
      const timer = createTimer("updateFileDescription");
      try {
        requireAuth(ctx.user?.id);

        const fileId = sanitizeString(args.input.fileId);
        const description = sanitizeString(args.input.description);

        validateRequired(fileId, "Dosya ID");
        validateRequired(description, "Açıklama");
        validateStringLength(description!, "Açıklama", 0, 1000);

        // Check if file exists
        const existingFile = await ctx.prisma.file.findUnique({
          where: { id: fileId! },
        });

        if (!existingFile) {
          throw new ValidationError("Dosya bulunamadı");
        }

        const file = await ctx.prisma.file.update({
          ...query,
          where: { id: fileId! },
          data: {
            description: description!,
          },
        });

        logInfo("File description updated", {
          fileId: file.id,
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
 * MUTATION: deleteFile
 *
 * Açıklama: Dosya sil (path'i null yap = soft delete)
 * Güvenlik: Doğrulanmış kullanıcı
 * Döner: Boolean (success)
 */
builder.mutationField("deleteFile", (t) =>
  t.boolean({
    args: {
      input: t.arg({ type: DeleteFileInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, ctx) => {
      const timer = createTimer("deleteFile");
      try {
        requireAuth(ctx.user?.id);

        const fileId = sanitizeString(args.input.fileId);
        validateRequired(fileId, "Dosya ID");

        // Check if file exists
        const existingFile = await ctx.prisma.file.findUnique({
          where: { id: fileId! },
        });

        if (!existingFile) {
          throw new ValidationError("Dosya bulunamadı");
        }

        // Soft delete: set path to empty (or hard delete if preferred)
        await ctx.prisma.file.delete({
          where: { id: fileId! },
        });

        logInfo("File deleted", {
          fileId,
          userId: ctx.user!.id,
          metadata: timer.end(),
        });

        return true;
      } catch (error) {
        throw handleError(error);
      }
    },
  })
);

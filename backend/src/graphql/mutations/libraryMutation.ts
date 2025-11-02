/**
 * Library Mutations - UNIFIED LIBRARY SYSTEM MANAGEMENT
 *
 * 🎯 Purpose: Textile industry library item management
 *
 * 📋 Available Mutations:
 *
 * STANDARD MUTATIONS:
 * - createLibraryItem: Create new library item (authenticated users)
 * - updateLibraryItem: Update library item (admin or company owner)
 * - deleteLibraryItem: Soft delete library item (admin or company owner)
 *
 * BULK OPERATIONS (Admin Only):
 * - bulkUpdateLibraryItems: Update multiple items at once
 * - bulkToggleLibraryStatus: Activate/deactivate multiple items
 * - bulkDeleteLibraryItems: Soft delete multiple items
 *
 * 🔒 Security:
 * - Create: Authenticated users (PLATFORM_STANDARD = admin only, COMPANY_CUSTOM = company members)
 * - Update: Admin (platform standards) or company owner (custom items)
 * - Delete: Admin (platform standards) or company owner (custom items)
 * - Bulk operations: Admin only
 *
 * 💡 Features:
 * - Unified library system (replaces old StandardCategory/CompanyCategory)
 * - 15 category types (SEASON, COLOR, FIT, FABRIC, MATERIAL, etc.)
 * - Platform standards vs company custom items
 * - Normalized fields (gender, fitCategory, sizeCategory, etc.)
 * - Fabric-specific fields (fiberType, fabricWeight, fabricWidth)
 * - Material-specific fields (materialType)
 * - Color-specific fields (hexColor, colorFamily)
 * - Certification linking (many-to-many)
 * - JSON data field for flexible attributes
 * - Duplicate prevention (code uniqueness, name+category+company checks)
 * - SEASON special handling (type+year combination checks)
 *
 * 📊 Categories:
 * - SEASON, COLOR, FIT, TREND, SIZE_GROUP, SIZE_BREAKDOWN
 * - FABRIC, MATERIAL, PRINT, WASH_EFFECT, CERTIFICATION
 * - PACKAGING_TYPE, LABELING_TYPE, PAYMENT_TERMS, QUALITY_STANDARD
 */

import {
  ForbiddenError,
  handleError,
  requireAuth,
  ValidationError,
} from "../../utils/errors";
import { createTimer, logInfo } from "../../utils/logger";
import {
  sanitizeBoolean,
  sanitizeInt,
  sanitizeString,
} from "../../utils/sanitize";
import {
  validateEnum,
  validateIdArray,
  validateJSON,
  validateRequired,
  validateStringLength,
} from "../../utils/validation";
import builder from "../builder";

// ========================================
// UNIFIED LIBRARY MUTATIONS
// ========================================

// Valid Enum Values
const ValidLibraryCategories = [
  "SEASON",
  "COLOR",
  "FIT",
  "TREND",
  "SIZE_GROUP",
  "SIZE_BREAKDOWN",
  "FABRIC",
  "MATERIAL",
  "PRINT",
  "WASH_EFFECT",
  "CERTIFICATION",
  "PACKAGING_TYPE",
  "LABELING_TYPE",
  "PAYMENT_TERMS",
  "QUALITY_STANDARD",
];

const ValidLibraryScopes = ["PLATFORM_STANDARD", "COMPANY_CUSTOM"];

const ValidGenders = ["MEN", "WOMEN", "BOYS", "GIRLS", "UNISEX"];
const ValidFitCategories = ["TOP", "BOTTOM", "DRESS", "OUTERWEAR"];
const ValidSizeCategories = ["TOP", "BOTTOM", "DRESS", "OUTERWEAR", "KIDS"];
const ValidFiberTypes = [
  "COTTON",
  "POLYESTER",
  "WOOL",
  "LINEN",
  "SILK",
  "BLEND",
];
const ValidMaterialTypes = [
  "BUTTON",
  "ZIPPER",
  "LABEL",
  "THREAD",
  "TRIM",
  "ELASTIC",
];
const ValidColorFamilies = [
  "NEUTRAL",
  "WARM",
  "COOL",
  "EARTH",
  "PASTEL",
  "BRIGHT",
];

// Input for creating library items
const CreateLibraryItemInput = builder.inputType("CreateLibraryItemInput", {
  fields: (t) => ({
    // Schema: LibraryCategory (Enum - Required)
    category: t.field({ type: "String", required: true }),
    // Schema: LibraryScope (Enum - Default: COMPANY_CUSTOM)
    scope: t.field({ type: "String", required: true }),
    // Schema: String? @unique
    code: t.string({ required: false }),
    // Schema: String (Required)
    name: t.string({ required: true }),
    // Schema: String? @db.Text
    description: t.string({ required: false }),
    // Schema: String? @db.Text
    imageUrl: t.string({ required: false }),
    // Schema: Json?
    data: t.string({ required: false }),
    // Schema: String? @db.Text
    notes: t.string({ required: false }),
    // Schema: Boolean @default(true)
    isActive: t.boolean({ required: false }),
    // Schema: Boolean @default(false)
    isPopular: t.boolean({ required: false }),
    // Schema: Int? (Foreign key to Company)
    companyId: t.int({ required: false }),
    // Schema: Int? (Foreign key to LibraryItem)
    standardItemId: t.int({ required: false }),

    // ========================================
    // FILTRELEME ALANLARI (Normalized Fields)
    // ========================================
    // Schema: String? (MEN, WOMEN, BOYS, GIRLS, UNISEX)
    gender: t.string({ required: false }),
    // Schema: String? (TOP, BOTTOM, DRESS, OUTERWEAR)
    fitCategory: t.string({ required: false }),
    // Schema: String? (TOP, BOTTOM, DRESS, OUTERWEAR, KIDS)
    sizeCategory: t.string({ required: false }),

    // ========================================
    // FABRIC ALANLARI (Optimized Fields)
    // ========================================
    // Schema: String? (COTTON, POLYESTER, WOOL, LINEN, SILK, BLEND)
    fiberType: t.string({ required: false }),
    // Schema: Int? (gram/m²)
    fabricWeight: t.int({ required: false }),
    // Schema: Int? (cm)
    fabricWidth: t.int({ required: false }),

    // ========================================
    // MATERIAL ALANLARI (Optimized Fields)
    // ========================================
    // Schema: String? (BUTTON, ZIPPER, LABEL, THREAD, TRIM, ELASTIC)
    materialType: t.string({ required: false }),

    // ========================================
    // COLOR ALANLARI (Optimized Fields)
    // ========================================
    // Schema: String? (#FFFFFF)
    hexColor: t.string({ required: false }),
    // Schema: String? (NEUTRAL, WARM, COOL, EARTH, PASTEL, BRIGHT)
    colorFamily: t.string({ required: false }),

    // 🔗 Certification IDs (Many-to-Many relation)
    certificationIds: t.intList({ required: false }),
  }),
});

// Input for updating library items
const UpdateLibraryItemInput = builder.inputType("UpdateLibraryItemInput", {
  fields: (t) => ({
    // Schema: String? @unique
    code: t.string({ required: false }),
    // Schema: String
    name: t.string({ required: false }),
    // Schema: String? @db.Text
    description: t.string({ required: false }),
    // Schema: String? @db.Text
    imageUrl: t.string({ required: false }),
    // Schema: Json?
    data: t.string({ required: false }),
    // Schema: String? @db.Text
    notes: t.string({ required: false }),
    // Schema: Boolean @default(true)
    isActive: t.boolean({ required: false }),
    // Schema: Boolean @default(false)
    isPopular: t.boolean({ required: false }),

    // ========================================
    // FILTRELEME ALANLARI (Normalized Fields)
    // ========================================
    // Schema: String? (MEN, WOMEN, BOYS, GIRLS, UNISEX)
    gender: t.string({ required: false }),
    // Schema: String? (TOP, BOTTOM, DRESS, OUTERWEAR)
    fitCategory: t.string({ required: false }),
    // Schema: String? (TOP, BOTTOM, DRESS, OUTERWEAR, KIDS)
    sizeCategory: t.string({ required: false }),

    // ========================================
    // FABRIC ALANLARI (Optimized Fields)
    // ========================================
    // Schema: String? (COTTON, POLYESTER, WOOL, LINEN, SILK, BLEND)
    fiberType: t.string({ required: false }),
    // Schema: Int? (gram/m²)
    fabricWeight: t.int({ required: false }),
    // Schema: Int? (cm)
    fabricWidth: t.int({ required: false }),

    // ========================================
    // MATERIAL ALANLARI (Optimized Fields)
    // ========================================
    // Schema: String? (BUTTON, ZIPPER, LABEL, THREAD, TRIM, ELASTIC)
    materialType: t.string({ required: false }),

    // ========================================
    // COLOR ALANLARI (Optimized Fields)
    // ========================================
    // Schema: String? (#FFFFFF)
    hexColor: t.string({ required: false }),
    // Schema: String? (NEUTRAL, WARM, COOL, EARTH, PASTEL, BRIGHT)
    colorFamily: t.string({ required: false }),

    // 🔗 Certification IDs (Many-to-Many relation)
    certificationIds: t.intList({ required: false }),
  }),
});

// Create Library Item
builder.mutationField("createLibraryItem", (t) =>
  t.prismaField({
    type: "LibraryItem",
    args: {
      input: t.arg({ type: CreateLibraryItemInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("createLibraryItem");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);

        const input = args.input;

        // ========================================
        // SANITIZATION
        // ========================================
        const category = sanitizeString(input.category);
        const scope = sanitizeString(input.scope);
        const code = input.code ? sanitizeString(input.code) : undefined;
        const name = sanitizeString(input.name);
        const description = input.description
          ? sanitizeString(input.description)
          : undefined;
        const imageUrl = input.imageUrl
          ? sanitizeString(input.imageUrl)
          : undefined;
        const notes = input.notes ? sanitizeString(input.notes) : undefined;
        const isActive =
          input.isActive !== undefined ? sanitizeBoolean(input.isActive) : true;
        const isPopular =
          input.isPopular !== undefined
            ? sanitizeBoolean(input.isPopular)
            : false;
        const itemCompanyId = input.companyId
          ? sanitizeInt(input.companyId)
          : undefined;
        const standardItemId = input.standardItemId
          ? sanitizeInt(input.standardItemId)
          : undefined;

        // Normalized fields
        const gender = input.gender ? sanitizeString(input.gender) : undefined;
        const fitCategory = input.fitCategory
          ? sanitizeString(input.fitCategory)
          : undefined;
        const sizeCategory = input.sizeCategory
          ? sanitizeString(input.sizeCategory)
          : undefined;
        const fiberType = input.fiberType
          ? sanitizeString(input.fiberType)
          : undefined;
        const fabricWeight = input.fabricWeight
          ? sanitizeInt(input.fabricWeight)
          : undefined;
        const fabricWidth = input.fabricWidth
          ? sanitizeInt(input.fabricWidth)
          : undefined;
        const materialType = input.materialType
          ? sanitizeString(input.materialType)
          : undefined;
        const hexColor = input.hexColor
          ? sanitizeString(input.hexColor)
          : undefined;
        const colorFamily = input.colorFamily
          ? sanitizeString(input.colorFamily)
          : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        validateRequired(category, "category");
        validateRequired(scope, "scope");
        validateRequired(name, "name");

        validateEnum(category, "category", ValidLibraryCategories);
        validateEnum(scope, "scope", ValidLibraryScopes);

        validateStringLength(name, "name", 2, 200);
        if (description)
          validateStringLength(description, "description", 0, 5000);
        if (code) validateStringLength(code, "code", 1, 100);
        if (notes) validateStringLength(notes, "notes", 0, 2000);

        // Enum validations for normalized fields
        if (gender) validateEnum(gender, "gender", ValidGenders);
        if (fitCategory)
          validateEnum(fitCategory, "fitCategory", ValidFitCategories);
        if (sizeCategory)
          validateEnum(sizeCategory, "sizeCategory", ValidSizeCategories);
        if (fiberType) validateEnum(fiberType, "fiberType", ValidFiberTypes);
        if (materialType)
          validateEnum(materialType, "materialType", ValidMaterialTypes);
        if (colorFamily)
          validateEnum(colorFamily, "colorFamily", ValidColorFamilies);

        // Certification IDs validation
        if (input.certificationIds && input.certificationIds.length > 0) {
          validateIdArray(input.certificationIds, "certificationIds", 100);
        }

        // JSON data validation
        let dataJson = null;
        if (input.data) {
          validateJSON(input.data, "data");
          dataJson = JSON.parse(input.data);
        }

        // ========================================
        // BUSINESS LOGIC
        // ========================================

        // Check if code already exists (skip for SEASON)
        if (code && category !== "SEASON") {
          const existingItem = await context.prisma.libraryItem.findUnique({
            where: { code },
          });

          if (existingItem) {
            throw new ValidationError(
              `Bu kod zaten mevcut: "${code}". ` +
                `Mevcut item: "${existingItem.name}" (${existingItem.category}). ` +
                `Lütfen farklı bir kod kullanın veya mevcut item'ı düzenleyin.`
            );
          }
        }

        // Determine company ID
        const companyId = itemCompanyId || context.user.companyId || null;

        // Special check for SEASON category - check by type + year combination
        if (category === "SEASON" && dataJson) {
          const seasonData = dataJson as any;
          if (seasonData.type && seasonData.year) {
            // Get all seasons and check in JavaScript since JSON path queries are complex
            const existingSeasons = await context.prisma.libraryItem.findMany({
              where: {
                category: "SEASON",
                companyId: companyId,
                isActive: true,
              },
            });

            // Check if any existing season has the same type and year
            for (const existingSeason of existingSeasons) {
              const existingData = existingSeason.data as any;
              if (
                existingData &&
                existingData.type === seasonData.type &&
                existingData.year === seasonData.year
              ) {
                const seasonTypeName =
                  seasonData.type === "SS" ? "Spring/Summer" : "Fall/Winter";
                throw new ValidationError(
                  `${seasonTypeName} ${seasonData.year} sezonu zaten mevcut! ` +
                    `Aynı yılın aynı sezonunu tekrar kaydedemezsiniz. ` +
                    `Mevcut sezonu düzenlemek isterseniz library sayfasından düzenleyebilirsiniz.`
                );
              }
            }
          }
        }

        // Check if similar item already exists (same name + category + company)
        if (name) {
          const existingSimilar = await context.prisma.libraryItem.findFirst({
            where: {
              name,
              category: category as any,
              companyId: companyId,
              isActive: true,
            },
          });

          if (existingSimilar) {
            // Special message for SEASON category
            if (category === "SEASON") {
              throw new ValidationError(
                `Bu sezon zaten mevcut: "${name}". ` +
                  `Aynı sezonu tekrar kaydedemezsiniz. ` +
                  `Mevcut sezonu düzenlemek isterseniz library sayfasından düzenleyebilirsiniz.`
              );
            } else {
              throw new ValidationError(
                `Bu isimde bir ${category?.toLowerCase()} zaten mevcut: "${name}". ` +
                  `Kod: ${existingSimilar.code || "Yok"}. ` +
                  `Lütfen farklı bir isim kullanın veya mevcut item'ı düzenleyin.`
              );
            }
          }
        }

        // ========================================
        // DATABASE OPERATION
        // ========================================
        try {
          const libraryItem = await context.prisma.libraryItem.create({
            ...query,
            data: {
              category: category! as any,
              scope: scope! as any,
              code:
                category === "SEASON"
                  ? `SEASON-${Date.now()}` // Always unique for SEASON
                  : code || null,
              name: name!,
              description: description || null,
              imageUrl: imageUrl || null,
              ...(dataJson !== null && { data: dataJson }),
              notes: notes || null,
              isActive: isActive!,
              isPopular: isPopular!,
              companyId: companyId,
              standardItemId: standardItemId || null,
              createdById: context.user.id,
              // Normalized fields
              gender: gender || null,
              fitCategory: fitCategory || null,
              sizeCategory: sizeCategory || null,
              fiberType: fiberType || null,
              fabricWeight: fabricWeight || null,
              fabricWidth: fabricWidth || null,
              materialType: materialType || null,
              hexColor: hexColor || null,
              colorFamily: colorFamily || null,
              // 🔗 Connect certifications
              ...(input.certificationIds &&
                input.certificationIds.length > 0 && {
                  certifications: {
                    connect: input.certificationIds.map((id) => ({ id })),
                  },
                }),
            },
          });

          // ========================================
          // LOGGING
          // ========================================
          logInfo("Library item oluşturuldu", {
            userId: context.user.id,
            libraryItemId: libraryItem.id,
            category: libraryItem.category,
            name: libraryItem.name,
            scope: libraryItem.scope,
          });

          timer.end({ success: true });
          return libraryItem;
        } catch (error: any) {
          // Handle unique constraint error for SEASON category
          if (
            category === "SEASON" &&
            error.code === "P2002" &&
            error.meta?.target?.includes("code")
          ) {
            // Generate a unique code with timestamp for SEASON
            const timestamp = Date.now().toString();
            const retryItem = await context.prisma.libraryItem.create({
              ...query,
              data: {
                category: category! as any,
                scope: scope! as any,
                code: `SEASON-${timestamp}`, // Unique code with timestamp
                name: name!,
                description: description || null,
                imageUrl: imageUrl || null,
                ...(dataJson !== null && { data: dataJson }),
                notes: notes || null,
                isActive: isActive!,
                isPopular: isPopular!,
                companyId: companyId,
                standardItemId: standardItemId || null,
                createdById: context.user.id,
                // Normalized fields
                gender: gender || null,
                fitCategory: fitCategory || null,
                sizeCategory: sizeCategory || null,
                fiberType: fiberType || null,
                fabricWeight: fabricWeight || null,
                fabricWidth: fabricWidth || null,
                materialType: materialType || null,
                hexColor: hexColor || null,
                colorFamily: colorFamily || null,
                // 🔗 Connect certifications
                ...(input.certificationIds &&
                  input.certificationIds.length > 0 && {
                    certifications: {
                      connect: input.certificationIds.map((id) => ({ id })),
                    },
                  }),
              },
            });

            logInfo("Library item oluşturuldu (retry)", {
              userId: context.user.id,
              libraryItemId: retryItem.id,
              category: retryItem.category,
            });

            timer.end({ success: true });
            return retryItem;
          }

          // Re-throw other errors
          throw error;
        }
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Update Library Item
builder.mutationField("updateLibraryItem", (t) =>
  t.prismaField({
    type: "LibraryItem",
    args: {
      id: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateLibraryItemInput, required: true }),
    },
    authScopes: { user: true },
    resolve: async (query, _root, args, context) => {
      const timer = createTimer("updateLibraryItem");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);

        const id = sanitizeInt(args.id)!;
        const input = args.input;

        // Fetch existing item
        const existing = await context.prisma.libraryItem.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new ValidationError(`Library item (ID: ${id}) bulunamadı`);
        }

        // Permission check
        if (existing.scope === "COMPANY_CUSTOM") {
          if (existing.companyId !== context.user.companyId) {
            throw new ValidationError("Bu item'ı güncelleme yetkiniz yok");
          }
        } else if (existing.scope === "PLATFORM_STANDARD") {
          if (context.user.role !== "ADMIN") {
            throw new ValidationError(
              "Platform standartlarını sadece adminler güncelleyebilir"
            );
          }
        }

        // ========================================
        // SANITIZATION
        // ========================================
        const code =
          input.code !== undefined ? sanitizeString(input.code) : undefined;
        const name =
          input.name !== undefined ? sanitizeString(input.name) : undefined;
        const description =
          input.description !== undefined
            ? sanitizeString(input.description)
            : undefined;
        const imageUrl =
          input.imageUrl !== undefined
            ? sanitizeString(input.imageUrl)
            : undefined;
        const notes =
          input.notes !== undefined ? sanitizeString(input.notes) : undefined;
        const isActive =
          input.isActive !== undefined
            ? sanitizeBoolean(input.isActive)
            : undefined;
        const isPopular =
          input.isPopular !== undefined
            ? sanitizeBoolean(input.isPopular)
            : undefined;

        // Normalized fields
        const gender =
          input.gender !== undefined ? sanitizeString(input.gender) : undefined;
        const fitCategory =
          input.fitCategory !== undefined
            ? sanitizeString(input.fitCategory)
            : undefined;
        const sizeCategory =
          input.sizeCategory !== undefined
            ? sanitizeString(input.sizeCategory)
            : undefined;
        const fiberType =
          input.fiberType !== undefined
            ? sanitizeString(input.fiberType)
            : undefined;
        const fabricWeight =
          input.fabricWeight !== undefined
            ? sanitizeInt(input.fabricWeight)
            : undefined;
        const fabricWidth =
          input.fabricWidth !== undefined
            ? sanitizeInt(input.fabricWidth)
            : undefined;
        const materialType =
          input.materialType !== undefined
            ? sanitizeString(input.materialType)
            : undefined;
        const hexColor =
          input.hexColor !== undefined
            ? sanitizeString(input.hexColor)
            : undefined;
        const colorFamily =
          input.colorFamily !== undefined
            ? sanitizeString(input.colorFamily)
            : undefined;

        // ========================================
        // VALIDATION
        // ========================================
        if (name !== undefined) validateStringLength(name, "name", 2, 200);
        if (description !== undefined)
          validateStringLength(description, "description", 0, 5000);
        if (code !== undefined) validateStringLength(code, "code", 1, 100);
        if (notes !== undefined) validateStringLength(notes, "notes", 0, 2000);

        // Enum validations for normalized fields
        if (gender !== undefined) validateEnum(gender, "gender", ValidGenders);
        if (fitCategory !== undefined)
          validateEnum(fitCategory, "fitCategory", ValidFitCategories);
        if (sizeCategory !== undefined)
          validateEnum(sizeCategory, "sizeCategory", ValidSizeCategories);
        if (fiberType !== undefined)
          validateEnum(fiberType, "fiberType", ValidFiberTypes);
        if (materialType !== undefined)
          validateEnum(materialType, "materialType", ValidMaterialTypes);
        if (colorFamily !== undefined)
          validateEnum(colorFamily, "colorFamily", ValidColorFamilies);

        // Certification IDs validation
        if (input.certificationIds && input.certificationIds.length > 0) {
          validateIdArray(input.certificationIds, "certificationIds", 100);
        }

        // JSON data validation
        let dataJson = undefined;
        if (input.data !== undefined && input.data !== null) {
          validateJSON(input.data, "data");
          dataJson = JSON.parse(input.data);
        }

        // ========================================
        // BUSINESS LOGIC
        // ========================================

        // Check if code is being updated and doesn't conflict with existing items
        if (code !== undefined && code !== null && code !== existing.code) {
          const existingWithCode = await context.prisma.libraryItem.findUnique({
            where: { code },
          });

          if (existingWithCode && existingWithCode.id !== id) {
            throw new ValidationError(
              `Bu kod zaten mevcut: "${code}". ` +
                `Mevcut item: "${existingWithCode.name}" (${existingWithCode.category}). ` +
                `Lütfen farklı bir kod kullanın.`
            );
          }
        }

        // ========================================
        // DATABASE OPERATION
        // ========================================
        const updateData: any = {};

        if (code !== undefined) updateData.code = code || null;
        if (name !== undefined) updateData.name = name;
        if (description !== undefined)
          updateData.description = description || null;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
        if (dataJson !== undefined) updateData.data = dataJson;
        if (notes !== undefined) updateData.notes = notes || null;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isPopular !== undefined) updateData.isPopular = isPopular;

        // Normalized fields
        if (gender !== undefined) updateData.gender = gender || null;
        if (fitCategory !== undefined)
          updateData.fitCategory = fitCategory || null;
        if (sizeCategory !== undefined)
          updateData.sizeCategory = sizeCategory || null;
        if (fiberType !== undefined) updateData.fiberType = fiberType || null;
        if (fabricWeight !== undefined)
          updateData.fabricWeight = fabricWeight || null;
        if (fabricWidth !== undefined)
          updateData.fabricWidth = fabricWidth || null;
        if (materialType !== undefined)
          updateData.materialType = materialType || null;
        if (hexColor !== undefined) updateData.hexColor = hexColor || null;
        if (colorFamily !== undefined)
          updateData.colorFamily = colorFamily || null;

        // Certification relations
        if (input.certificationIds && input.certificationIds.length > 0) {
          updateData.certifications = {
            set: input.certificationIds.map((id) => ({ id })),
          };
        }

        const updatedItem = await context.prisma.libraryItem.update({
          ...query,
          where: { id },
          data: updateData,
        });

        // ========================================
        // LOGGING
        // ========================================
        logInfo("Library item güncellendi", {
          userId: context.user.id,
          libraryItemId: updatedItem.id,
          category: updatedItem.category,
          name: updatedItem.name,
        });

        timer.end({ success: true });
        return updatedItem;
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// Delete Library Item (soft delete)
builder.mutationField("deleteLibraryItem", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { user: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("deleteLibraryItem");

      try {
        // ========================================
        // AUTHENTICATION & AUTHORIZATION
        // ========================================
        requireAuth(context.user?.id);

        const id = sanitizeInt(args.id)!;

        // Fetch existing item
        const existing = await context.prisma.libraryItem.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new ValidationError(`Library item (ID: ${id}) bulunamadı`);
        }

        // Permission check
        if (existing.scope === "COMPANY_CUSTOM") {
          if (existing.companyId !== context.user.companyId) {
            throw new ValidationError("Bu item'ı silme yetkiniz yok");
          }
        } else if (existing.scope === "PLATFORM_STANDARD") {
          if (context.user.role !== "ADMIN") {
            throw new ValidationError(
              "Platform standartlarını sadece adminler silebilir"
            );
          }
        }

        // ========================================
        // DATABASE OPERATION (Soft Delete)
        // ========================================
        await context.prisma.libraryItem.update({
          where: { id },
          data: { isActive: false },
        });

        // ========================================
        // LOGGING
        // ========================================
        logInfo("Library item silindi (soft delete)", {
          userId: context.user.id,
          libraryItemId: id,
          category: existing.category,
          name: existing.name,
        });

        timer.end({ success: true });
        return true;
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// ========================================
// BULK OPERATIONS (Admin Only)
// ========================================

/**
 * Bulk Update Library Items
 * ✅ Permission: Admin only
 * ✅ Input: Array of library item IDs + update data
 */
builder.mutationField("bulkUpdateLibraryItems", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
      data: t.arg({ type: UpdateLibraryItemInput, required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkUpdateLibraryItems");

      try {
        requireAuth(context.user?.id);

        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Bu işlem sadece admin kullanıcılar içindir"
          );
        }

        logInfo("Toplu library item güncelleme başlatılıyor", {
          userId: context.user.id,
          itemIds: args.ids,
          updateFieldsCount: Object.keys(args.data).length,
        });

        const updateData: any = {};

        // Safe fields for bulk update
        if (args.data.isActive !== undefined) {
          updateData.isActive = sanitizeBoolean(args.data.isActive);
        }
        if (args.data.isPopular !== undefined) {
          updateData.isPopular = sanitizeBoolean(args.data.isPopular);
        }
        if (args.data.notes !== undefined) {
          const notes = sanitizeString(args.data.notes);
          updateData.notes = notes || null;
        }

        const results = await context.prisma.libraryItem.updateMany({
          where: { id: { in: args.ids } },
          data: updateData,
        });

        logInfo("Toplu library item güncelleme tamamlandı", {
          metadata: timer.end(),
          userId: context.user.id,
          updatedCount: results.count,
        });

        return {
          success: true,
          updatedCount: results.count,
          message: `${results.count} library item başarıyla güncellendi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Toggle Library Item Status
 * ✅ Permission: Admin only
 */
builder.mutationField("bulkToggleLibraryStatus", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
      isActive: t.arg.boolean({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkToggleLibraryStatus");

      try {
        requireAuth(context.user?.id);

        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Bu işlem sadece admin kullanıcılar içindir"
          );
        }

        logInfo("Toplu library item durum değiştirme başlatılıyor", {
          userId: context.user.id,
          itemIds: args.ids,
          targetStatus: args.isActive,
        });

        const results = await context.prisma.libraryItem.updateMany({
          where: { id: { in: args.ids } },
          data: { isActive: args.isActive },
        });

        logInfo("Toplu library item durum değiştirme tamamlandı", {
          metadata: timer.end(),
          userId: context.user.id,
          updatedCount: results.count,
          newStatus: args.isActive,
        });

        return {
          success: true,
          updatedCount: results.count,
          message: `${results.count} library item durumu ${
            args.isActive ? "aktif" : "pasif"
          } olarak değiştirildi`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

/**
 * Bulk Delete Library Items
 * ✅ Permission: Admin only
 * ✅ Note: Always soft delete (set isActive = false)
 */
builder.mutationField("bulkDeleteLibraryItems", (t) =>
  t.field({
    type: "JSON",
    args: {
      ids: t.arg.intList({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      const timer = createTimer("bulkDeleteLibraryItems");

      try {
        requireAuth(context.user?.id);

        if (context.user?.role !== "ADMIN") {
          throw new ForbiddenError(
            "Bu işlem sadece admin kullanıcılar içindir"
          );
        }

        logInfo("Toplu library item silme başlatılıyor", {
          userId: context.user.id,
          itemIds: args.ids,
        });

        // Always soft delete for library items (data integrity)
        const results = await context.prisma.libraryItem.updateMany({
          where: { id: { in: args.ids } },
          data: { isActive: false },
        });

        logInfo("Toplu library item soft delete tamamlandı", {
          metadata: timer.end(),
          userId: context.user.id,
          deactivatedCount: results.count,
        });

        return {
          success: true,
          deactivatedCount: results.count,
          message: `${results.count} library item devre dışı bırakıldı`,
        };
      } catch (error) {
        timer.end({ success: false });
        throw handleError(error);
      }
    },
  })
);

// ========================================
// CATEGORY MUTATIONS
// ========================================

// StandardCategory and CompanyCategory mutations removed - unified Category system

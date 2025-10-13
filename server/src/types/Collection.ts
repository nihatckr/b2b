import { inputObjectType, objectType } from "nexus";
import { Context } from "../context";

export const Collection = objectType({
  name: "Collection",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name");
    t.string("description");
    t.nonNull.float("price");
    t.string("sku");
    t.nonNull.int("stock");
    t.list.string("images", {
      resolve: (parent) => {
        if (!parent.images) return [];
        try {
          return JSON.parse(parent.images);
        } catch {
          return [];
        }
      },
    });
    t.nonNull.boolean("isActive");
    t.nonNull.boolean("isFeatured");
    t.string("slug");

    // ADIM 1: Temel Bilgiler
    t.nonNull.string("modelCode"); // THS-2024-00
    t.field("season", { type: "Season" }); // SS25, FW25, etc.
    t.field("gender", { type: "Gender" }); // WOMEN, MEN, etc.
    t.string("fit"); // Library'den seçilen fit adı: "Slim Fit", "Regular Fit"
    t.string("trend"); // Trend: "Minimalist", "Vintage", "Sport Chic"

    // Beğeni/Favoriler
    t.nonNull.int("likesCount");
    t.list.field("favoritedBy", {
      type: "User",
      resolve: (parent, _, ctx: Context) => {
        return ctx.prisma.userFavoriteCollection
          .findMany({
            where: { collectionId: parent.id },
            include: { user: true },
          })
          .then((favorites) => favorites.map((f) => f.user));
      },
    });

    // ADIM 2: Varyantlar ve Ölçüler
    t.list.string("colors", {
      resolve: (parent) => {
        if (!parent.colors) return [];
        try {
          return JSON.parse(parent.colors);
        } catch {
          return [];
        }
      },
    });
    t.list.int("sizeGroupIds", {
      resolve: (parent) => {
        if (!parent.sizeGroups) return [];
        try {
          return JSON.parse(parent.sizeGroups);
        } catch {
          return [];
        }
      },
    });
    t.string("sizeRange"); // Manuel override (legacy)
    t.string("measurementChart"); // File path

    // ADIM 3: Teknik Detaylar
    t.string("fabricComposition"); // "%100 Cotton"
    t.string("accessories"); // JSON string
    t.string("techPack"); // File path

    // ADIM 4: Ticari Bilgiler
    t.int("moq"); // Minimum Order Quantity
    t.float("targetPrice"); // Hedef fiyat
    t.int("targetLeadTime"); // Hedef termin (gün)
    t.string("notes"); // Açıklama

    t.string("productionSchedule", {
      resolve: (parent) => {
        if (!parent.productionSchedule) return null;
        return typeof parent.productionSchedule === "string"
          ? parent.productionSchedule
          : JSON.stringify(parent.productionSchedule);
      },
    });
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    // Relations
    t.field("company", {
      type: "Company",
      resolve: (collection, _args, ctx) =>
        ctx.prisma.collection
          .findUnique({ where: { id: collection.id } })
          .company(),
    });

    t.field("category", {
      type: "Category",
      resolve: (collection, _args, ctx) =>
        ctx.prisma.collection
          .findUnique({ where: { id: collection.id } })
          .category(),
    });

    t.field("author", {
      type: "User",
      resolve: (collection, _args, ctx) =>
        ctx.prisma.collection
          .findUnique({ where: { id: collection.id } })
          .author(),
    });

    t.list.field("samples", {
      type: "Sample",
      resolve: (collection, _args, ctx) =>
        ctx.prisma.collection
          .findUnique({ where: { id: collection.id } })
          .samples(),
    });

    // Counts
    t.int("samplesCount", {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.sample.count({
          where: { collectionId: parent.id },
        });
      },
    });

    t.int("ordersCount", {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.order.count({
          where: {
            collectionId: parent.id,
          },
        });
      },
    });
  },
});

export const CreateCollectionInput = inputObjectType({
  name: "CreateCollectionInput",
  definition(t) {
    t.nonNull.string("name");
    t.string("description");

    // ADIM 1: Temel Bilgiler
    t.string("modelCode"); // THS-2024-00 (opsiyonel - otomatik oluşturulur)
    t.field("season", { type: "Season" });
    t.field("gender", { type: "Gender" });
    t.string("fit"); // Library'den fit adı
    t.string("trend"); // Trend adı

    // ADIM 2: Varyantlar ve Ölçüler
    t.list.string("colors");
    t.list.int("sizeGroupIds");
    t.string("sizeRange");
    t.string("measurementChart");

    // ADIM 3: Teknik Detaylar
    t.string("fabricComposition");
    t.string("accessories"); // JSON string
    t.list.string("images");
    t.string("techPack");

    // ADIM 4: Ticari Bilgiler
    t.int("moq");
    t.float("targetPrice");
    t.int("targetLeadTime");
    t.string("notes");

    // Legacy/Optional
    t.float("price");
    t.string("sku");
    t.int("stock");
    t.boolean("isActive");
    t.boolean("isFeatured");
    t.string("slug");
    t.string("productionSchedule");
    t.int("categoryId");
    t.int("companyId");
  },
});

export const UpdateCollectionInput = inputObjectType({
  name: "UpdateCollectionInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.string("description");

    // ADIM 1: Temel Bilgiler
    t.string("modelCode");
    t.field("season", { type: "Season" });
    t.field("gender", { type: "Gender" });
    t.string("fit"); // Library'den fit adı
    t.string("trend"); // Trend adı

    // ADIM 2: Varyantlar ve Ölçüler
    t.list.string("colors");
    t.list.int("sizeGroupIds");
    t.string("sizeRange");
    t.string("measurementChart");

    // ADIM 3: Teknik Detaylar
    t.string("fabricComposition");
    t.string("accessories");
    t.list.string("images");
    t.string("techPack");

    // ADIM 4: Ticari Bilgiler
    t.int("moq");
    t.float("targetPrice");
    t.int("targetLeadTime");
    t.string("notes");

    // Legacy/Optional
    t.float("price");
    t.string("sku");
    t.int("stock");
    t.boolean("isActive");
    t.boolean("isFeatured");
    t.string("slug");
    t.string("productionSchedule");
    t.int("categoryId");
    t.int("companyId");
  },
});

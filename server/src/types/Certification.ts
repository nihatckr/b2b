import { objectType } from "nexus";

export const Certification = objectType({
  name: "Certification",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });

    t.nonNull.string("name"); // "GOTS", "OEKO-TEX Standard 100"
    t.string("code"); // "GOTS-2023", "OEKO-100"
    t.nonNull.field("category", { type: "CertificationCategory" });

    // Detaylar
    t.string("issuer"); // "GOTS International"
    t.field("validFrom", { type: "DateTime" });
    t.field("validUntil", { type: "DateTime" });
    t.string("certificateNumber");
    t.string("certificateFile");
    t.string("description");
    t.nonNull.boolean("isActive");

    // İlişkiler
    t.nonNull.field("company", {
      type: "Company",
      resolve: (parent, _, ctx) => {
        return ctx.prisma.certification
          .findUnique({ where: { id: parent.id } })
          .company();
      },
    });

    t.nonNull.int("companyId");

    t.list.field("collections", {
      type: "Collection",
      resolve: (parent, _, ctx) => {
        return ctx.prisma.certification
          .findUnique({ where: { id: parent.id } })
          .collections();
      },
    });
  },
});

// Input type silindi - args ile direkt kullanılacak

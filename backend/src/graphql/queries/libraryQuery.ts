import builder from "../builder";

// My Colors - Manufacturer's color library
builder.queryField("myColors", (t) =>
  t.prismaField({
    type: ["Color"],
    authScopes: { companyOwner: true, employee: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.color.findMany({
        ...query,
        where: { companyId: context.user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  })
);

// My Fabrics - Manufacturer's fabric library
builder.queryField("myFabrics", (t) =>
  t.prismaField({
    type: ["Fabric"],
    authScopes: { companyOwner: true, employee: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.fabric.findMany({
        ...query,
        where: { companyId: context.user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  })
);

// My Size Groups - Manufacturer's size groups
builder.queryField("mySizeGroups", (t) =>
  t.prismaField({
    type: ["SizeGroup"],
    authScopes: { companyOwner: true, employee: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.sizeGroup.findMany({
        ...query,
        where: { companyId: context.user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  })
);

// My Certifications - Manufacturer's certifications
builder.queryField("myCertifications", (t) =>
  t.prismaField({
    type: ["Certification"],
    authScopes: { companyOwner: true, employee: true },
    resolve: async (query, _root, _args, context) => {
      if (!context.user?.companyId) {
        throw new Error("Must be associated with a company");
      }

      return context.prisma.certification.findMany({
        ...query,
        where: { companyId: context.user.companyId, isActive: true },
        orderBy: { name: "asc" },
      });
    },
  })
);

import builder from "../builder";

// Create category (admin only)
builder.mutationField("createCategory", (t) =>
  t.prismaField({
    type: "Category",
    args: {
      name: t.arg.string({ required: true }),
      description: t.arg.string(),
      parentCategoryId: t.arg.int(),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const data: any = {
        name: args.name,
        authorId: context.user?.id || 0,
      };

      if (args.description !== null && args.description !== undefined)
        data.description = args.description;
      if (args.parentCategoryId !== null && args.parentCategoryId !== undefined)
        data.parentCategoryId = args.parentCategoryId;
      if (
        context.user?.companyId !== null &&
        context.user?.companyId !== undefined
      )
        data.companyId = context.user.companyId;

      return context.prisma.category.create({
        ...query,
        data,
      });
    },
  })
);

// Update category (admin only)
builder.mutationField("updateCategory", (t) =>
  t.prismaField({
    type: "Category",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      const updateData: any = {};
      if (args.name !== null && args.name !== undefined)
        updateData.name = args.name;
      if (args.description !== null && args.description !== undefined)
        updateData.description = args.description;

      return context.prisma.category.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });
    },
  })
);

// Delete category (admin only)
builder.mutationField("deleteCategory", (t) =>
  t.field({
    type: "Boolean",
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (_root, args, context) => {
      await context.prisma.category.delete({
        where: { id: args.id },
      });
      return true;
    },
  })
);

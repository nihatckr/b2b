import { extendType, inputObjectType, intArg, nonNull } from "nexus";

// Workshop Input Types
export const CreateWorkshopInput = inputObjectType({
  name: "CreateWorkshopInput",
  definition(t) {
    t.nonNull.string("name");
    t.nonNull.field("type", { type: "WorkshopType" });
    t.int("capacity");
    t.string("location");
  },
});

export const UpdateWorkshopInput = inputObjectType({
  name: "UpdateWorkshopInput",
  definition(t) {
    t.nonNull.int("id");
    t.string("name");
    t.field("type", { type: "WorkshopType" });
    t.int("capacity");
    t.string("location");
    t.boolean("isActive");
  },
});

// Workshop Mutations
export const WorkshopMutation = extendType({
  type: "Mutation",
  definition(t) {
    // Create Workshop
    t.field("createWorkshop", {
      type: "Workshop",
      args: {
        input: nonNull("CreateWorkshopInput"),
      },
      resolve: async (_, { input }, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          include: { company: true },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Permission check: ADMIN, COMPANY_OWNER, MANUFACTURE
        if (
          user.role !== "ADMIN" &&
          user.role !== "COMPANY_OWNER" &&
          user.role !== "MANUFACTURE"
        ) {
          throw new Error("Workshop oluşturma yetkiniz yok");
        }

        // Check if workshop name already exists
        const existingWorkshop = await ctx.prisma.workshop.findUnique({
          where: { name: input.name },
        });

        if (existingWorkshop) {
          throw new Error("Bu isimde bir atölye zaten mevcut");
        }

        // Create workshop
        const workshop = await ctx.prisma.workshop.create({
          data: {
            name: input.name,
            type: input.type,
            capacity: input.capacity || null,
            location: input.location || null,
            ownerId: userId,
          },
        });

        return workshop;
      },
    });

    // Update Workshop
    t.field("updateWorkshop", {
      type: "Workshop",
      args: {
        input: nonNull("UpdateWorkshopInput"),
      },
      resolve: async (_, { input }, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Check if workshop exists
        const existingWorkshop = await ctx.prisma.workshop.findUnique({
          where: { id: input.id },
          include: { owner: true },
        });

        if (!existingWorkshop) {
          throw new Error("Atölye bulunamadı");
        }

        // Permission check: Owner or ADMIN
        if (
          user.role !== "ADMIN" &&
          existingWorkshop.ownerId !== userId
        ) {
          throw new Error("Bu atölyeyi düzenleme yetkiniz yok");
        }

        // Check name uniqueness if name is being changed
        if (input.name && input.name !== existingWorkshop.name) {
          const nameExists = await ctx.prisma.workshop.findUnique({
            where: { name: input.name },
          });

          if (nameExists) {
            throw new Error("Bu isimde bir atölye zaten mevcut");
          }
        }

        // Update workshop
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.type !== undefined) updateData.type = input.type;
        if (input.capacity !== undefined) updateData.capacity = input.capacity;
        if (input.location !== undefined) updateData.location = input.location;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        const workshop = await ctx.prisma.workshop.update({
          where: { id: input.id },
          data: updateData,
        });

        return workshop;
      },
    });

    // Delete Workshop
    t.field("deleteWorkshop", {
      type: "Workshop",
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Check if workshop exists
        const workshop = await ctx.prisma.workshop.findUnique({
          where: { id },
          include: {
            sewingProductions: true,
            packagingProductions: true,
          },
        });

        if (!workshop) {
          throw new Error("Atölye bulunamadı");
        }

        // Permission check
        if (user.role !== "ADMIN" && workshop.ownerId !== userId) {
          throw new Error("Bu atölyeyi silme yetkiniz yok");
        }

        // Check if workshop is being used
        const hasProductions =
          workshop.sewingProductions.length > 0 ||
          workshop.packagingProductions.length > 0;

        if (hasProductions) {
          throw new Error(
            "Bu atölye aktif üretimlerde kullanılıyor. Önce üretimleri tamamlayın veya başka atölyeye atayın."
          );
        }

        // Delete workshop
        const deletedWorkshop = await ctx.prisma.workshop.delete({
          where: { id },
        });

        return deletedWorkshop;
      },
    });

    // Assign Workshop to Production
    t.field("assignWorkshopToProduction", {
      type: "ProductionTracking",
      args: {
        productionId: nonNull(intArg()),
        sewingWorkshopId: intArg(),
        packagingWorkshopId: intArg(),
      },
      resolve: async (
        _,
        { productionId, sewingWorkshopId, packagingWorkshopId },
        ctx
      ) => {
        const userId = ctx.userId;

        if (!userId) {
          throw new Error("Giriş yapmalısınız");
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Permission check
        if (
          user.role !== "ADMIN" &&
          user.role !== "COMPANY_OWNER" &&
          user.role !== "MANUFACTURE"
        ) {
          throw new Error("Atölye atama yetkiniz yok");
        }

        // Check if production exists
        const production = await ctx.prisma.productionTracking.findUnique({
          where: { id: productionId },
        });

        if (!production) {
          throw new Error("Üretim kaydı bulunamadı");
        }

        // Verify workshops exist and are active
        if (sewingWorkshopId) {
          const sewingWorkshop = await ctx.prisma.workshop.findUnique({
            where: { id: sewingWorkshopId },
          });

          if (!sewingWorkshop || !sewingWorkshop.isActive) {
            throw new Error("Dikiş atölyesi bulunamadı veya aktif değil");
          }

          if (sewingWorkshop.type !== "SEWING" && sewingWorkshop.type !== "GENERAL") {
            throw new Error("Bu atölye dikiş işlemleri için uygun değil");
          }
        }

        if (packagingWorkshopId) {
          const packagingWorkshop = await ctx.prisma.workshop.findUnique({
            where: { id: packagingWorkshopId },
          });

          if (!packagingWorkshop || !packagingWorkshop.isActive) {
            throw new Error("Paketleme atölyesi bulunamadı veya aktif değil");
          }

          if (packagingWorkshop.type !== "PACKAGING" && packagingWorkshop.type !== "GENERAL") {
            throw new Error("Bu atölye paketleme işlemleri için uygun değil");
          }
        }

        // Update production with workshop assignments
        const updatedProduction = await ctx.prisma.productionTracking.update({
          where: { id: productionId },
          data: {
            sewingWorkshopId: sewingWorkshopId || undefined,
            packagingWorkshopId: packagingWorkshopId || undefined,
          },
        });

        return updatedProduction;
      },
    });
  },
});

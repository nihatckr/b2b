import { publishNotification } from "../../utils/publishHelpers";
import builder from "../builder";

const ValidCompanyTypes = ["MANUFACTURER", "BUYER", "BOTH"];

// Create company (admin only)
builder.mutationField("createCompany", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      name: t.arg.string({ required: true }),
      email: t.arg.string({ required: true }),
      phone: t.arg.string(),
      type: t.arg.string({ required: true }),
    },
    authScopes: { admin: true },
    resolve: async (query, _root, args, context) => {
      if (!ValidCompanyTypes.includes(args.type)) {
        throw new Error(
          `Invalid company type. Must be one of: ${ValidCompanyTypes.join(
            ", "
          )}`
        );
      }
      return context.prisma.company.create({
        ...query,
        data: {
          name: args.name,
          email: args.email,
          ...(args.phone !== null && args.phone !== undefined
            ? { phone: args.phone }
            : {}),
          type: args.type as any,
          isActive: true,
        },
      });
    },
  })
);

// Update company (owner or admin)
builder.mutationField("updateCompany", (t) =>
  t.prismaField({
    type: "Company",
    args: {
      id: t.arg.int({ required: true }),
      name: t.arg.string(),
      email: t.arg.string(),
      phone: t.arg.string(),
      description: t.arg.string(),
      website: t.arg.string(),
      address: t.arg.string(),
      city: t.arg.string(),
      country: t.arg.string(),

      // Subscription fields (admin only)
      subscriptionPlan: t.arg.string(),
      subscriptionStatus: t.arg.string(),
      subscriptionStartDate: t.arg.string(), // ISO date string
      subscriptionEndDate: t.arg.string(), // ISO date string
      trialEndDate: t.arg.string(), // ISO date string
      billingCycle: t.arg.string(),
      maxUsers: t.arg.int(),
      maxProducts: t.arg.int(),
      maxStorage: t.arg.int(),

      // Branding
      logo: t.arg.string(),
      coverImage: t.arg.string(),
      brandColors: t.arg.string(), // JSON string

      // Public profile
      profileSlug: t.arg.string(),
      isPublicProfile: t.arg.boolean(),
      socialLinks: t.arg.string(), // JSON string

      // Dashboard preferences
      defaultView: t.arg.string(),
      enabledModules: t.arg.string(), // JSON string
    },
    authScopes: { companyOwner: true, admin: true },
    resolve: async (query, _root, args, context) => {
      // Debug log
      console.log("🔍 UpdateCompany Debug:", {
        requestedCompanyId: args.id,
        userCompanyId: context.user?.companyId,
        userRole: context.user?.role,
        userId: context.user?.id,
        isCompanyOwner: context.user?.role === "COMPANY_OWNER",
      });

      // Check if user owns this company
      if (
        context.user?.companyId !== args.id &&
        context.user?.role !== "ADMIN"
      ) {
        console.error("❌ Unauthorized: User companyId doesn't match requested id");
        throw new Error("Unauthorized");
      }

      const updateData: any = {};
      const isAdmin = context.user?.role === "ADMIN";

      // Basic fields
      if (args.name !== null && args.name !== undefined)
        updateData.name = args.name;
      if (args.email !== null && args.email !== undefined)
        updateData.email = args.email;
      if (args.phone !== null && args.phone !== undefined)
        updateData.phone = args.phone;
      if (args.description !== null && args.description !== undefined)
        updateData.description = args.description;
      if (args.website !== null && args.website !== undefined)
        updateData.website = args.website;
      if (args.address !== null && args.address !== undefined)
        updateData.address = args.address;
      if (args.city !== null && args.city !== undefined)
        updateData.city = args.city;
      if (args.country !== null && args.country !== undefined)
        updateData.country = args.country;

      // Subscription fields (admin only)
      if (isAdmin) {
        if (args.subscriptionPlan !== null && args.subscriptionPlan !== undefined)
          updateData.subscriptionPlan = args.subscriptionPlan;
        if (args.subscriptionStatus !== null && args.subscriptionStatus !== undefined)
          updateData.subscriptionStatus = args.subscriptionStatus;
        if (args.subscriptionStartDate !== null && args.subscriptionStartDate !== undefined)
          updateData.subscriptionStartDate = new Date(args.subscriptionStartDate);
        if (args.subscriptionEndDate !== null && args.subscriptionEndDate !== undefined)
          updateData.subscriptionEndDate = new Date(args.subscriptionEndDate);
        if (args.trialEndDate !== null && args.trialEndDate !== undefined)
          updateData.trialEndDate = new Date(args.trialEndDate);
        if (args.billingCycle !== null && args.billingCycle !== undefined)
          updateData.billingCycle = args.billingCycle;
        if (args.maxUsers !== null && args.maxUsers !== undefined)
          updateData.maxUsers = args.maxUsers;
        if (args.maxProducts !== null && args.maxProducts !== undefined)
          updateData.maxProducts = args.maxProducts;
        if (args.maxStorage !== null && args.maxStorage !== undefined)
          updateData.maxStorage = args.maxStorage;
      }

      // Branding
      if (args.logo !== null && args.logo !== undefined)
        updateData.logo = args.logo;
      if (args.coverImage !== null && args.coverImage !== undefined)
        updateData.coverImage = args.coverImage;
      if (args.brandColors !== null && args.brandColors !== undefined)
        updateData.brandColors = args.brandColors;

      // Public profile
      if (args.profileSlug !== null && args.profileSlug !== undefined)
        updateData.profileSlug = args.profileSlug;
      if (args.isPublicProfile !== null && args.isPublicProfile !== undefined)
        updateData.isPublicProfile = args.isPublicProfile;
      if (args.socialLinks !== null && args.socialLinks !== undefined)
        updateData.socialLinks = args.socialLinks;

      // Dashboard preferences
      if (args.defaultView !== null && args.defaultView !== undefined)
        updateData.defaultView = args.defaultView;
      if (args.enabledModules !== null && args.enabledModules !== undefined)
        updateData.enabledModules = args.enabledModules;

      const updatedCompany = await context.prisma.company.update({
        ...query,
        where: { id: args.id },
        data: updateData,
      });

      // ✅ Create company update notification (notify all company members)
      try {
        // Get all company members
        const companyMembers = await context.prisma.user.findMany({
          where: { companyId: args.id },
          select: { id: true },
        });

        // Notify all members
        for (const member of companyMembers) {
          const isOwner = member.id === context.user?.id;
          const notification = await context.prisma.notification.create({
            data: {
              type: "SYSTEM",
              title: "🏢 Şirket Bilgileri Güncellendi",
              message: isOwner
                ? "Şirket bilgileri başarıyla güncellendi."
                : "Şirket bilgileri bir yönetici tarafından güncellendi.",
              userId: member.id,
              link: "/settings/company",
              isRead: false,
            },
          });
          await publishNotification(notification);
        }

        console.log(`📢 Company update notifications sent to ${companyMembers.length} members`);
      } catch (notifError) {
        console.error("⚠️  Notification failed (continuing anyway):", notifError instanceof Error ? notifError.message : notifError);
      }

      return updatedCompany;
    },
  })
);

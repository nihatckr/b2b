import { intArg, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { getUserRole, requireAuth } from "../utils/user-role-helper";

export const sampleQueries = (t: any) => {
  // Get all samples with filtering
  t.list.field("samples", {
    type: "Sample",
    args: {
      status: "SampleStatus",
      sampleType: "SampleType",
      customerId: intArg(),
      manufactureId: intArg(),
      companyId: intArg(),
      search: stringArg(),
      limit: intArg(),
      offset: intArg(),
    },
    resolve: async (
      _parent: unknown,
      args: {
        status?: string;
        sampleType?: string;
        customerId?: number;
        manufactureId?: number;
        companyId?: number;
        search?: string;
        limit?: number;
        offset?: number;
      },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Build where clause based on permissions and filters
      const where: any = {};

      console.log("🔍 Samples Query - User:", user.email, "Role:", userRole, "UserId:", userId);

      // Role-based filtering
      if (userRole === "CUSTOMER") {
        // Customers can only see their own samples
        where.customerId = userId;
      } else if (userRole === "MANUFACTURE" || userRole === "COMPANY_OWNER" || userRole === "COMPANY_EMPLOYEE") {
        // Manufacturers can only see samples assigned to them or their company members
        where.OR = [
          { manufactureId: userId }, // Directly assigned to this user
          {
            manufacture: {
              companyId: user.companyId || -1,
            }
          }, // Assigned to someone in their company
        ];
      }
      // Admins see all samples

      // Apply additional filters
      if (args.status) {
        where.status = args.status;
      }

      if (args.sampleType) {
        where.sampleType = args.sampleType;
      }

      if (args.customerId) {
        // Only admins can filter by specific customer
        if (userRole === "ADMIN") {
          where.customerId = args.customerId;
        }
      }

      if (args.manufactureId) {
        // Admins and the manufacturer themselves can filter by manufacture
        if (userRole === "ADMIN" || args.manufactureId === userId) {
          where.manufactureId = args.manufactureId;
        }
      }

      if (args.companyId) {
        // Only admins and manufacturer from that company can filter by company
        if (
          userRole === "ADMIN" ||
          (userRole === "MANUFACTURE" && args.companyId === user.companyId)
        ) {
          where.companyId = args.companyId;
        }
      }

      if (args.search) {
        where.OR = [
          { sampleNumber: { contains: args.search, mode: "insensitive" } },
          { customerNote: { contains: args.search, mode: "insensitive" } },
          {
            manufacturerResponse: {
              contains: args.search,
              mode: "insensitive",
            },
          },
        ];
      }

      console.log("🔍 Where clause:", JSON.stringify(where, null, 2));

      const samples = await context.prisma.sample.findMany({
        where,
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
        take: args.limit || undefined,
        skip: args.offset || undefined,
      });

      console.log("✅ Found", samples.length, "samples for user", user.email);
      console.log("📊 Sample details:", samples.map(s => ({
        id: s.id,
        number: s.sampleNumber,
        status: s.status,
        aiGenerated: s.aiGenerated,
        customerId: s.customerId
      })));

      return samples;
    },
  });

  // Get single sample by ID
  t.field("sample", {
    type: "Sample",
    args: {
      id: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { id }: { id: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      const sample = await context.prisma.sample.findUnique({
        where: { id },
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
          productionHistory: {
            orderBy: { createdAt: "desc" },
            include: {
              updatedBy: true,
            },
          },
        },
      });

      if (!sample) {
        throw new Error("Sample not found");
      }

      // Permission check
      const isCustomer = sample.customerId === userId;
      const isManufacture = sample.manufactureId === userId;
      const isCompanyMember =
        userRole === "MANUFACTURE" && sample.companyId === user.companyId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isManufacture && !isCompanyMember && !isAdmin) {
        throw new Error("Not authorized to view this sample");
      }

      return sample;
    },
  });

  // Get my samples (customer)
  t.list.field("mySamples", {
    type: "Sample",
    args: {
      status: "SampleStatus",
      sampleType: "SampleType",
    },
    resolve: async (
      _parent: unknown,
      args: { status?: string; sampleType?: string },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const where: any = {
        customerId: userId,
      };

      if (args.status) {
        where.status = args.status;
      }

      if (args.sampleType) {
        where.sampleType = args.sampleType;
      }

      return context.prisma.sample.findMany({
        where,
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get samples assigned to me (manufacturer)
  t.list.field("assignedSamples", {
    type: "Sample",
    args: {
      status: "SampleStatus",
      sampleType: "SampleType",
    },
    resolve: async (
      _parent: unknown,
      args: { status?: string; sampleType?: string },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      if (userRole !== "MANUFACTURE" && userRole !== "ADMIN" && userRole !== "COMPANY_OWNER" && userRole !== "COMPANY_EMPLOYEE") {
        throw new Error(
          "Only manufacturers and admins can access assigned samples"
        );
      }

      const where: any = {
        OR: [
          { manufactureId: userId }, // Directly assigned
          {
            manufacture: {
              companyId: user.companyId || -1,
            }
          }, // Assigned to company members
        ],
        // Exclude AI_DESIGN status (not yet sent to manufacturer)
        status: {
          not: "AI_DESIGN"
        }
      };

      if (args.status) {
        where.status = args.status;
      }

      if (args.sampleType) {
        where.sampleType = args.sampleType;
      }

      return context.prisma.sample.findMany({
        where,
        include: {
          collection: true,
          originalCollection: true,
          customer: true,
          manufacture: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });

  // Get sample production history
  t.list.field("sampleProductionHistory", {
    type: "SampleProduction",
    args: {
      sampleId: nonNull(intArg()),
    },
    resolve: async (
      _parent: unknown,
      { sampleId }: { sampleId: number },
      context: Context
    ) => {
      const userId = requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userRole = getUserRole(user);

      // Check if user has access to this sample
      const sample = await context.prisma.sample.findUnique({
        where: { id: sampleId },
      });

      if (!sample) {
        throw new Error("Sample not found");
      }

      const isCustomer = sample.customerId === userId;
      const isManufacture = sample.manufactureId === userId;
      const isCompanyMember =
        userRole === "MANUFACTURE" && sample.companyId === user.companyId;
      const isAdmin = userRole === "ADMIN";

      if (!isCustomer && !isManufacture && !isCompanyMember && !isAdmin) {
        throw new Error("Not authorized to view this sample history");
      }

      return context.prisma.sampleProduction.findMany({
        where: { sampleId },
        include: {
          sample: true,
          updatedBy: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  });
};

import prisma from '../../../lib/prisma';
import { builder } from '../builder';

// Get current user
builder.queryField('me', (t) =>
  t.prismaField({
    type: 'User',
    nullable: true,
    authScopes: {
      user: true,
    },
    resolve: async (query, _root, _args, context) => {
      if (!context.user) return null;

      return await prisma.user.findUnique({
        ...query,
        where: { id: context.user.id },
      });
    },
  })
);

// Get all users (admin only)
builder.queryField('users', (t) =>
  t.prismaField({
    type: ['User'],
    authScopes: {
      admin: true,
    },
    resolve: async (query) => {
      return await prisma.user.findMany({
        ...query,
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

// Get user by ID
builder.queryField('user', (t) =>
  t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: {
      user: true,
    },
    resolve: async (query, _root, args) => {
      return await prisma.user.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get all samples
builder.queryField('samples', (t) =>
  t.prismaField({
    type: ['Sample'],
    authScopes: {
      user: true,
    },
    args: {
      status: t.arg.string(),
      collectionId: t.arg.int(),
    },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.status) {
        where.status = args.status;
      }

      if (args.collectionId) {
        where.collectionId = args.collectionId;
      }

      // Filter by company if user is manufacturer
      if (context.user?.role === 'MANUFACTURER' && context.user.companyId) {
        where.companyId = context.user.companyId;
      }

      return await prisma.sample.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

// Get sample by ID
builder.queryField('sample', (t) =>
  t.prismaField({
    type: 'Sample',
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: {
      user: true,
    },
    resolve: async (query, _root, args) => {
      return await prisma.sample.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get all collections
builder.queryField('collections', (t) =>
  t.prismaField({
    type: ['Collection'],
    authScopes: {
      user: true,
    },
    resolve: async (query, _root, _args, context) => {
      const where: any = {};

      // Filter by user if customer
      if (context.user?.role === 'CUSTOMER') {
        where.createdById = context.user.id;
      }

      return await prisma.collection.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

// Get collection by ID
builder.queryField('collection', (t) =>
  t.prismaField({
    type: 'Collection',
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: {
      user: true,
    },
    resolve: async (query, _root, args) => {
      return await prisma.collection.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get all orders
builder.queryField('orders', (t) =>
  t.prismaField({
    type: ['Order'],
    authScopes: {
      user: true,
    },
    args: {
      status: t.arg.string(),
    },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.status) {
        where.status = args.status;
      }

      // Filter by company
      if (context.user?.companyId) {
        where.OR = [
          { customerId: context.user.companyId },
          { manufacturerId: context.user.companyId },
        ];
      }

      return await prisma.order.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

// Get order by ID
builder.queryField('order', (t) =>
  t.prismaField({
    type: 'Order',
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    authScopes: {
      user: true,
    },
    resolve: async (query, _root, args) => {
      return await prisma.order.findUnique({
        ...query,
        where: { id: args.id },
      });
    },
  })
);

// Get all tasks
builder.queryField('tasks', (t) =>
  t.prismaField({
    type: ['Task'],
    authScopes: {
      user: true,
    },
    args: {
      status: t.arg.string(),
      type: t.arg.string(),
    },
    resolve: async (query, _root, args, context) => {
      const where: any = {};

      if (args.status) {
        where.status = args.status;
      }

      if (args.type) {
        where.type = args.type;
      }

      // Filter by assigned user
      if (context.user) {
        where.assignedToId = context.user.id;
      }

      return await prisma.task.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

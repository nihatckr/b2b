import { builder } from '../builder';

// User Type
builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
    role: t.exposeString('role'),
    isActive: t.exposeBoolean('isActive'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Relations
    company: t.relation('company', { nullable: true }),
    collections: t.relation('collections'),
    samples: t.relation('samples'),
  }),
});

// Company Type
builder.prismaObject('Company', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    type: t.exposeString('type'),
    taxNumber: t.exposeString('taxNumber', { nullable: true }),
    address: t.exposeString('address', { nullable: true }),
    phone: t.exposeString('phone', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    users: t.relation('users'),
    samples: t.relation('samples'),
    orders: t.relation('orders'),
  }),
});

// Sample Type
builder.prismaObject('Sample', {
  fields: (t) => ({
    id: t.exposeID('id'),
    code: t.exposeString('code'),
    name: t.exposeString('name'),
    status: t.exposeString('status'),
    priority: t.exposeString('priority'),
    description: t.exposeString('description', { nullable: true }),
    quantity: t.exposeInt('quantity', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Relations
    collection: t.relation('collection'),
    category: t.relation('category', { nullable: true }),
    company: t.relation('company'),
    createdBy: t.relation('createdBy'),
  }),
});

// Collection Type
builder.prismaObject('Collection', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    season: t.exposeString('season', { nullable: true }),
    year: t.exposeInt('year', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    samples: t.relation('samples'),
    createdBy: t.relation('createdBy'),
  }),
});

// Order Type
builder.prismaObject('Order', {
  fields: (t) => ({
    id: t.exposeID('id'),
    orderNumber: t.exposeString('orderNumber'),
    status: t.exposeString('status'),
    totalQuantity: t.exposeInt('totalQuantity'),
    totalAmount: t.exposeFloat('totalAmount', { nullable: true }),
    deliveryDate: t.expose('deliveryDate', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    customer: t.relation('customer'),
    manufacturer: t.relation('manufacturer'),
    items: t.relation('items'),
  }),
});

// Task Type
builder.prismaObject('Task', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    type: t.exposeString('type'),
    status: t.exposeString('status'),
    priority: t.exposeString('priority'),
    dueDate: t.expose('dueDate', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Relations
    assignedTo: t.relation('assignedTo', { nullable: true }),
    createdBy: t.relation('createdBy'),
    sample: t.relation('sample', { nullable: true }),
    order: t.relation('order', { nullable: true }),
  }),
});

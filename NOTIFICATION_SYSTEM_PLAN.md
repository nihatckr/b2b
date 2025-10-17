# Notification System - Complete Implementation Plan

## Current State Analysis

### ✅ Already Has Notifications:
1. **orderResolver.ts**
   - ✅ `createOrder` - Manufacturer'a bildirim
   - ✅ `updateOrderStatus` - Status değişikliğinde
   - ✅ `confirmOrder` - Sipariş onayında

2. **sampleResolver.ts**
   - ✅ `requestSample` - Manufacturer'a bildirim
   - ✅ `updateSampleStatus` - Status değişikliğinde

3. **notificationHelper.ts**
   - ✅ `checkProductionDeadlines` - Deadline yaklaştığında
   - ✅ `checkOverdueProduction` - Gecikmiş üretim

## 🎯 Notification Strategy

### Priority System:
- **🔴 CRITICAL** - Immediate action required (order creation, status changes)
- **🟡 IMPORTANT** - Should know soon (quality issues, revisions)
- **🔵 INFO** - Nice to know (comments, messages)

## 📋 Missing Notifications by Module

### 1. Order Management (orderResolver.ts)

#### 🔴 CRITICAL - Missing:
- [ ] `cancelOrder` → Notify manufacturer when customer cancels
- [ ] `rejectOrder` → Notify customer when manufacturer rejects

#### 🟡 IMPORTANT - Missing:
- [ ] `updateOrder` → Notify manufacturer when order details change
- [ ] `deleteOrder` → Notify both parties

#### Example:
```typescript
// cancelOrder mutation
await createNotification(context.prisma, {
  type: "ORDER",
  title: "❌ Order Cancelled",
  message: `Order #${order.orderNumber} has been cancelled by customer`,
  userId: order.manufactureId,
  link: `/dashboard/orders/${order.id}`,
  orderId: order.id,
});
```

---

### 2. Sample Management (sampleResolver.ts)

#### 🔴 CRITICAL - Missing:
- [ ] `createSample` → Notify manufacturer (currently only requestSample has it)
- [ ] `updateSample` → Notify manufacturer when sample details change
- [ ] `cancelSample` → Notify manufacturer when customer cancels
- [ ] `rejectSample` → Notify customer when manufacturer rejects

#### 🟡 IMPORTANT - Missing:
- [ ] `deleteSample` → Notify both parties

#### Example:
```typescript
// updateSample mutation
await createNotification(context.prisma, {
  type: "SAMPLE",
  title: "📝 Sample Updated",
  message: `Sample #${sample.sampleNumber} details have been updated`,
  userId: sample.manufactureId,
  link: `/dashboard/samples/${sample.id}`,
  sampleId: sample.id,
});
```

---

### 3. Production Tracking (productionResolver.ts)

#### 🔴 CRITICAL - Missing:
- [ ] `updateProductionStage` → Notify customer on stage completion
- [ ] `approveStage` → Notify manufacturer when stage approved
- [ ] `rejectStage` → Notify manufacturer when stage rejected
- [ ] `updateProductionStatus` → Notify customer on status change

#### 🟡 IMPORTANT - Missing:
- [ ] `addProductionNote` → Notify relevant party about note
- [ ] `updateEstimatedDates` → Notify customer about date changes

#### Example:
```typescript
// updateProductionStage mutation
// Notify customer
await createNotification(context.prisma, {
  type: "PRODUCTION",
  title: "📦 Production Stage Updated",
  message: `${entityType} #${entityNumber} - Stage ${stage} completed`,
  userId: customerId,
  link: isOrder ? `/dashboard/orders/${orderId}` : `/dashboard/samples/${sampleId}`,
  productionTrackingId: tracking.id,
  orderId: orderId,
  sampleId: sampleId,
});
```

---

### 4. Quality Control (qualityResolver.ts)

#### 🔴 CRITICAL - Missing:
- [ ] `createQualityControl` → Notify manufacturer on quality issues
- [ ] `approveQualityControl` → Notify customer on approval
- [ ] `rejectQualityControl` → Notify customer on rejection

#### Example:
```typescript
// createQualityControl mutation
if (status === "REJECTED") {
  await createNotification(context.prisma, {
    type: "QUALITY",
    title: "⚠️ Quality Issue Detected",
    message: `Quality control failed for ${entityType} #${entityNumber}`,
    userId: manufacturerId,
    link: isOrder ? `/dashboard/orders/${orderId}` : `/dashboard/samples/${sampleId}`,
    productionTrackingId: productionTrackingId,
  });
}
```

---

### 5. Messages & Questions (messageResolver.ts, questionResolver.ts)

#### 🔵 INFO - Missing:
- [ ] `sendMessage` → Notify recipient
- [ ] `createQuestion` → Notify manufacturer
- [ ] `answerQuestion` → Notify customer

#### Example:
```typescript
// sendMessage mutation
await createNotification(context.prisma, {
  type: "MESSAGE",
  title: "💬 New Message",
  message: `You have a new message from ${sender.name}`,
  userId: receiverId,
  link: `/dashboard/messages`,
});

// createQuestion mutation
await createNotification(context.prisma, {
  type: "MESSAGE",
  title: "❓ New Question",
  message: `New question on collection: ${collection.name}`,
  userId: collection.authorId,
  link: `/dashboard/collections/${collection.id}`,
});

// answerQuestion mutation
await createNotification(context.prisma, {
  type: "MESSAGE",
  title: "✅ Question Answered",
  message: `Your question on ${collection.name} has been answered`,
  userId: question.customerId,
  link: `/dashboard/collections/${collection.id}`,
});
```

---

### 6. Reviews & Feedback (reviewResolver.ts)

#### 🔵 INFO - Missing:
- [ ] `createReview` → Notify manufacturer about new review
- [ ] `respondToReview` → Notify customer about response

#### Example:
```typescript
// createReview mutation
await createNotification(context.prisma, {
  type: "MESSAGE",
  title: "⭐ New Review",
  message: `${customer.name} left a ${rating}-star review`,
  userId: manufacturerId,
  link: `/dashboard/orders/${orderId}`,
  orderId: orderId,
});
```

---

### 7. Workshop Management (workshopResolver.ts)

#### 🟡 IMPORTANT - Missing:
- [ ] `assignWorkshop` → Notify workshop about new assignment
- [ ] `updateWorkshopStatus` → Notify production manager

#### Example:
```typescript
// assignWorkshop mutation
await createNotification(context.prisma, {
  type: "PRODUCTION",
  title: "🏭 New Workshop Assignment",
  message: `New ${workshopType} work assigned for ${entityType} #${entityNumber}`,
  userId: workshopOwnerId,
  link: `/dashboard/workshops/${workshopId}`,
});
```

---

### 8. Collection Management (collectionResolver.ts)

#### 🔵 INFO - Missing:
- [ ] `createCollection` → Notify company members (if applicable)
- [ ] `updateCollection` → Notify interested parties (likes/favorites)
- [ ] `deleteCollection` → Notify interested parties

---

### 9. User Management (userResolver.ts)

#### 🟡 IMPORTANT - Missing:
- [ ] `approveUser` → Notify user of approval
- [ ] `rejectUser` → Notify user of rejection
- [ ] User role changes → Notify user

#### Example:
```typescript
// approveUser mutation
await createNotification(context.prisma, {
  type: "SYSTEM",
  title: "✅ Account Approved",
  message: "Your account has been approved. Welcome to the platform!",
  userId: userId,
  link: "/dashboard",
});
```

---

## 🔧 Implementation Steps

### Step 1: Create Notification Templates (RECOMMENDED)
Create standardized notification templates to avoid code duplication:

```typescript
// server/src/utils/notificationTemplates.ts

export const NotificationTemplates = {
  ORDER: {
    CREATED: (orderNumber: string) => ({
      title: "🛍️ New Order Received",
      message: `New order #${orderNumber} has been placed`,
    }),
    UPDATED: (orderNumber: string) => ({
      title: "📝 Order Updated",
      message: `Order #${orderNumber} has been updated`,
    }),
    CANCELLED: (orderNumber: string) => ({
      title: "❌ Order Cancelled",
      message: `Order #${orderNumber} has been cancelled`,
    }),
    CONFIRMED: (orderNumber: string) => ({
      title: "✅ Order Confirmed",
      message: `Order #${orderNumber} has been confirmed`,
    }),
    STATUS_CHANGED: (orderNumber: string, newStatus: string) => ({
      title: "📦 Order Status Updated",
      message: `Order #${orderNumber} is now ${newStatus}`,
    }),
  },
  SAMPLE: {
    REQUESTED: (sampleNumber: string) => ({
      title: "🎨 New Sample Request",
      message: `New sample request #${sampleNumber}`,
    }),
    UPDATED: (sampleNumber: string) => ({
      title: "📝 Sample Updated",
      message: `Sample #${sampleNumber} has been updated`,
    }),
    STATUS_CHANGED: (sampleNumber: string, newStatus: string) => ({
      title: "🎨 Sample Status Updated",
      message: `Sample #${sampleNumber} is now ${newStatus}`,
    }),
  },
  PRODUCTION: {
    STAGE_UPDATED: (entityNumber: string, stage: string) => ({
      title: "📦 Production Stage Updated",
      message: `#${entityNumber} - Stage ${stage} completed`,
    }),
    DEADLINE_APPROACHING: (entityNumber: string, hours: number) => ({
      title: "⚠️ Deadline Approaching",
      message: `#${entityNumber} deadline in ${hours} hours`,
    }),
  },
  QUALITY: {
    ISSUE_FOUND: (entityNumber: string) => ({
      title: "⚠️ Quality Issue",
      message: `Quality issue detected in #${entityNumber}`,
    }),
    APPROVED: (entityNumber: string) => ({
      title: "✅ Quality Approved",
      message: `#${entityNumber} passed quality control`,
    }),
  },
  MESSAGE: {
    NEW_MESSAGE: (senderName: string) => ({
      title: "💬 New Message",
      message: `New message from ${senderName}`,
    }),
    QUESTION: (topic: string) => ({
      title: "❓ New Question",
      message: `New question about ${topic}`,
    }),
    ANSWER: (topic: string) => ({
      title: "✅ Question Answered",
      message: `Your question about ${topic} was answered`,
    }),
  },
  SYSTEM: {
    ACCOUNT_APPROVED: () => ({
      title: "✅ Account Approved",
      message: "Welcome! Your account has been approved",
    }),
    ACCOUNT_REJECTED: () => ({
      title: "❌ Account Rejected",
      message: "Sorry, your account request was not approved",
    }),
  },
};

// Usage:
const template = NotificationTemplates.ORDER.CREATED(orderNumber);
await createNotification(context.prisma, {
  type: "ORDER",
  ...template,
  userId: manufacturerId,
  link: `/dashboard/orders/${order.id}`,
  orderId: order.id,
});
```

### Step 2: Create Notification Helper Utilities

```typescript
// server/src/utils/notificationHelpers.ts

export async function notifyOrderParties(
  prisma: PrismaClient,
  order: Order,
  type: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'STATUS_CHANGED',
  excludeUserId?: number
) {
  const template = NotificationTemplates.ORDER[type](order.orderNumber);

  const recipients = [order.customerId, order.manufactureId].filter(
    id => id && id !== excludeUserId
  );

  for (const userId of recipients) {
    await createNotification(prisma, {
      type: "ORDER",
      ...template,
      userId,
      link: `/dashboard/orders/${order.id}`,
      orderId: order.id,
    });
  }
}
```

### Step 3: Add to Each Mutation

Go through each mutation file and add notifications:

1. **orderResolver.ts** - Add to cancelOrder, rejectOrder, updateOrder
2. **sampleResolver.ts** - Add to updateSample, cancelSample, deleteSample
3. **productionResolver.ts** - Add to all stage/status updates
4. **qualityResolver.ts** - Add to all quality control actions
5. **messageResolver.ts** - Add to sendMessage
6. **questionResolver.ts** - Add to createQuestion, answerQuestion
7. **reviewResolver.ts** - Add to createReview, respondToReview
8. **userResolver.ts** - Add to approveUser, rejectUser

## 🎯 Priority Implementation Order

### Phase 1 (High Priority - Do First):
1. ✅ Order cancellation/rejection
2. ✅ Sample updates/cancellation
3. ✅ Production stage updates
4. ✅ Quality control issues

### Phase 2 (Medium Priority):
5. ✅ Messages and questions
6. ✅ Workshop assignments
7. ✅ User approval/rejection

### Phase 3 (Nice to Have):
8. ✅ Reviews and feedback
9. ✅ Collection updates

## 📊 Expected Outcome

After implementation:
- ✅ Users never miss important updates
- ✅ Real-time awareness of order/sample status
- ✅ Better communication between parties
- ✅ Reduced need to manually check pages
- ✅ Improved user engagement

---

**Next Action:** Create notificationTemplates.ts and start with Phase 1 implementations?

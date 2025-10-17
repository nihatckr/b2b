# Notification System Implementation - Summary

## ✅ Created Files

### 1. `server/src/utils/notificationTemplates.ts`
**Purpose:** Standardized notification message templates in Turkish

**What it contains:**
- ORDER templates (created, updated, cancelled, confirmed, status changed, etc.)
- SAMPLE templates (requested, created, updated, approved, rejected, etc.)
- PRODUCTION templates (stage updates, deadlines, delays, notes)
- QUALITY templates (issues, approvals, rejections)
- MESSAGE templates (new messages, questions, answers)
- REVIEW templates (new reviews, responses)
- WORKSHOP templates (assignments, status updates)
- SYSTEM templates (account approval, role changes)
- COLLECTION templates (new, updated, liked)

**Usage:**
```typescript
const template = NotificationTemplates.ORDER.CREATED(orderNumber);
// Returns: { title: "🛍️ Yeni Sipariş Alındı", message: "..." }
```

### 2. `server/src/utils/notificationUtils.ts`
**Purpose:** Helper functions to simplify notification sending

**Functions:**
- `notifyOrderParties()` - Notify customer & manufacturer about order events
- `notifySampleParties()` - Notify customer & manufacturer about sample events
- `notifyProductionUpdate()` - Notify about production tracking updates
- `notifyQualityControl()` - Notify about quality control issues
- `notifyNewMessage()` - Notify about new messages
- `notifyQuestion()` - Notify about questions and answers
- `notifyReview()` - Notify about reviews and responses
- `notifySystemEvent()` - Notify about system events (approval, etc.)

**Usage:**
```typescript
await notifyOrderParties(
  context.prisma,
  order,
  "CANCELLED",
  ["customer"],
  currentUserId // exclude current user
);
```

## 🎯 Next Steps - Add Notifications to Mutations

### Phase 1: Critical Notifications (Do First)

#### 1. Order Mutations (orderResolver.ts)

**cancelOrder mutation:**
```typescript
await notifyOrderParties(
  context.prisma,
  order,
  "CANCELLED",
  [order.orderNumber, "customer"],
  userId // exclude current user
);
```

**rejectOrder mutation:**
```typescript
await notifyOrderParties(
  context.prisma,
  order,
  "REJECTED",
  [order.orderNumber, reason],
  userId
);
```

**updateOrder mutation:**
```typescript
await notifyOrderParties(
  context.prisma,
  order,
  "UPDATED",
  [order.orderNumber],
  userId
);
```

#### 2. Sample Mutations (sampleResolver.ts)

**updateSample mutation:**
```typescript
await notifySampleParties(
  context.prisma,
  sample,
  "UPDATED",
  [sample.sampleNumber],
  userId
);
```

**cancelSample mutation:**
```typescript
await notifySampleParties(
  context.prisma,
  sample,
  "CANCELLED",
  [sample.sampleNumber],
  userId
);
```

**approveSample / rejectSample:**
```typescript
await notifySampleParties(
  context.prisma,
  sample,
  "APPROVED", // or "REJECTED"
  [sample.sampleNumber, reason],
  userId
);
```

#### 3. Production Mutations (productionResolver.ts)

**updateProductionStage mutation:**
```typescript
await notifyProductionUpdate(
  context.prisma,
  tracking,
  order,
  sample,
  "STAGE_COMPLETED",
  [
    isOrder ? "Order" : "Sample",
    referenceNumber,
    stageName
  ],
  userId
);
```

**approveStage mutation:**
```typescript
await notifyProductionUpdate(
  context.prisma,
  tracking,
  order,
  sample,
  "STAGE_APPROVED",
  [isOrder ? "Order" : "Sample", referenceNumber, stageName],
  userId
);
```

**rejectStage mutation:**
```typescript
await notifyProductionUpdate(
  context.prisma,
  tracking,
  order,
  sample,
  "STAGE_REJECTED",
  [isOrder ? "Order" : "Sample", referenceNumber, stageName, reason],
  userId
);
```

#### 4. Quality Control Mutations (qualityResolver.ts - if exists)

**createQualityControl mutation:**
```typescript
await notifyQualityControl(
  context.prisma,
  qualityControl,
  order,
  sample,
  status === "APPROVED" ? "APPROVED" : "ISSUE_FOUND",
  [
    isOrder ? "Order" : "Sample",
    referenceNumber,
    issue || "Quality check completed"
  ],
  status === "APPROVED" ? "customer" : "manufacturer"
);
```

### Phase 2: Important Notifications

#### 5. Message & Question Mutations

**sendMessage mutation (messageResolver.ts):**
```typescript
await notifyNewMessage(
  context.prisma,
  senderId,
  receiverId,
  senderName
);
```

**createQuestion mutation (questionResolver.ts):**
```typescript
await notifyQuestion(
  context.prisma,
  collectionId,
  collection.name,
  collection.authorId,
  askerName,
  "new"
);
```

**answerQuestion mutation:**
```typescript
await notifyQuestion(
  context.prisma,
  collectionId,
  collection.name,
  collection.authorId,
  "",
  "answered",
  question.customerId
);
```

#### 6. Review Mutations (reviewResolver.ts)

**createReview mutation:**
```typescript
await notifyReview(
  context.prisma,
  orderId,
  order.manufactureId,
  customerId,
  "new",
  rating,
  customerName
);
```

**respondToReview mutation:**
```typescript
await notifyReview(
  context.prisma,
  orderId,
  manufacturerId,
  review.customerId,
  "response",
  undefined,
  undefined,
  companyName
);
```

#### 7. User Management (userResolver.ts)

**approveUser mutation:**
```typescript
await notifySystemEvent(
  context.prisma,
  userId,
  "ACCOUNT_APPROVED"
);
```

**rejectUser mutation:**
```typescript
await notifySystemEvent(
  context.prisma,
  userId,
  "ACCOUNT_REJECTED",
  [reason]
);
```

### Phase 3: Nice to Have

#### 8. Workshop Assignments (workshopResolver.ts - if exists)

**assignWorkshop mutation:**
```typescript
const template = NotificationTemplates.WORKSHOP.NEW_ASSIGNMENT(
  workshopType,
  isOrder ? "Order" : "Sample",
  referenceNumber
);

await createNotification(context.prisma, {
  type: "PRODUCTION",
  ...template,
  userId: workshopOwnerId,
  link: `/dashboard/workshops/${workshopId}`,
});
```

## 📝 Implementation Checklist

### Files to Modify:

- [ ] `server/src/mutations/orderResolver.ts`
  - [ ] Add import: `import { notifyOrderParties } from "../utils/notificationUtils";`
  - [ ] cancelOrder → Add notification
  - [ ] rejectOrder → Add notification
  - [ ] updateOrder → Add notification

- [ ] `server/src/mutations/sampleResolver.ts`
  - [ ] Add import: `import { notifySampleParties } from "../utils/notificationUtils";`
  - [ ] updateSample → Add notification
  - [ ] cancelSample → Add notification (if exists)
  - [ ] approveSample → Add notification
  - [ ] rejectSample → Add notification

- [ ] `server/src/mutations/productionResolver.ts`
  - [ ] Add import: `import { notifyProductionUpdate } from "../utils/notificationUtils";`
  - [ ] updateProductionStage → Add notification
  - [ ] approveStage → Add notification
  - [ ] rejectStage → Add notification
  - [ ] addProductionNote → Add notification
  - [ ] updateEstimatedDates → Add notification

- [ ] `server/src/mutations/messageResolver.ts`
  - [ ] Add import: `import { notifyNewMessage } from "../utils/notificationUtils";`
  - [ ] sendMessage → Add notification

- [ ] `server/src/mutations/questionResolver.ts`
  - [ ] Add import: `import { notifyQuestion } from "../utils/notificationUtils";`
  - [ ] createQuestion → Add notification
  - [ ] answerQuestion → Add notification

- [ ] `server/src/mutations/reviewResolver.ts`
  - [ ] Add import: `import { notifyReview } from "../utils/notificationUtils";`
  - [ ] createReview → Add notification
  - [ ] respondToReview → Add notification

- [ ] `server/src/mutations/userResolver.ts`
  - [ ] Add import: `import { notifySystemEvent } from "../utils/notificationUtils";`
  - [ ] approveUser → Add notification
  - [ ] rejectUser → Add notification

## 🎯 Benefits After Implementation

✅ **Real-time awareness** - Users instantly know about important events
✅ **Better communication** - No missed updates between parties
✅ **Reduced manual checking** - Users don't need to refresh pages constantly
✅ **Improved UX** - Professional, responsive platform feel
✅ **Clear history** - Notification list = audit trail of all events
✅ **Standardized messaging** - Consistent, professional Turkish notifications

## 🚀 How to Start

1. **Review the templates** - Check if Turkish messages are appropriate
2. **Start with Phase 1** - Add critical order/sample notifications first
3. **Test each mutation** - Verify notifications appear correctly
4. **Monitor performance** - Ensure no performance impact
5. **Iterate through phases** - Add more notifications progressively

---

**Ready to implement?** Start with orderResolver.ts - that's the most critical!

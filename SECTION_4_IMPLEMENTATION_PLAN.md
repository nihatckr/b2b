# Section 4: Backend-to-Frontend Integration Plan

## 📊 Executive Summary

**Current Status**: Backend has 36 fully functional GraphQL modules, but frontend only implements ~27% (10 modules).

**Gap Analysis**:

- ✅ **Implemented (10 modules)**: Admin (users, companies, categories), Auth, Dashboard basics, Settings
- ❌ **Missing (26 modules)**: Collections, Samples, Orders, Production, Tasks, Messages, Library, Reviews, Questions, Analytics, Workshops, Advanced Search

**Goal**: Implement all missing backend features in frontend with full CRUD, real-time updates, and role-based access control.

---

## 🎯 Priority Matrix

### Priority 0: Library Management (Week 0 - 3-4 days) 🔴 PREREQUISITE

**⚠️ MUST be completed FIRST - Collections depends on Library data**

**Why First:**
Collections form needs to select from Library:

- Colors (LibraryColor)
- Fit Types (LibraryFit)
- Size Groups (LibrarySizeGroup)
- Certifications (LibraryCertification)
- Fabric Composition (LibraryFabric) - optional

**Backend Status**: ✅ 100% Complete (LibraryItem unified model + queries/mutations)

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── library.graphql              # NEW: All library operations
├── app/(protected)/dashboard/
│   └── library/
│       ├── page.tsx                 # NEW: Library dashboard (tabs)
│       ├── colors/page.tsx          # NEW: Color palette
│       ├── fabrics/page.tsx         # NEW: Fabrics
│       ├── size-groups/page.tsx     # NEW: Size groups
│       ├── fits/page.tsx            # NEW: Fits
│       └── certifications/page.tsx  # NEW: Certifications
└── components/
    └── library/
        ├── ColorSelector.tsx        # NEW: Reusable for forms
        ├── FitSelector.tsx          # NEW: Reusable for forms
        ├── SizeGroupSelector.tsx    # NEW: Reusable for forms
        └── CertificationSelector.tsx # NEW: Reusable for forms
```

**Key Features**:

- 📚 7 Library Categories (Color, Fabric, Material, SizeGroup, Fit, Certification)
- 🌐 Platform Standards (Admin-created, visible to all)
- 🏢 Company Custom (Each company adds their own)
- 🔄 Reusable Selectors (For Collection/Sample forms)

**Estimated Effort**: 3-4 days

**Detailed Plan**: See `LIBRARY_MANAGEMENT_PLAN.md`

---

### Priority 1: Core Business Features (Week 1-3)

**Critical path features that enable the main textile workflow**

#### 1.1 Collections Management 🔴 CRITICAL (DEPENDS ON LIBRARY)

**Backend Status**: ✅ Complete (collectionQuery.ts, collectionMutation.ts)

- **Queries**: collections, collection, myCollections
- **Mutations**: createCollection, updateCollection, deleteCollection

**Frontend Tasks**:

```bash
# File Structure to Create:
frontend/src/
├── graphql/
│   └── collections.graphql          # NEW: All collection operations
├── app/(protected)/dashboard/
│   └── collections/
│       ├── page.tsx                 # NEW: Collections list page
│       ├── [id]/
│       │   └── page.tsx             # NEW: Collection detail page
│       └── components/
│           ├── CollectionCard.tsx   # NEW
│           ├── CollectionForm.tsx   # NEW
│           ├── CollectionFilters.tsx # NEW
│           └── CollectionTable.tsx  # NEW
└── hooks/
    └── useCollections.ts            # NEW: Collection-specific hooks
```

**GraphQL Operations** (collections.graphql):

```graphql
# Queries
query DashboardCollections(
  $skip: Int
  $take: Int
  $search: String
  $featured: Boolean
) {
  collections(skip: $skip, take: $take, search: $search, featured: $featured) {
    id
    name
    modelCode
    description
    season
    year
    targetMarket
    priceRange
    isFeatured
    isActive
    imageUrls
    manufacturer {
      id
      name
    }
    samples {
      id
      name
      status
    }
    createdAt
    updatedAt
  }
}

query DashboardCollectionDetail($id: Int!) {
  collection(id: $id) {
    id
    name
    modelCode
    description
    season
    year
    targetMarket
    priceRange
    isFeatured
    isActive
    imageUrls
    manufacturer {
      id
      name
      email
    }
    samples {
      id
      name
      sampleNumber
      status
      imageUrls
      createdAt
    }
    createdAt
    updatedAt
  }
}

# Mutations
mutation DashboardCreateCollection(
  $name: String!
  $modelCode: String!
  $description: String
  $season: String
  $year: Int
  $targetMarket: String
  $priceRange: String
  $isFeatured: Boolean
) {
  createCollection(
    name: $name
    modelCode: $modelCode
    description: $description
    season: $season
    year: $year
    targetMarket: $targetMarket
    priceRange: $priceRange
    isFeatured: $isFeatured
  ) {
    id
    name
    modelCode
  }
}

mutation DashboardUpdateCollection(
  $id: Int!
  $name: String
  $modelCode: String
  $description: String
  $season: String
  $year: Int
  $targetMarket: String
  $priceRange: String
  $isFeatured: Boolean
  $isActive: Boolean
  $imageUrls: [String!]
) {
  updateCollection(
    id: $id
    name: $name
    modelCode: $modelCode
    description: $description
    season: $season
    year: $year
    targetMarket: $targetMarket
    priceRange: $priceRange
    isFeatured: $isFeatured
    isActive: $isActive
    imageUrls: $imageUrls
  ) {
    id
    name
    modelCode
  }
}

mutation DashboardDeleteCollection($id: Int!) {
  deleteCollection(id: $id) {
    id
    name
  }
}
```

**UI Components**:

1. **CollectionCard.tsx**: Grid/card view with image, name, sample count, season
2. **CollectionTable.tsx**: List view with sortable columns, filters, bulk actions
3. **CollectionForm.tsx**: Create/Edit form with image upload, validation
4. **CollectionFilters.tsx**: Season, year, featured, active filters

**Estimated Effort**: 3-4 days

---

#### 1.2 Samples Management 🔴 CRITICAL

**Backend Status**: ✅ Complete (sampleQuery.ts, sampleMutation.ts, sampleSubscriptions.ts)

- **Queries**: samples, sample, mySamples
- **Mutations**: createSample, updateSample, deleteSample, updateSampleStatus
- **Subscriptions**: sampleStatusChanged

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── samples.graphql              # NEW: All sample operations + subscriptions
├── app/(protected)/dashboard/
│   └── samples/
│       ├── page.tsx                 # NEW: Samples list (with status filters)
│       ├── [id]/
│       │   ├── page.tsx             # NEW: Sample detail with status timeline
│       │   └── timeline/
│       │       └── page.tsx         # NEW: Sample workflow visualization
│       └── components/
│           ├── SampleCard.tsx       # NEW: Sample card with status badge
│           ├── SampleForm.tsx       # NEW: Multi-step form
│           ├── SampleStatusBadge.tsx # NEW: Dynamic status colors
│           ├── SampleTimeline.tsx   # NEW: Status history timeline
│           └── SampleFilters.tsx    # NEW: Status, collection, date filters
└── hooks/
    ├── useSamples.ts                # NEW
    └── useSampleSubscription.ts     # NEW: Real-time status updates
```

**GraphQL Operations** (samples.graphql):

```graphql
# Queries
query DashboardSamples(
  $skip: Int
  $take: Int
  $status: String
  $search: String
) {
  samples(skip: $skip, take: $take, status: $status, search: $search) {
    id
    sampleNumber
    name
    status
    description
    imageUrls
    collection {
      id
      name
      modelCode
    }
    manufacturer {
      id
      name
    }
    customer {
      id
      name
    }
    createdAt
    updatedAt
  }
}

query DashboardSampleDetail($id: Int!) {
  sample(id: $id) {
    id
    sampleNumber
    name
    status
    description
    imageUrls
    collection {
      id
      name
      modelCode
      season
      year
    }
    manufacturer {
      id
      name
      email
      phone
    }
    customer {
      id
      name
      email
      phone
    }
    tasks {
      id
      title
      status
      priority
      dueDate
    }
    productionTracking {
      id
      stage
      status
      progress
    }
    createdAt
    updatedAt
  }
}

# Mutations
mutation DashboardCreateSample(
  $name: String!
  $sampleNumber: String!
  $description: String
  $collectionId: Int!
  $customerId: Int!
  $imageUrls: [String!]
) {
  createSample(
    name: $name
    sampleNumber: $sampleNumber
    description: $description
    collectionId: $collectionId
    customerId: $customerId
    imageUrls: $imageUrls
  ) {
    id
    sampleNumber
    name
  }
}

mutation DashboardUpdateSampleStatus($id: Int!, $status: String!) {
  updateSampleStatus(id: $id, status: $status) {
    id
    status
  }
}

# Subscriptions
subscription DashboardSampleStatusChanged($sampleId: Int!) {
  sampleStatusChanged(sampleId: $sampleId) {
    id
    status
    updatedAt
  }
}
```

**Key Features**:

- 🔄 **Real-time status updates** via WebSocket subscription
- 📊 **28 Sample statuses** (DESIGN_REQUESTED → DELIVERED)
- 🎯 **Dynamic Task System integration** (auto-creates tasks on status change)
- 📸 **Multi-image upload** with Sharp optimization

**Estimated Effort**: 5-6 days

---

#### 1.3 Orders Management 🔴 CRITICAL

**Backend Status**: ✅ Complete (orderQuery.ts, orderMutation.ts, orderSubscriptions.ts)

- **Queries**: orders, order, myOrders
- **Mutations**: createOrder, updateOrder, deleteOrder, updateOrderStatus
- **Subscriptions**: orderStatusChanged

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── orders.graphql               # NEW: All order operations + subscriptions
├── app/(protected)/dashboard/
│   └── orders/
│       ├── page.tsx                 # NEW: Orders list with status filters
│       ├── [id]/
│       │   ├── page.tsx             # NEW: Order detail with items
│       │   └── invoice/
│       │       └── page.tsx         # NEW: Invoice generation
│       └── components/
│           ├── OrderCard.tsx        # NEW
│           ├── OrderForm.tsx        # NEW: Multi-item order form
│           ├── OrderStatusBadge.tsx # NEW
│           ├── OrderTimeline.tsx    # NEW
│           └── OrderItemsTable.tsx  # NEW: Order items management
└── hooks/
    ├── useOrders.ts                 # NEW
    └── useOrderSubscription.ts      # NEW
```

**GraphQL Operations** (orders.graphql):

```graphql
query DashboardOrders(
  $skip: Int
  $take: Int
  $status: String
  $search: String
) {
  orders(skip: $skip, take: $take, status: $status, search: $search) {
    id
    orderNumber
    status
    totalAmount
    currency
    customer {
      id
      name
    }
    manufacturer {
      id
      name
    }
    items {
      id
      quantity
      unitPrice
      sample {
        id
        name
      }
    }
    createdAt
    deliveryDate
  }
}

query DashboardOrderDetail($id: Int!) {
  order(id: $id) {
    id
    orderNumber
    status
    totalAmount
    currency
    notes
    customer {
      id
      name
      email
      phone
    }
    manufacturer {
      id
      name
      email
      phone
    }
    items {
      id
      quantity
      unitPrice
      totalPrice
      sample {
        id
        name
        sampleNumber
        imageUrls
      }
    }
    productionTracking {
      id
      stage
      status
      progress
    }
    createdAt
    updatedAt
    deliveryDate
  }
}

mutation DashboardCreateOrder(
  $orderNumber: String!
  $customerId: Int!
  $manufactureId: Int!
  $totalAmount: Float!
  $currency: String
  $deliveryDate: String
  $notes: String
  $items: [OrderItemInput!]!
) {
  createOrder(
    orderNumber: $orderNumber
    customerId: $customerId
    manufactureId: $manufactureId
    totalAmount: $totalAmount
    currency: $currency
    deliveryDate: $deliveryDate
    notes: $notes
    items: $items
  ) {
    id
    orderNumber
  }
}

mutation DashboardUpdateOrderStatus($id: Int!, $status: String!) {
  updateOrderStatus(id: $id, status: $status) {
    id
    status
  }
}

subscription DashboardOrderStatusChanged($orderId: Int!) {
  orderStatusChanged(orderId: $orderId) {
    id
    status
    updatedAt
  }
}
```

**Key Features**:

- 🧾 **Multi-item orders** with sample selection
- 💰 **Price calculation** (quantity × unit price)
- 📦 **15 Order statuses** (PENDING → DELIVERED)
- 🔔 **Real-time status notifications**

**Estimated Effort**: 5-6 days

---

### Priority 2: Production & Quality (Week 4-5)

#### 2.1 Production Tracking 🟠 HIGH

**Backend Status**: ✅ Complete (productionQuery.ts, productionMutation.ts, productionSubscriptions.ts)

- **7 Production Stages**: FABRIC_PREPARATION → QUALITY_CONTROL → PACKAGING
- **Real-time progress updates**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── production.graphql           # NEW
├── app/(protected)/dashboard/
│   └── production/
│       ├── page.tsx                 # NEW: Production board (Kanban style)
│       ├── [id]/
│       │   └── page.tsx             # NEW: Production detail with progress bars
│       └── components/
│           ├── ProductionKanban.tsx # NEW: 7-column Kanban board
│           ├── ProductionCard.tsx   # NEW
│           └── ProgressIndicator.tsx # NEW: Stage progress visualization
└── hooks/
    ├── useProduction.ts             # NEW
    └── useProductionSubscription.ts # NEW
```

**Key Features**:

- 📊 **7-stage Kanban board** (drag & drop)
- 📈 **Progress tracking** (0-100% per stage)
- 🎯 **Workshop assignment**
- ⏱️ **Time tracking** per stage

**Estimated Effort**: 4-5 days

---

#### 2.2 Tasks Management 🟠 HIGH

**Backend Status**: ✅ Complete (taskQuery.ts, taskMutation.ts, taskSubscriptions.ts)

- **Dynamic Task System** (700+ lines automation)
- **Auto-creates tasks** on sample/order status changes

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── tasks.graphql                # NEW
├── app/(protected)/dashboard/
│   └── tasks/
│       ├── page.tsx                 # NEW: Task board (My Tasks, Assigned to Me)
│       ├── [id]/
│       │   └── page.tsx             # NEW: Task detail
│       └── components/
│           ├── TaskCard.tsx         # NEW: Priority badge, due date
│           ├── TaskForm.tsx         # NEW
│           ├── TaskFilters.tsx      # NEW: Status, priority, type
│           └── TaskTimeline.tsx     # NEW: Task history
└── hooks/
    ├── useTasks.ts                  # NEW
    └── useTaskSubscription.ts       # NEW
```

**GraphQL Operations** (tasks.graphql):

```graphql
query DashboardMyTasks($status: String, $priority: String) {
  myTasks(status: $status, priority: $priority) {
    id
    title
    description
    type
    status
    priority
    dueDate
    relatedStatus
    targetStatus
    entityType
    collection {
      id
      name
    }
    sample {
      id
      name
      sampleNumber
    }
    order {
      id
      orderNumber
    }
    assignedTo {
      id
      name
    }
    createdAt
  }
}

mutation DashboardCreateTask(
  $title: String!
  $description: String
  $type: String!
  $priority: String
  $dueDate: String
  $sampleId: Int
  $orderId: Int
  $collectionId: Int
) {
  createTask(
    title: $title
    description: $description
    type: $type
    priority: $priority
    dueDate: $dueDate
    sampleId: $sampleId
    orderId: $orderId
    collectionId: $collectionId
  ) {
    id
    title
  }
}

subscription DashboardTaskUpdated($taskId: Int!) {
  taskUpdated(taskId: $taskId) {
    id
    status
    updatedAt
  }
}
```

**Key Features**:

- ✅ **Auto-generated tasks** from status changes
- 🎯 **Task assignment** (user-based)
- ⏰ **Due date management**
- 🔔 **Real-time task notifications**

**Estimated Effort**: 4-5 days

---

#### 2.3 Workshops Management 🟡 MEDIUM

**Backend Status**: ✅ Complete (workshopQuery.ts, workshopMutation.ts)

- **Workshop CRUD**
- **Production stage assignment**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── workshops.graphql            # NEW
├── app/(protected)/dashboard/
│   └── workshops/
│       ├── page.tsx                 # NEW: Workshops list
│       ├── [id]/
│       │   └── page.tsx             # NEW: Workshop detail with productions
│       └── components/
│           ├── WorkshopCard.tsx     # NEW
│           └── WorkshopForm.tsx     # NEW
└── hooks/
    └── useWorkshops.ts              # NEW
```

**Estimated Effort**: 2-3 days

---

### Priority 3: Communication & Collaboration (Week 6-7)

#### 3.1 Messages System 🟡 MEDIUM

**Backend Status**: ✅ Complete (messageQuery.ts, messageMutation.ts, messageSubscriptions.ts)

- **Real-time messaging**
- **Sample/Order/Collection context**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── messages.graphql             # NEW
├── app/(protected)/dashboard/
│   └── messages/
│       ├── page.tsx                 # NEW: Inbox with threads
│       ├── [id]/
│       │   └── page.tsx             # NEW: Message thread
│       └── components/
│           ├── MessageThread.tsx    # NEW: Chat-like interface
│           ├── MessageComposer.tsx  # NEW
│           └── MessageNotification.tsx # NEW
└── hooks/
    ├── useMessages.ts               # NEW
    └── useMessageSubscription.ts    # NEW
```

**Key Features**:

- 💬 **Real-time chat** (WebSocket)
- 📎 **Context-aware messaging** (sample/order references)
- 🔔 **Unread count badges**

**Estimated Effort**: 4-5 days

---

#### 3.2 Reviews & Questions 🟡 MEDIUM

**Backend Status**: ✅ Complete (reviewQuery.ts, questionQuery.ts, reviewMutation.ts)

- **Sample reviews**
- **Q&A system**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   ├── reviews.graphql              # NEW
│   └── questions.graphql            # NEW
├── app/(protected)/dashboard/
│   └── reviews/
│       ├── page.tsx                 # NEW: All reviews
│       └── components/
│           ├── ReviewCard.tsx       # NEW: Star rating, comment
│           └── ReviewForm.tsx       # NEW
│   └── questions/
│       ├── page.tsx                 # NEW: Q&A board
│       └── components/
│           ├── QuestionCard.tsx     # NEW
│           └── AnswerForm.tsx       # NEW
```

**Estimated Effort**: 3-4 days

---

#### 3.3 Notifications (Detailed) 🟡 MEDIUM

**Backend Status**: ✅ Complete (notificationQuery.ts, notificationMutation.ts, notificationSubscriptions.ts)

- **Currently**: Basic notifications exist in frontend
- **Missing**: Detailed notification center, filters, mark as read

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── notifications.graphql        # EXPAND: Add detailed operations
├── app/(protected)/dashboard/
│   └── notifications/
│       └── components/
│           ├── NotificationCenter.tsx # NEW: Dropdown panel
│           ├── NotificationItem.tsx  # NEW
│           └── NotificationFilters.tsx # NEW
└── hooks/
    └── useNotificationSubscription.ts # EXPAND
```

**Estimated Effort**: 2-3 days

---

### Priority 4: Support Systems (Week 8-9)

#### 4.1 Library Management 🟢 LOW

**Backend Status**: ✅ Complete (libraryQuery.ts, libraryMutation.ts)

- **Color library**
- **Fabric library**
- **Size library**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── library.graphql              # NEW
├── app/(protected)/dashboard/
│   └── library/
│       ├── colors/
│       │   └── page.tsx             # NEW: Color palette management
│       ├── fabrics/
│       │   └── page.tsx             # NEW: Fabric types
│       └── sizes/
│           └── page.tsx             # NEW: Size charts
```

**Estimated Effort**: 3-4 days

---

#### 4.2 Analytics Dashboard 🟢 LOW

**Backend Status**: ✅ Complete (analyticsQuery.ts)

- **Sales analytics**
- **Production metrics**
- **User activity**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── analytics.graphql            # NEW
├── app/(protected)/dashboard/
│   └── analytics/
│       ├── page.tsx                 # NEW: Analytics dashboard
│       └── components/
│           ├── SalesChart.tsx       # NEW: Chart.js/Recharts
│           ├── ProductionMetrics.tsx # NEW
│           └── ActivityHeatmap.tsx  # NEW
```

**Estimated Effort**: 4-5 days

---

#### 4.3 Advanced Search & Filters 🟢 LOW

**Backend Status**: ✅ Complete (advancedQuery.ts)

- **Global search**
- **Advanced filters**

**Frontend Tasks**:

```bash
frontend/src/
├── graphql/
│   └── advanced.graphql             # NEW
├── components/
│   └── search/
│       ├── GlobalSearch.tsx         # NEW: Omnisearch bar
│       ├── AdvancedFilters.tsx      # NEW
│       └── SearchResults.tsx        # NEW
```

**Estimated Effort**: 2-3 days

---

## 🏗️ Architecture Guidelines

### GraphQL Codegen Workflow

```bash
# After creating any .graphql file:
cd frontend && npm run codegen

# This generates:
# - src/__generated__/graphql.ts (TypeScript types)
# - Document exports (e.g., DashboardSamplesDocument)
```

### Naming Conventions

```graphql
# ✅ GOOD: Context prefix
query DashboardSamples { ... }
query AdminUsers { ... }
query UserProfileSettings { ... }

# ❌ BAD: Generic names
query Samples { ... }  # Conflicts possible
query Users { ... }    # Ambiguous
```

### ID Handling

```typescript
// ⚠️ CRITICAL: Check backend GraphQL type first

// Relay Global ID (Base64) - User, Company, Sample, Collection
import { useRelayIds } from "@/hooks/useRelayIds";
const { decodeGlobalId } = useRelayIds();
const numericId = decodeGlobalId(sample.id); // "U2FtcGxlOjE=" → 1

// Numeric ID (String) - StandardCategory, LibraryItem, CompanyCategory
const numericId = Number(category.id); // "1" → 1
```

### Component Structure

```typescript
// pages/samples/page.tsx (List View)
"use client";

import { useQuery } from "urql";
import { DashboardSamplesDocument } from "@/__generated__/graphql";
import SampleCard from "./components/SampleCard";
import SampleFilters from "./components/SampleFilters";

export default function SamplesPage() {
  const [filters, setFilters] = useState({ status: null, search: "" });

  const [{ data, fetching }] = useQuery({
    query: DashboardSamplesDocument,
    variables: filters,
  });

  return (
    <div>
      <SampleFilters onChange={setFilters} />
      <div className="grid grid-cols-3 gap-4">
        {data?.samples.map((sample) => (
          <SampleCard key={sample.id} sample={sample} />
        ))}
      </div>
    </div>
  );
}
```

### Real-time Subscriptions

```typescript
// hooks/useSampleSubscription.ts
import { useSubscription } from "urql";
import { DashboardSampleStatusChangedDocument } from "@/__generated__/graphql";

export function useSampleSubscription(sampleId: number) {
  const [{ data }] = useSubscription({
    query: DashboardSampleStatusChangedDocument,
    variables: { sampleId },
  });

  useEffect(() => {
    if (data?.sampleStatusChanged) {
      // Trigger refetch or update local state
      toast.success(
        `Sample status changed to ${data.sampleStatusChanged.status}`
      );
    }
  }, [data]);
}
```

### Cache Invalidation

```typescript
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";

const { execute: deleteSample } = useOptimisticMutation({
  mutation: deleteSampleMutation,
  successMessage: "Sample deleted",
  errorMessage: "Failed to delete sample",
  refetchQueries: [
    { refetch: refetchSamples, requestPolicy: "network-only" }, // ✅ Always network-only
    { refetch: refetchStats, requestPolicy: "network-only" },
  ],
});
```

---

## 📅 Development Timeline

### Week 1-2: Collections & Samples Foundation

- ✅ Day 1-3: Collections CRUD (queries, mutations, UI)
- ✅ Day 4-5: Collections detail page, image upload
- ✅ Day 6-8: Samples CRUD, status management
- ✅ Day 9-10: Samples real-time subscriptions

### Week 3: Orders System

- ✅ Day 1-3: Orders CRUD, multi-item support
- ✅ Day 4-5: Order detail page, invoice generation

### Week 4: Production Tracking

- ✅ Day 1-3: Production Kanban board
- ✅ Day 4-5: Production detail, progress tracking

### Week 5: Tasks & Workshops

- ✅ Day 1-3: Tasks board, filters
- ✅ Day 4-5: Workshops CRUD

### Week 6-7: Communication

- ✅ Day 1-3: Messages real-time chat
- ✅ Day 4-5: Reviews & Questions
- ✅ Day 6-7: Notifications detailed

### Week 8-9: Support Systems

- ✅ Day 1-2: Library management
- ✅ Day 3-5: Analytics dashboard
- ✅ Day 6-7: Advanced search

---

## 🧪 Testing Strategy

### For Each Feature:

1. **Unit Tests**: Component rendering, hooks logic
2. **Integration Tests**: GraphQL queries/mutations
3. **E2E Tests**: Full user flows (Playwright)
4. **Role-Based Tests**: Admin, Owner, Employee, Customer access

### Test Accounts (Post-Seed):

```bash
# Admin
admin@protexflow.com / Admin123!

# Manufacturer
owner@textile.com / Owner123!

# Customer
owner@fashionretail.com / Customer123!
```

### Testing Checklist Per Feature:

- [ ] CRUD operations work
- [ ] Real-time updates trigger
- [ ] Cache invalidation correct
- [ ] Error handling displays messages
- [ ] Form validation prevents bad data
- [ ] Permission checks enforce RBAC
- [ ] Mobile responsive (TailwindCSS breakpoints)
- [ ] Loading states show during fetches

---

## 🚀 Development Commands

### Backend

```bash
cd backend
npm run dev              # Start GraphQL server (port 4001)
npx prisma studio        # Visual DB management
npx prisma migrate dev   # Run migrations
```

### Frontend

```bash
cd frontend
npm run dev              # Start Next.js (port 3000)
npm run codegen          # Generate GraphQL types (after .graphql changes)
```

### Critical Workflow

```bash
# After ANY backend schema change:
cd backend && npx prisma generate && npx prisma migrate dev
cd ../frontend && npm run codegen
```

---

## 📊 Progress Tracking

### Implementation Checklist

#### Priority 1 (Critical)

- [ ] Collections Management (3-4 days)

  - [ ] GraphQL operations (collections.graphql)
  - [ ] List page with filters
  - [ ] Detail page with samples
  - [ ] Create/Edit form with image upload
  - [ ] Delete with confirmation

- [ ] Samples Management (5-6 days)

  - [ ] GraphQL operations (samples.graphql)
  - [ ] List page with status filters
  - [ ] Detail page with timeline
  - [ ] Status update flow
  - [ ] Real-time subscription
  - [ ] Task integration display

- [ ] Orders Management (5-6 days)
  - [ ] GraphQL operations (orders.graphql)
  - [ ] List page with status filters
  - [ ] Detail page with items
  - [ ] Multi-item order form
  - [ ] Status update flow
  - [ ] Real-time subscription
  - [ ] Invoice generation

#### Priority 2 (High)

- [ ] Production Tracking (4-5 days)
- [ ] Tasks Management (4-5 days)
- [ ] Workshops Management (2-3 days)

#### Priority 3 (Medium)

- [ ] Messages System (4-5 days)
- [ ] Reviews & Questions (3-4 days)
- [ ] Notifications Detailed (2-3 days)

#### Priority 4 (Low)

- [ ] Library Management (3-4 days)
- [ ] Analytics Dashboard (4-5 days)
- [ ] Advanced Search (2-3 days)

---

## 🎯 Success Criteria

### Per Feature:

1. ✅ All backend queries/mutations accessible from frontend
2. ✅ Real-time updates working (subscriptions)
3. ✅ CRUD operations complete
4. ✅ Permission checks enforced
5. ✅ Error handling with user-friendly messages
6. ✅ Loading states during async operations
7. ✅ Cache invalidation after mutations
8. ✅ Mobile responsive UI

### Overall:

- ✅ 100% backend coverage (36/36 modules)
- ✅ All user roles can access permitted features
- ✅ Zero TypeScript errors
- ✅ Zero console errors in production build
- ✅ Dynamic Task System triggers on all status changes
- ✅ Real-time notifications for all events

---

## 🔗 Related Documentation

- `/.github/copilot-instructions.md` - AI coding agent instructions
- `/backend/HOW_TO_ADD_NEW_FEATURES.md` - Backend development guide
- `/frontend/URQL_USAGE_GUIDE.md` - URQL patterns
- `/frontend/WEBSOCKET_SUBSCRIPTIONS_GUIDE.md` - Real-time subscriptions
- `/docs/QUICK-START.md` - Project setup

---

## 📝 Notes

### JSON Field Validation

**Critical**: All Prisma JSON fields must validate empty strings:

```typescript
// Frontend
let cleanKeywords: string | undefined = undefined;
if (formData.keywords && formData.keywords.trim() !== "") {
  try {
    JSON.parse(formData.keywords);
    cleanKeywords = formData.keywords;
  } catch (e) {
    cleanKeywords = undefined;
  }
}

// Backend
if (input.keywords !== undefined && input.keywords !== null) {
  const trimmed = input.keywords.trim();
  if (trimmed === "") {
    updateData.keywords = null;
  } else {
    try {
      updateData.keywords = JSON.parse(trimmed);
    } catch (e) {
      throw new Error("Invalid JSON in keywords field");
    }
  }
}
```

### Global ID vs Numeric ID

- **Relay Global ID** (User, Company, Sample, Collection, Order): Use `decodeGlobalId(id)`
- **Numeric ID** (StandardCategory, LibraryItem, CompanyCategory): Use `Number(id)`

### Cache Management

- **Always** use `requestPolicy: "network-only"` in refetch queries
- **Never** rely on cache after mutations
- **Use** `useOptimisticMutation` hook for consistent refetch patterns

---

## 🚦 Getting Started

**Recommended Order**:

1. **Start with Collections** (simplest CRUD, no complex relations)
2. **Move to Samples** (adds status management, subscriptions)
3. **Then Orders** (multi-item complexity)
4. **Production & Tasks** (real-time tracking)
5. **Communication features** (messages, reviews)
6. **Support systems** (library, analytics)

**First Steps**:

```bash
# 1. Create collections.graphql
cd frontend/src/graphql
touch collections.graphql

# 2. Add GraphQL operations (queries + mutations)

# 3. Run codegen
cd ../.. && npm run codegen

# 4. Create page structure
mkdir -p src/app/\(protected\)/dashboard/collections
touch src/app/\(protected\)/dashboard/collections/page.tsx

# 5. Import generated types
# import { DashboardCollectionsDocument } from "@/__generated__/graphql";
```

---

**Total Estimated Effort**: 8-9 weeks (full-time developer)

**Current Status**: Section 1-3 Complete (Backend + Admin), Ready for Section 4 Development

**Goal**: Achieve 100% backend-to-frontend parity with full real-time capabilities

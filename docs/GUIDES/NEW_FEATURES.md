# 🚀 Adding New Features - Developer Guide

> Step-by-step guide for adding new features to ProtexFlow

---

## 📋 Table of Contents

- [Overview](#overview)
- [Before You Start](#before-you-start)
- [Feature Development Workflow](#feature-development-workflow)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Testing Your Feature](#testing-your-feature)
- [Common Patterns](#common-patterns)

---

## 🎯 Overview

This guide walks you through adding a new feature to ProtexFlow, following our established patterns and best practices.

**Example Feature**: We'll add a "Product Reviews" system where customers can review samples.

---

## ✅ Before You Start

### 1. Read Core Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Understand system design
- [DATABASE.md](../DATABASE.md) - Database schema patterns
- [AUTHENTICATION.md](../AUTHENTICATION.md) - Security layers
- [RBAC.md](../RBAC.md) - Permission system

### 2. Plan Your Feature

Answer these questions:

- **What**: What does this feature do?
- **Who**: Which roles can use it?
- **Where**: Which pages will it appear on?
- **How**: What's the data flow?
- **Security**: What permissions are needed?

### 3. Check Dependencies

```bash
# Backend
cd backend
npm list    # Check installed packages

# Frontend
cd frontend
npm list    # Check installed packages
```

---

## 🔄 Feature Development Workflow

```
1. Database Schema (Prisma)
         ↓
2. Generate Prisma Client
         ↓
3. GraphQL Types (Pothos)
         ↓
4. GraphQL Resolvers (Queries & Mutations)
         ↓
5. GraphQL Shield Permissions
         ↓
6. Frontend GraphQL Operations
         ↓
7. Generate GraphQL Types (Codegen)
         ↓
8. React Components
         ↓
9. Pages & Routes
         ↓
10. Testing
         ↓
11. Documentation
```

---

## 🗄️ Backend Development

### Step 1: Database Schema

**File**: `backend/prisma/schema.prisma`

```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5 stars
  comment   String?  @db.Text

  // Relations
  sampleId  String
  sample    Sample   @relation(fields: [sampleId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Indexes
  @@index([sampleId])
  @@index([userId])
  @@unique([sampleId, userId]) // One review per user per sample
}
```

**Add to existing models**:

```prisma
model Sample {
  // ... existing fields
  reviews  Review[]
}

model User {
  // ... existing fields
  reviews  Review[]
}
```

**Run migration**:

```bash
cd backend
npx prisma migrate dev --name add_review_model
npx prisma generate
```

### Step 2: GraphQL Type Definition

**File**: `backend/src/graphql/types/Review.ts`

```typescript
import { builder } from "../builder";

export const ReviewType = builder.prismaObject("Review", {
  fields: (t) => ({
    id: t.exposeID("id"),
    rating: t.exposeInt("rating"),
    comment: t.exposeString("comment", { nullable: true }),

    // Relations
    sample: t.relation("sample"),
    user: t.relation("user"),

    // Timestamps
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Input types
export const CreateReviewInput = builder.inputType("CreateReviewInput", {
  fields: (t) => ({
    sampleId: t.string({ required: true }),
    rating: t.int({ required: true, validate: { min: 1, max: 5 } }),
    comment: t.string({ required: false }),
  }),
});

export const UpdateReviewInput = builder.inputType("UpdateReviewInput", {
  fields: (t) => ({
    rating: t.int({ required: false, validate: { min: 1, max: 5 } }),
    comment: t.string({ required: false }),
  }),
});
```

### Step 3: Queries

**File**: `backend/src/graphql/queries/reviewQueries.ts`

```typescript
import { builder } from "../builder";

builder.queryFields((t) => ({
  // Get all reviews for a sample
  sampleReviews: t.prismaField({
    type: ["Review"],
    args: {
      sampleId: t.arg.string({ required: true }),
    },
    resolve: async (query, parent, args, ctx) => {
      return ctx.prisma.review.findMany({
        ...query,
        where: { sampleId: args.sampleId },
        orderBy: { createdAt: "desc" },
      });
    },
  }),

  // Get user's reviews
  myReviews: t.prismaField({
    type: ["Review"],
    resolve: async (query, parent, args, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");

      return ctx.prisma.review.findMany({
        ...query,
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      });
    },
  }),
}));
```

### Step 4: Mutations

**File**: `backend/src/graphql/mutations/reviewMutation.ts`

```typescript
import { builder } from "../builder";
import { CreateReviewInput, UpdateReviewInput } from "../types/Review";

builder.mutationFields((t) => ({
  // Create review
  createReview: t.prismaField({
    type: "Review",
    args: {
      input: t.arg({ type: CreateReviewInput, required: true }),
    },
    resolve: async (query, parent, args, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");

      // Check if user already reviewed this sample
      const existing = await ctx.prisma.review.findUnique({
        where: {
          sampleId_userId: {
            sampleId: args.input.sampleId,
            userId: ctx.userId,
          },
        },
      });

      if (existing) {
        throw new Error("You have already reviewed this sample");
      }

      // Check if user has access to this sample
      const sample = await ctx.prisma.sample.findUnique({
        where: { id: args.input.sampleId },
      });

      if (!sample) throw new Error("Sample not found");

      return ctx.prisma.review.create({
        ...query,
        data: {
          ...args.input,
          userId: ctx.userId,
        },
      });
    },
  }),

  // Update review
  updateReview: t.prismaField({
    type: "Review",
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateReviewInput, required: true }),
    },
    resolve: async (query, parent, args, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");

      // Check ownership
      const review = await ctx.prisma.review.findUnique({
        where: { id: args.id },
      });

      if (!review) throw new Error("Review not found");
      if (review.userId !== ctx.userId) throw new Error("Unauthorized");

      return ctx.prisma.review.update({
        ...query,
        where: { id: args.id },
        data: args.input,
      });
    },
  }),

  // Delete review
  deleteReview: t.field({
    type: "Boolean",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (parent, args, ctx) => {
      if (!ctx.userId) throw new Error("Unauthorized");

      const review = await ctx.prisma.review.findUnique({
        where: { id: args.id },
      });

      if (!review) throw new Error("Review not found");
      if (review.userId !== ctx.userId && ctx.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await ctx.prisma.review.delete({
        where: { id: args.id },
      });

      return true;
    },
  }),
}));
```

### Step 5: Permissions (GraphQL Shield)

**File**: `backend/src/permission/index.ts`

```typescript
// Add to existing rules
const rules = {
  // ... existing rules

  ownsReview: rule()(async (parent, args, ctx, info) => {
    const reviewId = parent?.id || args.id;
    const review = await ctx.prisma.review.findUnique({
      where: { id: reviewId },
    });
    return review?.userId === ctx.userId;
  }),
};

// Add to permissions
export const permissions = shield({
  Query: {
    // ... existing
    sampleReviews: allow, // Public
    myReviews: isAuthenticated,
  },
  Mutation: {
    // ... existing
    createReview: isAuthenticated,
    updateReview: and(isAuthenticated, ownsReview),
    deleteReview: or(ownsReview, isAdmin),
  },
});
```

### Step 6: Test Backend

```bash
# Start backend
cd backend
npm run dev

# Open GraphQL Playground
# http://localhost:4001/graphql

# Test mutation
mutation {
  createReview(input: {
    sampleId: "clxxx..."
    rating: 5
    comment: "Great sample!"
  }) {
    id
    rating
    comment
    user {
      name
    }
  }
}
```

---

## 🎨 Frontend Development

### Step 7: GraphQL Operations

**File**: `frontend/src/graphql/review.graphql`

```graphql
# Queries
query SampleReviews($sampleId: String!) {
  sampleReviews(sampleId: $sampleId) {
    id
    rating
    comment
    user {
      id
      name
    }
    createdAt
  }
}

query MyReviews {
  myReviews {
    id
    rating
    comment
    sample {
      id
      name
    }
    createdAt
  }
}

# Mutations
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    id
    rating
    comment
  }
}

mutation UpdateReview($id: String!, $input: UpdateReviewInput!) {
  updateReview(id: $id, input: $input) {
    id
    rating
    comment
  }
}

mutation DeleteReview($id: String!) {
  deleteReview(id: $id)
}
```

**Generate types**:

```bash
cd frontend
npm run codegen
```

### Step 8: React Components

**File**: `frontend/src/components/reviews/ReviewForm.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "urql";
import { CreateReviewDocument } from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  sampleId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ sampleId, onSuccess }: ReviewFormProps) {
  const [{ fetching }, createReview] = useMutation(CreateReviewDocument);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    const result = await createReview({
      input: {
        sampleId,
        ...data,
      },
    });

    if (result.data) {
      form.reset();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Rating stars */}
      <div>
        <label>Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => form.setValue("rating", star)}
              className={
                star <= form.watch("rating")
                  ? "text-yellow-500"
                  : "text-gray-300"
              }
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <Textarea
        {...form.register("comment")}
        placeholder="Write your review..."
      />

      <Button type="submit" disabled={fetching}>
        {fetching ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
```

**File**: `frontend/src/components/reviews/ReviewList.tsx`

```typescript
"use client";

import { useQuery } from "urql";
import { SampleReviewsDocument } from "@/__generated__/graphql";

interface ReviewListProps {
  sampleId: string;
}

export function ReviewList({ sampleId }: ReviewListProps) {
  const [{ data, fetching }] = useQuery({
    query: SampleReviewsDocument,
    variables: { sampleId },
  });

  if (fetching) return <div>Loading reviews...</div>;

  const reviews = data?.sampleReviews || [];

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-yellow-500">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            <span className="text-sm text-muted-foreground">
              by {review.user.name}
            </span>
          </div>
          {review.comment && <p className="mt-2">{review.comment}</p>}
          <time className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </time>
        </div>
      ))}
    </div>
  );
}
```

### Step 9: Add to Page

**File**: `frontend/src/app/(dashboard)/samples/[id]/page.tsx`

```typescript
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

export default function SampleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      {/* ... existing sample details ... */}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>

        <ReviewForm sampleId={params.id} />

        <div className="mt-8">
          <ReviewList sampleId={params.id} />
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Your Feature

### 1. Manual Testing

```bash
# Start servers
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2

# Test flow:
1. Login as customer
2. Navigate to a sample
3. Submit a review
4. Verify it appears in the list
5. Try editing/deleting your review
6. Login as different user
7. Verify you can't edit other's reviews
```

### 2. Test Different Roles

- **Customer**: Can create, edit own reviews
- **Manufacturer**: Can view reviews
- **Admin**: Can delete any review

### 3. Test Edge Cases

- Try submitting duplicate review (should fail)
- Try rating outside 1-5 range (should fail)
- Try editing someone else's review (should fail)
- Test with no authentication (should fail)

---

## 🎯 Common Patterns

### Pattern 1: Nested Resources

```typescript
// When feature belongs to another resource
Sample → Reviews
Order → ProductionStages
```

### Pattern 2: Many-to-Many Relations

```typescript
// Use junction model
model OrderProduct {
  orderId   String
  productId String
  quantity  Int

  order     Order   @relation(...)
  product   Product @relation(...)

  @@id([orderId, productId])
}
```

### Pattern 3: Soft Delete

```typescript
model Review {
  // Add deleted flag
  deletedAt DateTime?

  @@index([deletedAt])
}

// Filter in queries
where: {
  deletedAt: null
}
```

### Pattern 4: Audit Trail

```typescript
model Review {
  createdBy String
  updatedBy String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 📝 Checklist

Before marking feature as complete:

- [ ] Database schema created and migrated
- [ ] Prisma Client generated
- [ ] GraphQL types defined
- [ ] Queries and mutations implemented
- [ ] Permissions added (GraphQL Shield)
- [ ] Frontend GraphQL operations created
- [ ] Types generated (codegen)
- [ ] React components created
- [ ] Pages updated
- [ ] Tested all user roles
- [ ] Tested edge cases
- [ ] Documentation updated
- [ ] Code reviewed

---

## 🔗 Related Guides

- [Best Practices](./BEST_PRACTICES.md)
- [Testing Guide](./TESTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated**: October 20, 2025

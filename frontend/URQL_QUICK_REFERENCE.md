# 🌐 URQL GraphQL Client - Quick Reference

**Version**: URQL 4.1.0
**Last Updated**: October 2025
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Client Configuration](#client-configuration)
3. [Queries](#queries)
4. [Mutations](#mutations)
5. [Authentication](#authentication)
6. [Best Practices](#best-practices)

---

## ⚙️ Setup

### Installation

Already installed in the project:
```json
{
  "dependencies": {
    "urql": "^4.1.0",
    "graphql": "^16.x"
  }
}
```

### Client Configuration

**File**: `frontend/src/lib/graphql/urqlClient.ts`

```typescript
import { cacheExchange, createClient, fetchExchange, ssrExchange } from "urql";

const isServerSide = typeof window === "undefined";
const ssrCache = ssrExchange({ isClient: !isServerSide });

const client = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
  exchanges: [cacheExchange, ssrCache, fetchExchange],
  fetchOptions: () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    return {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  },
});

export { client, ssrCache };
export default client;
```

---

## 🔍 Queries

### Basic Query

```typescript
"use client";

import { useQuery } from "urql";

const COLLECTIONS_QUERY = `
  query Collections {
    collections {
      id
      name
      description
      season
      year
    }
  }
`;

export default function CollectionsList() {
  const [result] = useQuery({ query: COLLECTIONS_QUERY });

  if (result.fetching) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return (
    <div>
      {result.data?.collections.map((collection: any) => (
        <div key={collection.id}>{collection.name}</div>
      ))}
    </div>
  );
}
```

### Query with Variables

```typescript
const COLLECTION_BY_ID_QUERY = `
  query Collection($id: Int!) {
    collection(id: $id) {
      id
      name
      description
      designs {
        id
        name
        imageUrl
      }
    }
  }
`;

export default function CollectionDetail({ id }: { id: number }) {
  const [result] = useQuery({
    query: COLLECTION_BY_ID_QUERY,
    variables: { id },
  });

  // ... handle result
}
```

### Conditional Query (Pause)

```typescript
const [result] = useQuery({
  query: COLLECTIONS_QUERY,
  pause: !isAuthenticated, // Don't run if not authenticated
});
```

### Re-fetching

```typescript
const [result, reexecuteQuery] = useQuery({ query: COLLECTIONS_QUERY });

const handleRefresh = () => {
  reexecuteQuery({ requestPolicy: "network-only" });
};
```

---

## ✏️ Mutations

### Basic Mutation

```typescript
"use client";

import { useMutation } from "urql";

const CREATE_COLLECTION_MUTATION = `
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
      description
    }
  }
`;

export default function CreateCollectionForm() {
  const [result, executeMutation] = useMutation(CREATE_COLLECTION_MUTATION);

  const handleSubmit = async (data: any) => {
    const result = await executeMutation({ input: data });

    if (result.error) {
      console.error("Error:", result.error);
    } else {
      console.log("Success:", result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={result.fetching}>
        {result.fetching ? "Creating..." : "Create Collection"}
      </button>
    </form>
  );
}
```

### Mutation with File Upload

```typescript
const UPLOAD_IMAGE_MUTATION = `
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
      filename
    }
  }
`;

const handleFileUpload = async (file: File) => {
  const result = await executeMutation({ file });
  return result.data?.uploadImage.url;
};
```

---

## 🔐 Authentication

### Automatic Token Injection (Client-Side)

The URQL client automatically adds the Bearer token to all requests:

```typescript
// urqlClient.ts
fetchOptions: () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
}
```

### Server-Side Authentication

For server components, use `getAuthHeader()` from DAL:

```typescript
import { getAuthHeader } from "@/lib/dal";

export default async function ServerComponent() {
  const authHeader = await getAuthHeader();

  const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: authHeader,
    },
    body: JSON.stringify({
      query: `query Me { me { id name role } }`,
    }),
  });

  const data = await response.json();
  return <div>{data.data.me.name}</div>;
}
```

---

## ✅ Best Practices

### 1. Use Type-Safe Queries

Generate types with GraphQL Code Generator:

```bash
npm run codegen
```

Then import types:

```typescript
import { CollectionsQuery, CollectionsDocument } from "@/__generated__/graphql";

const [result] = useQuery<CollectionsQuery>({
  query: CollectionsDocument,
});
```

### 2. Handle Errors Gracefully

```typescript
const [result] = useQuery({ query: QUERY });

if (result.error) {
  // Check for specific error codes
  if (result.error.graphQLErrors[0]?.extensions?.code === "UNAUTHENTICATED") {
    redirect("/auth/login");
  }

  return <ErrorComponent message={result.error.message} />;
}
```

### 3. Use Request Policies

```typescript
// Default (cache-first)
const [result] = useQuery({ query: QUERY });

// Always fetch from network
const [result] = useQuery({
  query: QUERY,
  requestPolicy: "network-only",
});

// Cache only (no network)
const [result] = useQuery({
  query: QUERY,
  requestPolicy: "cache-only",
});

// Cache and network (background refresh)
const [result] = useQuery({
  query: QUERY,
  requestPolicy: "cache-and-network",
});
```

### 4. Optimize with Fragments

```typescript
const COLLECTION_FRAGMENT = `
  fragment CollectionFields on Collection {
    id
    name
    description
    season
    year
  }
`;

const COLLECTIONS_QUERY = `
  ${COLLECTION_FRAGMENT}
  query Collections {
    collections {
      ...CollectionFields
    }
  }
`;
```

### 5. Batch Queries

```typescript
const [collectionsResult] = useQuery({ query: COLLECTIONS_QUERY });
const [samplesResult] = useQuery({ query: SAMPLES_QUERY });

// URQL automatically batches these into one request
```

### 6. Cancel Requests on Unmount

URQL automatically cancels requests when components unmount. No action needed!

### 7. Use Suspense (Optional)

```typescript
import { Suspense } from "react";

const [result] = useQuery({
  query: QUERY,
  suspense: true,
});

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <YourComponent />
</Suspense>
```

---

## 🔗 Integration with NextAuth

### Client Component

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "urql";

export default function ProtectedComponent() {
  const { data: session, status } = useSession();

  const [result] = useQuery({
    query: QUERY,
    pause: status !== "authenticated", // Wait for auth
  });

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") redirect("/auth/login");

  // ... render with result
}
```

### Server Component

```typescript
import { verifySession, getAuthHeader } from "@/lib/dal";

export default async function ServerComponent() {
  const session = await verifySession();
  const authHeader = await getAuthHeader();

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      authorization: authHeader,
    },
    body: JSON.stringify({ query: "..." }),
  });

  // ... process response
}
```

---

## 📚 Common Queries

### Get Current User

```typescript
const ME_QUERY = `
  query Me {
    me {
      id
      email
      name
      role
      companyId
    }
  }
`;
```

### Get Collections

```typescript
const COLLECTIONS_QUERY = `
  query Collections($skip: Int, $take: Int) {
    collections(skip: $skip, take: $take) {
      id
      name
      description
      season
      year
      designCount
      createdAt
    }
  }
`;
```

### Get Samples

```typescript
const SAMPLES_QUERY = `
  query Samples($status: String) {
    samples(status: $status) {
      id
      name
      sampleNumber
      status
      customer {
        id
        name
      }
    }
  }
`;
```

---

## 🔧 Troubleshooting

### Issue: "Network error"

**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# Check backend is running
curl http://localhost:4001/graphql

# Check .env.local
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4001/graphql
```

### Issue: "Unauthorized" errors

**Cause**: Token not being sent

**Solution**:
```typescript
// Check token in localStorage
console.log(localStorage.getItem("token"));

// Verify fetchOptions in urqlClient.ts
fetchOptions: () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
```

### Issue: Stale data

**Cause**: Cache not updating

**Solution**:
```typescript
// Force refetch
reexecuteQuery({ requestPolicy: "network-only" });

// Or disable cache for specific query
const [result] = useQuery({
  query: QUERY,
  requestPolicy: "network-only",
});
```

---

## 📖 Resources

- **URQL Docs**: https://formidable.com/open-source/urql/docs/
- **GraphQL Backend**: `http://localhost:4001/graphql`
- **Authentication Guide**: `frontend/AUTHENTICATION_GUIDE.md`
- **DAL Reference**: `client/DAL_USAGE_GUIDE.md`

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready

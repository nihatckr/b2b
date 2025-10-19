# 🎨 Frontend - Next.js Application

> ProtexFlow Next.js 15 app with React 19, TypeScript, and URQL

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate GraphQL types
npm run codegen

# Start development server
npm run dev
# → http://localhost:3000
```

---

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run codegen      # Generate GraphQL types
npm run type-check   # TypeScript check
```

---

## 🗂️ Project Structure

```
src/
├── app/              # Next.js 15 App Router
│   ├── (auth)/      # Auth pages (login, signup)
│   ├── (dashboard)/ # Protected pages
│   └── layout.tsx
├── components/       # React components
│   ├── ui/          # shadcn/ui base components
│   ├── providers/   # Context providers
│   └── ...
├── lib/             # Core utilities
│   ├── auth.ts      # NextAuth config
│   ├── urql-client.ts # GraphQL client
│   └── dal.ts       # Data Access Layer
├── hooks/           # Custom React hooks
├── graphql/         # GraphQL operations (.graphql)
└── middleware.ts    # Route protection
```

---

## 🔐 Authentication

**Provider**: NextAuth.js v4

**Strategy**: JWT tokens

**Protected Routes**: Handled by `middleware.ts`

**Session**: Available via `useSession()` hook

---

## 🔄 GraphQL Client

**Client**: URQL

**Features**:

- Normalized cache
- WebSocket subscriptions
- Auto token refresh
- Error handling

**Usage**:

```typescript
import { useQuery } from "urql";
import { MeDocument } from "@/__generated__/graphql";

const [{ data, fetching, error }] = useQuery({ query: MeDocument });
```

---

## 🎨 UI Components

**Library**: shadcn/ui + TailwindCSS

**Adding Components**:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

---

## 📚 Documentation

- **[Main Docs](../docs/README.md)** - Complete documentation
- **[Architecture](../docs/ARCHITECTURE.md)** - System design
- **[URQL Usage Guide](./URQL_USAGE_GUIDE.md)** - GraphQL client
- **[Authentication Guide](./AUTHENTICATION_GUIDE.md)** - Auth flow
- **[WebSocket Guide](./WEBSOCKET_SUBSCRIPTIONS_GUIDE.md)** - Real-time

---

## 🔧 Development

### After Backend Schema Changes

```bash
# 1. Backend generates new schema
cd backend
npx prisma generate

# 2. Generate frontend types
cd frontend
npm run codegen
```

### Adding GraphQL Operations

1. Create `.graphql` file in `src/graphql/`
2. Run `npm run codegen`
3. Use generated hooks in components

---

**Version**: 2.0.0 | **Status**: Production Ready

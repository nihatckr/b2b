# Frontend - Next.js 15 + URQL GraphQL Client

Modern fullstack textile ERP frontend built with Next.js 15, React 19, and URQL v5.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# GraphQL codegen (after backend is running)
npm run codegen
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📚 Documentation

- **[URQL Usage Guide](./URQL_USAGE_GUIDE.md)** - GraphQL queries & mutations
- **[URQL Modernization Summary](./URQL_MODERNIZATION_SUMMARY.md)** - Latest updates
- **[Backend Integration](../server/HOW_TO_ADD_NEW_FEATURES.md)** - API reference

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.6 (App Router)
- **React:** 19.1.0
- **GraphQL Client:** URQL v5.0.1 (SSR + Cache-first)
- **Authentication:** NextAuth v4.24.11
- **Styling:** TailwindCSS + shadcn/ui
- **TypeScript:** Type-safe GraphQL with Codegen

## 🔥 Key Features

✅ **Modern URQL Setup:**
- SSR exchange for Next.js hydration
- Cache-first strategy for performance
- NextAuth integration (JWT tokens)
- Optimistic updates ready

✅ **Backend Integration:**
- Relay Nodes (Global ID support)
- Relay Connections (Pagination)
- DataLoader batching (~87% faster)

✅ **Developer Experience:**
- GraphQL Codegen (type-safe queries)
- Comprehensive documentation
- Test components included

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * GraphQL Codegen Configuration
 *
 * Modüler klasör yapısı:
 * - auth/       : Authentication & Authorization
 * - admin/      : Admin operations (user, company, category management)
 * - company/    : Company operations
 * - sample/     : Sample operations
 * - order/      : Order operations (production, payment, review)
 * - collection/ : Collection & RFQ operations
 * - library/    : Library item operations
 * - notification/ : Notification operations & subscriptions
 * - message/    : Messaging operations & subscriptions
 * - subscription/ : Subscription plan operations
 *
 * Output: src/__generated__/graphql.tsx
 * - TypeScript types
 * - Document exports (LoginDocument, MeDocument, etc.)
 * - URQL hooks (useLoginMutation, useMeQuery, etc.)
 *
 * Best Practices:
 * 1. Operation isimleri unique olmalı (AdminUsers, UserProfileData)
 * 2. Backend input types kullanılmalı (input: { email, password })
 * 3. Sadece gerekli alanlar sorgulanmalı (performans için)
 * 4. Her modül kendi klasöründe organize edilmeli
 *
 * @see src/graphql/README.md - Detaylı dokümantasyon
 */
const config: CodegenConfig = {
  schema: "http://localhost:4001/graphql",
  documents: [
    "src/graphql/**/*.graphql", // Tüm modüler operations
    // Exclude patterns
    "!src/graphql/**/*.broken",
    "!src/graphql/**/*.backup",
    "!src/graphql/**/*.old",
  ],
  generates: {
    "./src/__generated__/graphql.tsx": {
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
      config: {
        // URQL hooks oluştur (useLoginMutation, useMeQuery)
        withHooks: true,
        urqlImportFrom: "urql",

        // Type safety
        skipTypename: false,

        // Scalars
        scalars: {
          DateTime: "string",
          JSON: "any",
        },

        // Naming conventions
        namingConvention: {
          typeNames: "pascal-case#pascalCase",
          enumValues: "upper-case#upperCase",
        },
      },
    },
  },

  // Error handling
  ignoreNoDocuments: false, // Fail if no GraphQL files found

  // Performance
  errorsOnly: false,
};

export default config;

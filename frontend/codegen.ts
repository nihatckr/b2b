// @ts-check
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4001/graphql",
  documents: [
    "src/**/*.{ts,tsx,graphql}",
    "!src/**/*.d.ts",
    // Exclude test components and legacy files
    "!src/components/test/URQLTestComponent.tsx",
    "!src/lib/graphql/graphql-queries.ts",
  ],
  ignoreNoDocuments: true,
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;

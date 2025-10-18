// @ts-check
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4001/graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;

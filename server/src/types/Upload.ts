import { scalarType } from "nexus";

export const Upload = scalarType({
  name: "Upload",
  asNexusMethod: "upload",
  description: "The `Upload` scalar type represents a file upload.",
  serialize: () => {
    throw new Error("Upload serialization unsupported.");
  },
  parseValue: (value: any) => value,
  parseLiteral: () => {
    throw new Error("Upload literal unsupported.");
  },
});

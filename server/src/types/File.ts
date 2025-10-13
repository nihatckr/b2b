import { objectType } from "nexus";

export const File = objectType({
  name: "File",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("filename");
    t.nonNull.string("path");
    t.nonNull.int("size");
    t.nonNull.string("mimetype");
    t.string("encoding");
    t.string("description");
    t.nonNull.field("createdAt", { type: "DateTime" });
    t.nonNull.field("updatedAt", { type: "DateTime" });
  },
});

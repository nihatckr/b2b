import { objectType } from "nexus";

export const UserStats = objectType({
  name: "UserStats",
  definition(t) {
    t.nonNull.int("totalUsers");
    t.nonNull.int("adminCount");
    t.nonNull.int("manufactureCount");
    t.nonNull.int("customerCount");
  },
});

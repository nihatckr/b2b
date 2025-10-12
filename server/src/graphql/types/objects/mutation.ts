import { objectType } from "nexus";

export const Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.string("hello", {
      resolve: () => "Hello Mutation!",
    });
  },
});

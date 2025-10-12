import { mutationType } from "nexus";
import { userMutations } from "./userResolver";

export const Mutation = mutationType({
  definition(t) {
    // Add user mutations
    userMutations(t);
  },
});

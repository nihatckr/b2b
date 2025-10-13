import { mutationType } from "nexus";
import { categoryMutations } from "./categoryResolver";
import { collectionMutations } from "./collectionResolver";
import { companyMutations } from "./companyResolver";
import { libraryMutations } from "./libraryResolver";
import { likeMutations } from "./likeResolver";
import { messageMutations } from "./messageResolver";
import { orderMutations } from "./orderResolver";
import { productionMutations } from "./productionResolver";
import { questionMutations } from "./questionResolver";
import { reviewMutations } from "./reviewResolver";
import { sampleMutations } from "./sampleResolver";
import { userMutations } from "./userResolver";

export const Mutation = mutationType({
  definition(t) {
    // Add user mutations
    userMutations(t);

    // Add company mutations
    companyMutations(t);

    // Add category mutations
    categoryMutations(t);

    // Add collection mutations
    collectionMutations(t);

    // Add sample mutations
    sampleMutations(t);

    // Add order mutations
    orderMutations(t);

    // Add message mutations
    messageMutations(t);

    // Add question mutations
    questionMutations(t);

    // Add review mutations
    reviewMutations(t);

    // Add production mutations
    productionMutations(t);

    // Add library mutations
    libraryMutations(t);

    // Add like mutations
    likeMutations(t);
  },
});

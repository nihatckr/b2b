import { mutationType } from "nexus";
import { aiSampleMutations } from "./aiSampleResolver";
import { categoryMutations } from "./categoryResolver";
import { collectionMutations } from "./collectionResolver";
import { companyMutations } from "./companyResolver";
import { libraryMutations } from "./libraryResolver";
import { likeMutations } from "./likeResolver";
import { messageMutations } from "./messageResolver";
import { notificationMutations } from "./notificationResolver";
import { orderMutations } from "./orderResolver";
import { productAnalysisMutations } from "./productAnalysisResolver";
import { productionMutations } from "./productionResolver";
import { questionMutations } from "./questionResolver";
import { reviewMutations } from "./reviewResolver";
import { sampleMutations } from "./sampleResolver";
import { userMutations } from "./userResolver";
export { WorkshopMutation } from "./workshopResolver";

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

    // Add notification mutations
    notificationMutations(t);

    // Add AI sample mutations
    aiSampleMutations(t);

    // Add product analysis mutations (Ollama)
    productAnalysisMutations(t);
  },
});

import { queryType } from "nexus";
import { categoryQueries } from "./categoryQuery";
import { collectionQueries } from "./collectionQuery";
import { companyQueries } from "./companyQuery";
import { libraryQueries } from "./libraryQuery";
import { messageQueries } from "./messageQuery";
import { orderQueries } from "./orderQuery";
import { productionQueries } from "./productionQuery";
import { questionQueries } from "./questionQuery";
import { reviewQueries } from "./reviewQuery";
import { sampleQueries } from "./sampleQuery";
import { userQueries } from "./userQuery";

export const Query = queryType({
  definition(t) {
    // Add user queries
    userQueries(t);

    // Add company queries
    companyQueries(t);

    // Add category queries
    categoryQueries(t);

    // Add collection queries
    collectionQueries(t);

    // Add sample queries
    sampleQueries(t);

    // Add order queries
    orderQueries(t);

    // Add message queries
    messageQueries(t);

    // Add question queries
    questionQueries(t);

    // Add review queries
    reviewQueries(t);

    // Add production queries
    productionQueries(t);

    // Add library queries
    libraryQueries(t);
  },
});

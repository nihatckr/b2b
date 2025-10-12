import { queryType } from "nexus";
import { userQueries } from "./userQuery";

export const Query = queryType({
  definition(t) {


    // Add user queries
    userQueries(t);
  },
});

import { objectType } from "nexus";

export const Query = objectType({
  name: "Query",
  definition(t) {
    t.string("hello", {
      resolve: () => "Hello World!",
    });

    // t.list.field("users", {
    //   type: "User",
    //   resolve: (_parent, _args, context) => {
    //     return context.prisma.user.findMany({
    //       take: 10,
    //       orderBy: { createdAt: "desc" },
    //     });
    //   },
    // });
  },
});

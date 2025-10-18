ctoring@1.0.0 dev

> tsx src/server.ts

/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/core/src/errors.ts:5
super(message, options);
^

PothosSchemaError [GraphQLError]: Field 'image' not found in model 'User'
at new PothosError (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/core/src/errors.ts:5:5)
at new PothosSchemaError (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/core/src/errors.ts:12:5)
at getFieldData (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/plugin-prisma/src/util/datamodel.ts:64:11)
at getFieldDescription (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/plugin-prisma/src/util/description.ts:17:25)
at options (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/plugin-prisma/src/prisma-field-builder.ts:601:19)
at PrismaObjectFieldBuilder.exposeString (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/plugin-prisma/src/prisma-field-builder.ts:647:14)
at fields (/Users/nihatcakir/Desktop/websites/fullstack/backend/src/graphql/types/index.ts:12:14)
at Object.objectType.fields (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/plugin-prisma/src/schema-builder.ts:51:11)
at <anonymous> (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/core/src/builder.ts:197:7)
at cb (/Users/nihatcakir/Desktop/websites/fullstack/backend/node_modules/@pothos/core/src/refs/base-with-fields.ts:65:20) {
path: undefined,
locations: undefined,
extensions: [Object: null prototype] {}
}

Node.js v20.18.1
nihatcakir@Nihat-MacBook-Pro backend %

/schema.ts

Error: Cannot find module './pagination'
Require stack:

- /Users/nihatcakir/Desktop/websites/fullstack/server/src/graphql/types/index.ts
- /Users/nihatcakir/Desktop/websites/fullstack/server/src/schema.ts
  at Function.Module.\_resolveFilename (node:internal/modules/cjs/loader:1225:15)
  at Function.Module.\_resolveFilename.sharedData.moduleResolveFilenameHook.installedValue [as _resolveFilename] (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/@cspotcode/source-map-support/source-map-support.js:811:30)
  at Function.Module.\_load (node:internal/modules/cjs/loader:1051:27)
  at Module.require (node:internal/modules/cjs/loader:1311:19)
  at require (node:internal/modules/helpers:179:18)
  at Object.<anonymous> (/Users/nihatcakir/Desktop/websites/fullstack/server/src/graphql/types/index.ts:4:1)
  at Module.\_compile (node:internal/modules/cjs/loader:1469:14)
  at Module.m.\_compile (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/ts-node/src/index.ts:1618:23)
  at Module.\_extensions..js (node:internal/modules/cjs/loader:1548:10)
  at Object.require.extensions.<computed> [as .ts] (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/ts-node/src/index.ts:1621:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
  '/Users/nihatcakir/Desktop/websites/fullstack/server/src/graphql/types/index.ts',
  '/Users/nihatcakir/Desktop/websites/fullstack/server/src/schema.ts'
  ]
  }
  nihatcakir@Nihat-MacBook-Pro server % npm run generat
  e:nexus

> @fullstack/server@1.0.0 generate:nexus
> ts-node --transpile-only src/schema.ts

Error: Cannot find module './workflow'
Require stack:

- /Users/nihatcakir/Desktop/websites/fullstack/server/src/graphql/types/index.ts
- /Users/nihatcakir/Desktop/websites/fullstack/server/src/schema.ts
  at Function.Module.\_resolveFilename (node:internal/modules/cjs/loader:1225:15)
  at Function.Module.\_resolveFilename.sharedData.moduleResolveFilenameHook.installedValue [as _resolveFilename] (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/@cspotcode/source-map-support/source-map-support.js:811:30)
  at Function.Module.\_load (node:internal/modules/cjs/loader:1051:27)
  at Module.require (node:internal/modules/cjs/loader:1311:19)
  at require (node:internal/modules/helpers:179:18)
  at Object.<anonymous> (/Users/nihatcakir/Desktop/websites/fullstack/server/src/graphql/types/index.ts:5:1)
  at Module.\_compile (node:internal/modules/cjs/loader:1469:14)
  at Module.m.\_compile (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/ts-node/src/index.ts:1618:23)
  at Module.\_extensions..js (node:internal/modules/cjs/loader:1548:10)
  at Object.require.extensions.<computed> [as .ts] (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/ts-node/src/index.ts:1621:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
  '/Users/nihatcakir/Desktop/websites/fullstack/server/src/graphql/types/index.ts',
  '/Users/nihatcakir/Desktop/websites/fullstack/server/src/schema.ts'
  ]
  }
  nihatcakir@Nihat-MacBook-Pro server % npm run generat
  e:nexus

> @fullstack/server@1.0.0 generate:nexus
> ts-node --transpile-only src/schema.ts

/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-shield/cjs/generator.js:104
throw new validation_js_1.ValidationError(`It seems like you have applied rules to ${fieldErrors} fields but Shield cannot find them in your schema.`);
^
ValidationError: It seems like you have applied rules to SampleProduction.updatedAt fields but Shield cannot find them in your schema.
at applyRuleToType (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-shield/cjs/generator.js:104:19)
at /Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-shield/cjs/generator.js:184:33
at Array.reduce (<anonymous>)
at generateMiddlewareFromSchemaAndRuleTree (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-shield/cjs/generator.js:179:14)
at MiddlewareGenerator.generator (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-shield/cjs/generator.js:203:24)
at MiddlewareGenerator.generate (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-middleware/dist/generator.js:10:17)
at /Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-middleware/dist/middleware.js:28:25
at Array.map (<anonymous>)
at applyMiddlewareWithOptions (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-middleware/dist/middleware.js:26:45)
at applyMiddleware (/Users/nihatcakir/Desktop/websites/fullstack/server/node_modules/graphql-middleware/dist/middleware.js:55:10)
nihatcakir@Nihat-MacBook-Pro server % npm run generat
e:nexus

> @fullstack/server@1.0.0 generate:nexus
> ts-node --transpile-only src/schema.ts

nihatcakir@Nihat-MacBook-Pro server %

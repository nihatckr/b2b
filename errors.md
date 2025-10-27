nihat@CAKIR MINGW64 ~/Desktop/Web/b2b (main)
$ cd backend && npm run dev

> @fullstack/backend@1.0.0 dev
> cross-env NODE_ENV=development tsx src/server.ts

node:internal/modules/cjs/loader:1401
const err = new Error(message);
^

Error: Cannot find module './OrderChangeLog'
Require stack:

- C:\Users\nihat\Desktop\Web\b2b\backend\src\graphql\types\index.ts
- C:\Users\nihat\Desktop\Web\b2b\backend\src\graphql\schema.ts
- C:\Users\nihat\Desktop\Web\b2b\backend\src\server.ts
  at node:internal/modules/cjs/loader:1401:15
  at nextResolveSimple (C:\Users\nihat\Desktop\Web\b2b\backend\node*modules\tsx\dist\register-D46fvsV*.cjs:4:1004)
  at C:\Users\nihat\Desktop\Web\b2b\backend\node*modules\tsx\dist\register-D46fvsV*.cjs:3:2630
  at C:\Users\nihat\Desktop\Web\b2b\backend\node*modules\tsx\dist\register-D46fvsV*.cjs:3:1542
  at resolveTsPaths (C:\Users\nihat\Desktop\Web\b2b\backend\node*modules\tsx\dist\register-D46fvsV*.cjs:4:760)
  at C:\Users\nihat\Desktop\Web\b2b\backend\node*modules\tsx\dist\register-D46fvsV*.cjs:4:1102
  at m.\_resolveFilename (file:///C:/Users/nihat/Desktop/Web/b2b/backend/node_modules/tsx/dist/register-B7jrtLTO.mjs:1:789)
  at defaultResolveImpl (node:internal/modules/cjs/loader:1057:19)
  at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1062:22)
  at Function.\_load (node:internal/modules/cjs/loader:1211:37) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
  'C:\\Users\\nihat\\Desktop\\Web\\b2b\\backend\\src\\graphql\\types\\index.ts',
  'C:\\Users\\nihat\\Desktop\\Web\\b2b\\backend\\src\\graphql\\schema.ts',
  'C:\\Users\\nihat\\Desktop\\Web\\b2b\\backend\\src\\server.ts'
  ]
  }

Node.js v22.16.0

nihat@CAKIR MINGW64 ~/Desktop/Web/b2b/backend (main)
$

..

🔔 [2025-10-17T13:50:26.851Z] Running production deadline checks...
Starting server in development mode on port 4000
Error: listen EADDRINUSE: address already in use :::4000
at Server.setupListenHandle [as _listen2] (node:net:1908:16)
at listenInCluster (node:net:1965:12)
at Server.listen (node:net:2067:7)
at /Users/nihatcakir/Desktop/websites/fullstack/server/src/server.ts:228:16
at new Promise (<anonymous>)
at startServer (/Users/nihatcakir/Desktop/websites/fullstack/server/src/server.ts:227:9)
at processTicksAndRejections (node:internal/process/task_queues:95:5)
[ERROR] 16:50:27 Error: listen EADDRINUSE: address already in use :::4000
SIGTERM received, stopping production scheduler...
🛑 Production deadline scheduler stopped
SIGTERM received, stopping production scheduler...
🔔 Found 1 production deadlines approaching...
❌ Error checking production deadlines: PrismaClientUnknownRequestError:
Invalid `prisma.user.findMany()` invocation in
/Users/nihatcakir/Desktop/websites/fullstack/server/src/utils/notificationHelper.ts:108:50

105 // Get company members if there's a company
106 let companyMemberIds: number[] = [];
107 if (production.companyId) {
→ 108 const companyMembers = await prisma.user.findMany(
Response from the Engine was empty
at ei.handleRequestError (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:124:7458)
at ei.handleAndLogRequestError (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:124:6593)
at ei.request (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:124:6300)
at a (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:133:9551)
at checkProductionDeadlines (/Users/nihatcakir/Desktop/websites/fullstack/server/src/utils/notificationHelper.ts:108:32)
at ProductionScheduler.runChecks (/Users/nihatcakir/Desktop/websites/fullstack/server/src/utils/productionScheduler.ts:66:29) {
clientVersion: '6.17.1'
}
✅ Checked 0 upcoming deadlines
❌ Error checking overdue production: PrismaClientUnknownRequestError:
Invalid `prisma.productionTracking.findMany()` invocation in
/Users/nihatcakir/Desktop/websites/fullstack/server/src/utils/notificationHelper.ts:183:64

180
181 try {
182 // Find all production trackings that are overdue
→ 183 const overdueProductions = await prisma.productionTracking.findMany(
Engine is not yet connected.
Backtrace [{ fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "_napi_register_module_v1" }, { fn: "__pthread_cond_wait" }]
at ei.handleRequestError (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:124:7458)
at ei.handleAndLogRequestError (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:124:6593)
at ei.request (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:124:6300)
at a (/Users/nihatcakir/Desktop/websites/fullstack/server/src/generated/prisma/runtime/library.js:133:9551)
at checkOverdueProduction (/Users/nihatcakir/Desktop/websites/fullstack/server/src/utils/notificationHelper.ts:183:32)
at ProductionScheduler.runChecks (/Users/nihatcakir/Desktop/websites/fullstack/server/src/utils/productionScheduler.ts:70:28) {
clientVersion: '6.17.1'
}
✅ Checked 0 overdue productions
✅ Production deadline checks completed

turn off tips and other hints? https://pris.ly/tip-4-nohints

> @fullstack/backend-refactoring@1.0.0 prisma:seed
> tsx prisma/seed.ts

🌱 Starting complete seed with all user roles...

👤 Creating Admin User...
❌ Seed failed: PrismaClientKnownRequestError:
Invalid `prisma.user.upsert()` invocation in
/Users/nihatcakir/Desktop/websites/fullstack/backend/prisma/seed.ts:23:35

20 console.log("\n👤 Creating Admin User...");
21
22 const adminPassword = await bcrypt.hash("Admin123!", 10);
→ 23 const admin = await prisma.user.upsert(
The table `users` does not exist in the current database.
at ei.handleRequestError (/Users/nihatcakir/Desktop/websites/fullstack/backend/lib/generated/runtime/library.js:124:7268)
at ei.handleAndLogRequestError (/Users/nihatcakir/Desktop/websites/fullstack/backend/lib/generated/runtime/library.js:124:6593)
at ei.request (/Users/nihatcakir/Desktop/websites/fullstack/backend/lib/generated/runtime/library.js:124:6300)
at async a (/Users/nihatcakir/Desktop/websites/fullstack/backend/lib/generated/runtime/library.js:133:9551)
at async main (/Users/nihatcakir/Desktop/websites/fullstack/backend/prisma/seed.ts:23:17) {
code: 'P2021',
meta: { modelName: 'User', table: 'users' },
clientVersion: '6.17.1'
}
nihatcakir@Nihat-MacBook-Pro backend %

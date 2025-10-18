integration to .\lib\pothos-prisma-types.ts in 208ms


nihat@CAKIR MINGW64 ~/Desktop/Web/fullstack/backend (main)
$ cd c:/Users/nihat/Desktop/Web/fullstack/backend && npx tsx prisma/seed.ts
🌱 Starting seed with updated schema...
📦 Creating companies...
✅ Companies created!
👥 Creating users...
❌ Error during seed: PrismaClientKnownRequestError:
Invalid `prisma.user.upsert()` invocation in
C:\Users\nihat\Desktop\Web\fullstack\backend\prisma\seed.ts:178:35

  175
  176 const password = await bcrypt.hash('password123', 10)
  177
→ 178 const admin = await prisma.user.upsert(
The provided value for the column is too long for the column's type. Column: avatar
    at ei.handleRequestError (C:\Users\nihat\Desktop\Web\fullstack\backend\lib\generated\runtime\library.js:124:7268)
    at ei.handleAndLogRequestError (C:\Users\nihat\Desktop\Web\fullstack\backend\lib\generated\runtime\library.js:124:6593)
    at ei.request (C:\Users\nihat\Desktop\Web\fullstack\backend\lib\generated\runtime\library.js:124:6300)
    at async a (C:\Users\nihat\Desktop\Web\fullstack\backend\lib\generated\runtime\library.js:133:9551)
    at async main (C:\Users\nihat\Desktop\Web\fullstack\backend\prisma\seed.ts:178:17) {
  code: 'P2000',
  meta: { modelName: 'User', column_name: 'avatar' },
  clientVersion: '6.17.1'
}

nihat@CAKIR MINGW64 ~/Desktop/Web/fullstack/backend (main)
$

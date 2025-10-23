import prisma from "./lib/prisma.js";

async function checkTimes() {
  console.log("🕐 Checking database timestamps...");
  console.log(
    "Current local time:",
    new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
  );
  console.log("Current UTC time:", new Date().toISOString());

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      timezone: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("\n📊 Database records:");
  users.forEach((user) => {
    console.log(`${user.email}:`);
    console.log(`  - DB createdAt (UTC): ${user.createdAt.toISOString()}`);
    console.log(
      `  - DB createdAt (TR): ${user.createdAt.toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
      })}`
    );
    console.log(`  - User timezone: ${user.timezone}`);
    console.log("---");
  });

  await prisma.$disconnect();
}

checkTimes().catch(console.error);

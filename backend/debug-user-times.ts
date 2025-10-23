import prisma from "./lib/prisma.js";

async function debugUserTimes() {
  console.log("🕐 Backend current time debug:");
  console.log("Server time (UTC):", new Date().toISOString());
  console.log(
    "Server time (TR):",
    new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
  );

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  console.log("\n📊 User timestamps from database:");
  users.forEach((user) => {
    const now = new Date();
    const created = new Date(user.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    console.log(`\n${user.email}:`);
    console.log(`  - DB UTC: ${created.toISOString()}`);
    console.log(
      `  - DB TR: ${created.toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
      })}`
    );
    console.log(`  - Now UTC: ${now.toISOString()}`);
    console.log(
      `  - Now TR: ${now.toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
      })}`
    );
    console.log(`  - Diff: ${diffMinutes} minutes (${diffHours} hours)`);
    console.log(
      `  - Raw timestamps: created=${created.getTime()}, now=${now.getTime()}`
    );
  });

  await prisma.$disconnect();
}

debugUserTimes().catch(console.error);

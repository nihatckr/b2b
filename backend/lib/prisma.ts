import { PrismaClient } from "./generated";

const prismaClientSingleton = () => {
  try {
    return new PrismaClient();
  } catch (error: any) {
    // Handle Prisma Client instantiation errors
    if (error.message?.includes("DATABASE_URL")) {
      console.error("\n❌ ========================================");
      console.error("❌ PRISMA ERROR: DATABASE_URL not configured");
      console.error("❌ ========================================\n");
      console.error("❌ Error:", error.message);
      console.error("\n📋 Setup Instructions:");
      console.error("   1. Copy .env.example to .env:");
      console.error("      cp .env.example .env\n");
      console.error("   2. Configure DATABASE_URL in .env file");
      console.error(
        "      Example: mysql://user:password@localhost:3306/database_name\n"
      );
      console.error("   3. Run Prisma migrations:");
      console.error("      npm run prisma:migrate\n");
      console.error("   4. Restart the server\n");
      console.error("❌ ========================================\n");
      process.exit(1);
    }
    throw error;
  }
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

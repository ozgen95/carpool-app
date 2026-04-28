import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (process.env.ACCELERATE_URL) {
    return new PrismaClient({
      accelerateUrl: process.env.ACCELERATE_URL,
    });
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set when ACCELERATE_URL is not provided.",
    );
  }

  const adapter = new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  );

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

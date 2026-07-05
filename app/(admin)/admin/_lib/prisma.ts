import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  adminPrisma?: PrismaClient;
  adminPool?: pg.Pool;
};

const pool =
  globalForPrisma.adminPool ??
  new pg.Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

export const prisma =
  globalForPrisma.adminPrisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.adminPool = pool;
  globalForPrisma.adminPrisma = prisma;
}

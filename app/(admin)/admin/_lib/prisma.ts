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
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 10_000,
    max: 1,
  });

export const prisma =
  globalForPrisma.adminPrisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

globalForPrisma.adminPool = pool;
globalForPrisma.adminPrisma = prisma;
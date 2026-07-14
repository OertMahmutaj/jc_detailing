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

    // Allow dashboard queries to run concurrently.
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),

    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

export const prisma =
  globalForPrisma.adminPrisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

globalForPrisma.adminPool = pool;
globalForPrisma.adminPrisma = prisma;
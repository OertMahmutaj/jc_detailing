// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Set up the native pg client pool with your connection string
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

// 2. Instantiate the Prisma 7 client passing the driver adapter
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean up existing data to prevent duplicates if run multiple times
  await prisma.addOn.deleteMany({});
  await prisma.vehicleCategory.deleteMany({});
  await prisma.service.deleteMany({});

  // 2. Seed Vehicle Categories (Surcharges based on car size)
  console.log("🚗 Seeding vehicle categories...");
  const categories = await Promise.all([
    prisma.vehicleCategory.create({
      data: { name: "Kleinwagen / Limo", priceModifier: 0.0 },
    }),
    prisma.vehicleCategory.create({
      data: { name: "Kombi / SUV", priceModifier: 20.0 },
    }),
    prisma.vehicleCategory.create({
      data: { name: "Grossraum / Van", priceModifier: 50.0 },
    }),
  ]);

  // 3. Seed Services / Main Packages
  console.log("🧽 Seeding services...");
  await Promise.all([
    prisma.service.create({
      data: {
        name: "Komplett Innenreinigung",
        basePrice: 209.0,
        durationMinutes: 180, // 3 hours
      },
    }),
    prisma.service.create({
      data: {
        name: "Komplett Aussenreinigung",
        basePrice: 149.0,
        durationMinutes: 120, // 2 hours
      },
    }),
    prisma.service.create({
      data: {
        name: "Komplett Aufbereitung",
        basePrice: 399.0,
        durationMinutes: 360, // 6 hours
      },
    }),
    prisma.service.create({
      data: {
        name: "Politur & Keramik",
        basePrice: 799.0,
        durationMinutes: 480, // 8 hours
      },
    }),
  ]);

  // 4. Seed Add-ons
  console.log("➕ Seeding add-ons...");
  await Promise.all([
    prisma.addOn.create({
      data: { name: "Tierhaarentfernung", price: 50.0, additionalDuration: 45 },
    }),
    prisma.addOn.create({
      data: {
        name: "Ozonbehandlung (Geruch)",
        price: 80.0,
        additionalDuration: 60,
      },
    }),
    prisma.addOn.create({
      data: {
        name: "Lederpflege & Versiegelung",
        price: 90.0,
        additionalDuration: 60,
      },
    }),
    prisma.addOn.create({
      data: { name: "Motorraumreinigung", price: 60.0, additionalDuration: 30 },
    }),
  ]);

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

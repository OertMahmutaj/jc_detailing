import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "../app/lib/password";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("Starting database seeding...");

  await prisma.invoice.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.addOn.deleteMany({});
  await prisma.vehicleCategory.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding vehicle categories...");
  await Promise.all([
    prisma.vehicleCategory.create({
      data: { name: "City Car", priceModifier: 0.0 },
    }),
    prisma.vehicleCategory.create({
      data: { name: "Sedan", priceModifier: 20.0 },
    }),
    prisma.vehicleCategory.create({
      data: { name: "Sports Car", priceModifier: 20.0 },
    }),
    prisma.vehicleCategory.create({
      data: { name: "SUV", priceModifier: 20.0 },
    }),
    prisma.vehicleCategory.create({
      data: { name: "Van", priceModifier: 100.0 },
    }),
  ]);

  console.log("Seeding services...");
  await Promise.all([
    prisma.service.create({
      data: { name: "Komplette Innenreinigung", basePrice: 209.0, durationMinutes: 330 },
    }),
    prisma.service.create({
      data: { name: "Komplette Aussenreinigung", basePrice: 109.0, durationMinutes: 180 },
    }),
    prisma.service.create({
      data: { name: "Pflegeerhaltung Innenreinigung", basePrice: 129.0, durationMinutes: 150 },
    }),
    prisma.service.create({
      data: { name: "Pflegeerhaltung Aussenreinigung", basePrice: 69.0, durationMinutes: 90 },
    }),
    prisma.service.create({
      data: { name: "Polish Paket (1-Step)", basePrice: 399.0, durationMinutes: 240 },
    }),
    prisma.service.create({
      data: { name: "Polish Paket (2-Step)", basePrice: 599.0, durationMinutes: 480 },
    }),
    prisma.service.create({
      data: { name: "Keramik Versiegelung", basePrice: 1090.0, durationMinutes: 1380 },
    }),
    prisma.service.create({
      data: { name: "Komplette Premium Paket", basePrice: 299.0, durationMinutes: 420 },
    }),
  ]);

  console.log("Seeding add-ons...");
  await Promise.all([
    prisma.addOn.create({
      data: { name: "Tierhaarentfernung", price: 50.0, additionalDuration: 45 },
    }),
    prisma.addOn.create({
      data: { name: "Sitze Tiefenreinigung", price: 80.0, additionalDuration: 90 },
    }),
    prisma.addOn.create({
      data: { name: "Fussmatten intensiv", price: 30.0, additionalDuration: 30 },
    }),
    prisma.addOn.create({
      data: { name: "Kofferraum Deep Clean", price: 40.0, additionalDuration: 45 },
    }),
  ]);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log("Seeding admin user...");
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "JC Detailing Admin",
        password: hashPassword(adminPassword),
        role: "ADMIN",
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

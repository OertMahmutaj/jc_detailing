// app/api/booking-data/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function GET() {
  try {
    // Fetch all options in parallel to keep it blazing fast
    const [services, categories, addOns] = await Promise.all([
      prisma.service.findMany(),
      prisma.vehicleCategory.findMany(),
      prisma.addOn.findMany(),
    ]);

    return NextResponse.json({ services, categories, addOns });
  } catch (error) {
    console.error("Failed to fetch booking data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
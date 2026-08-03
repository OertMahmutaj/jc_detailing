import "server-only";

import { connection } from "next/server";
import { prisma } from "../(admin)/admin/_lib/prisma";
import { fallbackPublicPricing, type PublicPricing } from "./pricing";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesAll(value: string, terms: string[]) {
  return terms.every((term) => value.includes(term));
}

export async function getPublicPricing(): Promise<PublicPricing> {
  await connection();

  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        addOnOptions: {
          where: {
            isActive: true,
            addOn: { isActive: true },
          },
          select: {
            price: true,
            addOn: { select: { name: true } },
          },
        },
        basePrice: true,
        name: true,
      },
    });

    const servicePrice = (matcher: (name: string) => boolean, fallback: number) =>
      services.find((service) => matcher(normalize(service.name)))?.basePrice ?? fallback;

    const interior = servicePrice(
      (name) => name.includes("innenreinigung") && !name.includes("pflegeerhaltung"),
      fallbackPublicPricing.interior,
    );
    const exterior = servicePrice(
      (name) => name.includes("aussenreinigung") && !name.includes("pflegeerhaltung"),
      fallbackPublicPricing.exterior,
    );
    const premium = servicePrice(
      (name) => name.includes("premium"),
      fallbackPublicPricing.premium,
    );
    const polishOneStep = servicePrice(
      (name) => name.includes("polish") && (includesAll(name, ["1", "step"]) || name.includes("one step")),
      fallbackPublicPricing.polishOneStep,
    );
    const polishTwoStep = servicePrice(
      (name) => name.includes("polish") && (includesAll(name, ["2", "step"]) || name.includes("two step")),
      fallbackPublicPricing.polishTwoStep,
    );
    const ceramic = servicePrice(
      (name) => name.includes("keramik") || name.includes("ceramic"),
      fallbackPublicPricing.ceramic,
    );

    const activeAddOns = services.flatMap((service) => service.addOnOptions);
    const addOnPrice = (terms: string[], fallback: number) => {
      const matches = activeAddOns
        .filter((option) => terms.some((term) => normalize(option.addOn.name).includes(term)))
        .map((option) => option.price);

      return matches.length > 0 ? Math.min(...matches) : fallback;
    };

    const addOnPrices = {
      headliner: addOnPrice(["dachhimmel", "headliner"], fallbackPublicPricing.addOnPrices.headliner),
      mats: addOnPrice(["fussmatten", "floor mat"], fallbackPublicPricing.addOnPrices.mats),
      petHair: addOnPrice(["tierhaar", "pet hair"], fallbackPublicPricing.addOnPrices.petHair),
      seats: addOnPrice(["sitze", "seat"], fallbackPublicPricing.addOnPrices.seats),
      trunk: addOnPrice(["kofferraum", "trunk", "boot"], fallbackPublicPricing.addOnPrices.trunk),
    };

    const servicePrices = services.map((service) => service.basePrice).filter(Number.isFinite);

    return {
      addOns: Math.min(...Object.values(addOnPrices)),
      ceramic,
      exterior,
      interior,
      maxServicePrice:
        servicePrices.length > 0 ? Math.max(...servicePrices) : fallbackPublicPricing.maxServicePrice,
      minServicePrice:
        servicePrices.length > 0 ? Math.min(...servicePrices) : fallbackPublicPricing.minServicePrice,
      polishOneStep,
      polishTwoStep,
      premium,
      addOnPrices,
    };
  } catch (error) {
    console.error("Public pricing could not be loaded:", error);
    return fallbackPublicPricing;
  }
}

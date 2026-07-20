import type { PrismaClient } from "@prisma/client";

export const serviceCatalog = [
  {
    name: "Komplette Innenreinigung",
    aliases: ["Komplett Innenreinigung", "Innenreinigung komplett"],
    basePrice: 209,
    durationMinutes: 330,
  },
  {
    name: "Komplette Aussenreinigung",
    aliases: ["Komplett Aussenreinigung", "Aussenreinigung komplett"],
    basePrice: 109,
    durationMinutes: 180,
  },
  {
    name: "Pflegeerhaltung Innenreinigung",
    aliases: ["Erhaltungspflege Innenreinigung"],
    basePrice: 129,
    durationMinutes: 150,
  },
  {
    name: "Pflegeerhaltung Aussenreinigung",
    aliases: ["Erhaltungspflege Aussenreinigung"],
    basePrice: 69,
    durationMinutes: 90,
  },
  {
    name: "Polish Paket (1-Step)",
    aliases: ["Politur Paket (1-Step)", "Polish Paket - 1 Step"],
    basePrice: 399,
    durationMinutes: 240,
  },
  {
    name: "Polish Paket (2-Step)",
    aliases: ["Politur Paket (2-Step)", "Polish Paket - 2 Step"],
    basePrice: 599,
    durationMinutes: 480,
  },
  {
    name: "Keramik Versiegelung",
    aliases: ["Keramikversiegelung"],
    basePrice: 1090,
    durationMinutes: 1380,
  },
  {
    name: "Komplette Premium Paket",
    aliases: ["Complete Premium Paket", "Komplett Premium Paket"],
    basePrice: 299,
    durationMinutes: 420,
  },
] as const;

export const vehicleCategoryCatalog = [
  { name: "City Car", priceModifier: 0 },
  { name: "Sedan", priceModifier: 20 },
  { name: "Sports Car", priceModifier: 20 },
  { name: "SUV", priceModifier: 20 },
  { name: "Van", priceModifier: 100 },
] as const;

export const addOnCatalog = [
  { name: "Tierhaarentfernung", price: 50, additionalDuration: 45 },
  { name: "Sitze Tiefenreinigung", price: 80, additionalDuration: 90 },
  { name: "Fussmatten intensiv", price: 30, additionalDuration: 30 },
  { name: "Kofferraum Deep Clean", price: 40, additionalDuration: 45 },
] as const;

export const serviceOrder = serviceCatalog.map((service) => service.name);
export const categoryOrder = vehicleCategoryCatalog.map((category) => category.name);
export const addOnOrder = addOnCatalog.map((addOn) => addOn.name);

export async function ensureBookingCatalog(
  prisma: PrismaClient,
  options: { includeServices?: boolean } = {},
) {
  const includeServices = options.includeServices ?? true;

  if (includeServices) {
    for (const service of serviceCatalog) {
      const acceptedNames = [service.name, ...service.aliases];
      const existingServices = await prisma.service.findMany({
        where: { name: { in: acceptedNames } },
        select: { id: true, name: true },
      });
      const existingService =
        existingServices.find((entry) => entry.name === service.name) ?? existingServices[0];

      if (existingService) {
        await prisma.service.update({
          where: { id: existingService.id },
          data: {
            basePrice: service.basePrice,
            durationMinutes: service.durationMinutes,
            isActive: true,
            name: service.name,
          },
        });
      } else {
        await prisma.service.create({
          data: {
            basePrice: service.basePrice,
            durationMinutes: service.durationMinutes,
            isActive: true,
            name: service.name,
          },
        });
      }
    }
  }

  for (const category of vehicleCategoryCatalog) {
    const existingCategory = await prisma.vehicleCategory.findFirst({
      where: { name: category.name },
      select: { id: true },
    });

    if (existingCategory) {
      await prisma.vehicleCategory.update({
        where: { id: existingCategory.id },
        data: { priceModifier: category.priceModifier },
      });
    } else {
      await prisma.vehicleCategory.create({ data: category });
    }
  }

  for (const addOn of addOnCatalog) {
    const existingAddOn = await prisma.addOn.findFirst({
      where: { name: addOn.name },
      select: { id: true },
    });

    if (existingAddOn) {
      await prisma.addOn.update({
        where: { id: existingAddOn.id },
        data: {
          price: addOn.price,
          additionalDuration: addOn.additionalDuration,
        },
      });
    } else {
      await prisma.addOn.create({ data: addOn });
    }
  }
}

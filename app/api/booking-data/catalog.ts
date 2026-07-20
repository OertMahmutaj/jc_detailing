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
  { name: "City Car", priceModifier: 0, imageUrl: "/city_car.webp" },
  { name: "Sedan", priceModifier: 20, imageUrl: "/sedan.webp" },
  { name: "Sports Car", priceModifier: 20, imageUrl: "/sports_car.webp" },
  { name: "SUV", priceModifier: 20, imageUrl: "/suv.webp" },
  { name: "Van", priceModifier: 100, imageUrl: "/van.webp" },
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

export const defaultAddOnsByService: Record<string, string[]> = {
  "Komplette Innenreinigung": ["Tierhaarentfernung"],
  "Pflegeerhaltung Innenreinigung": [
    "Tierhaarentfernung",
    "Sitze Tiefenreinigung",
    "Fussmatten intensiv",
    "Kofferraum Deep Clean",
  ],
  "Komplette Premium Paket": ["Tierhaarentfernung"],
};

export async function ensureBookingCatalog(
  prisma: PrismaClient,
  options: {
    includeAddOns?: boolean;
    includeCategories?: boolean;
    includeServices?: boolean;
  } = {},
) {
  const includeAddOns = options.includeAddOns ?? true;
  const includeCategories = options.includeCategories ?? true;
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

  if (includeCategories) {
    for (const category of vehicleCategoryCatalog) {
      const existingCategory = await prisma.vehicleCategory.findFirst({
        where: { name: category.name },
        select: { id: true, imageUrl: true },
      });

      if (existingCategory?.imageUrl === null) {
        await prisma.vehicleCategory.update({
          where: { id: existingCategory.id },
          data: { imageUrl: category.imageUrl },
        });
      } else if (!existingCategory) {
        await prisma.vehicleCategory.create({
          data: {
            imageUrl: category.imageUrl,
            isActive: true,
            name: category.name,
            priceModifier: category.priceModifier,
          },
        });
      }
    }
  }

  if (includeAddOns) {
    for (const addOn of addOnCatalog) {
      const existingAddOn = await prisma.addOn.findFirst({
        where: { name: addOn.name },
        select: { id: true },
      });

      if (!existingAddOn) {
        await prisma.addOn.create({
          data: {
            additionalDuration: addOn.additionalDuration,
            isActive: true,
            name: addOn.name,
            price: addOn.price,
          },
        });
      }
    }
  }

  const [services, categories, addOns, vehicleOptionCount, addOnOptionCount] = await Promise.all([
    prisma.service.findMany({
      select: { id: true, name: true },
      where: { isActive: true },
    }),
    prisma.vehicleCategory.findMany({
      select: { id: true, name: true, priceModifier: true },
      where: { isActive: true },
    }),
    prisma.addOn.findMany({
      select: { additionalDuration: true, id: true, name: true, price: true },
      where: { isActive: true },
    }),
    prisma.serviceVehicleCategory.count(),
    prisma.serviceAddOn.count(),
  ]);

  if (vehicleOptionCount === 0) {
    for (const service of services) {
      for (const category of categories) {
        await prisma.serviceVehicleCategory.upsert({
          where: {
            serviceId_vehicleCategoryId: {
              serviceId: service.id,
              vehicleCategoryId: category.id,
            },
          },
          update: {},
          create: {
            isActive: true,
            priceModifier: category.priceModifier,
            serviceId: service.id,
            vehicleCategoryId: category.id,
          },
        });
      }
    }
  }

  if (addOnOptionCount > 0) return;

  for (const service of services) {
    const defaultAddOnNames = defaultAddOnsByService[service.name] ?? [];

    for (const addOn of addOns.filter((item) => defaultAddOnNames.includes(item.name))) {
      await prisma.serviceAddOn.upsert({
        where: {
          serviceId_addOnId: {
            addOnId: addOn.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          addOnId: addOn.id,
          additionalDuration: addOn.additionalDuration,
          isActive: true,
          price: addOn.price,
          serviceId: service.id,
        },
      });
    }
  }
}

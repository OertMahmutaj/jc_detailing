import { prisma } from "./prisma";

export type AdminCatalogService = {
  id: string;
  name: string;
  basePrice: number;
  durationMinutes: number;
};

export type AdminCatalogServiceLink = {
  serviceId: string;
  isActive: boolean;
  price?: number;
  priceModifier?: number;
  additionalDuration?: number;
};

export type AdminCatalogVehicleCategory = {
  id: string;
  name: string;
  priceModifier: number;
  serviceOptions: AdminCatalogServiceLink[];
};

export type AdminCatalogAddOn = {
  id: string;
  name: string;
  price: number;
  additionalDuration: number;
  serviceOptions: AdminCatalogServiceLink[];
};

export type AdminCompanyVehicle = {
  id: string;
  licensePlate: string;
  model: string;
  vehicleCategory: {
    id: string;
    name: string;
  };
};

export type AdminCompanyServicePrice = {
  price: number;
  serviceId: string;
};

export type AdminCompanyClient = {
  address: string | null;
  companyServicePrices: AdminCompanyServicePrice[];
  companyVehicles: AdminCompanyVehicle[];
  email: string;
  id: string;
  name: string;
  paymentTermsDays: number;
  phone: string;
};

export async function getAdminBookingCatalog(
  audience: "PRIVATE" | "COMPANY" = "PRIVATE",
) {
  const [services, categories, addOns] = await Promise.all([
    prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        basePrice: true,
        durationMinutes: true,
        id: true,
        name: true,
      },
      where: {
        audience,
        isActive: true,
      },
    }),
    prisma.vehicleCategory.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        priceModifier: true,
        serviceOptions: {
          select: {
            isActive: true,
            priceModifier: true,
            serviceId: true,
          },
          where: {
            isActive: true,
            service: {
              audience,
              isActive: true,
            },
          },
        },
      },
      where: {
        isActive: true,
        serviceOptions: {
          some: {
            isActive: true,
            service: {
              audience,
              isActive: true,
            },
          },
        },
      },
    }),
    prisma.addOn.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        additionalDuration: true,
        id: true,
        name: true,
        price: true,
        serviceOptions: {
          select: {
            additionalDuration: true,
            isActive: true,
            price: true,
            serviceId: true,
          },
          where: {
            isActive: true,
            service: {
              audience,
              isActive: true,
            },
          },
        },
      },
      where: {
        isActive: true,
        serviceOptions: {
          some: {
            isActive: true,
            service: {
              audience,
              isActive: true,
            },
          },
        },
      },
    }),
  ]);

  return { addOns, categories, services };
}

export async function getAdminCompanyClients() {
  return prisma.client.findMany({
    orderBy: { name: "asc" },
    select: {
      address: true,
      companyServicePrices: {
        select: {
          price: true,
          serviceId: true,
        },
      },
      companyVehicles: {
        orderBy: [{ model: "asc" }, { licensePlate: "asc" }],
        select: {
          id: true,
          licensePlate: true,
          model: true,
          vehicleCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: { isActive: true },
      },
      email: true,
      id: true,
      name: true,
      paymentTermsDays: true,
      phone: true,
    },
    where: { type: "COMPANY" },
  });
}

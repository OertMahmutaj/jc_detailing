import type { PublicLocale } from "./i18n";

export type PublicPricing = {
  addOns: number;
  ceramic: number;
  exterior: number;
  interior: number;
  maxServicePrice: number;
  minServicePrice: number;
  polishOneStep: number;
  polishTwoStep: number;
  premium: number;
  addOnPrices: {
    headliner: number;
    mats: number;
    petHair: number;
    seats: number;
    trunk: number;
  };
};

export const fallbackPublicPricing: PublicPricing = {
  addOns: 30,
  ceramic: 1090,
  exterior: 109,
  interior: 209,
  maxServicePrice: 1090,
  minServicePrice: 69,
  polishOneStep: 399,
  polishTwoStep: 599,
  premium: 299,
  addOnPrices: {
    headliner: 50,
    mats: 30,
    petHair: 50,
    seats: 80,
    trunk: 40,
  },
};

export function formatChfAmount(value: number) {
  return new Intl.NumberFormat("de-CH", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function formatStartingPrice(locale: PublicLocale, value: number) {
  const amount = formatChfAmount(value);

  switch (locale) {
    case "en":
      return `from CHF ${amount}`;
    case "fr":
      return `dès CHF ${amount}`;
    case "it":
      return `da CHF ${amount}`;
    default:
      return `ab ${amount} CHF`;
  }
}

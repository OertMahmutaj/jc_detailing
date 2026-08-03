// app/angebote/de/page.tsx

import type { Metadata } from "next";
import { OffersPageContent } from "../page";
import { buildPublicMetadata, publicPageSeo } from "../../seo";

export const metadata: Metadata = buildPublicMetadata("de", {
  path: "/angebote",
  ...publicPageSeo.offers.de,
});

export default async function GermanOffersPage() {
  return await OffersPageContent({ locale: "de" });
}

// app/angebote/de/page.tsx

import type { Metadata } from "next";
import { OffersPageContent } from "../page";
import { buildPublicMetadata, publicPageSeo } from "../../seo";

export const metadata: Metadata = buildPublicMetadata("de", {
  path: "/angebote",
  ...publicPageSeo.offers.de,
});

export default function GermanOffersPage() {
  return <OffersPageContent locale="de" />;
}

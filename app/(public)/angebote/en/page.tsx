import type { Metadata } from "next";
import { OffersPageContent } from "../page";
import { buildPublicMetadata, publicPageSeo } from "../../seo";

export const metadata: Metadata = buildPublicMetadata("en", {
  path: "/angebote",
  ...publicPageSeo.offers.en,
});

export default function EnglishOffersPage() {
  return <OffersPageContent locale="en" />;
}

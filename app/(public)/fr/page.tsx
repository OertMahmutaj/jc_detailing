import type { Metadata } from "next";
import { HomePage } from "../page";
import { buildPublicMetadata, homeSeo } from "../seo";

export const metadata: Metadata = buildPublicMetadata("fr", {
  path: "/",
  ...homeSeo.fr,
});

export default async function FrenchHomePage() {
  return await HomePage({ locale: "fr" });
}

import type { Metadata } from "next";
import { HomePage } from "../page";
import { buildPublicMetadata, homeSeo } from "../seo";

export const metadata: Metadata = buildPublicMetadata("de", {
  path: "/",
  ...homeSeo.de,
});

export default async function GermanHomePage() {
  return await HomePage({ locale: "de" });
}

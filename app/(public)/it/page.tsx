import type { Metadata } from "next";
import { HomePage } from "../page";
import { buildPublicMetadata, homeSeo } from "../seo";

export const metadata: Metadata = buildPublicMetadata("it", {
  path: "/",
  ...homeSeo.it,
});

export default async function ItalianHomePage() {
  return await HomePage({ locale: "it" });
}

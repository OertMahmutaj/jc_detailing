import type { Metadata } from "next";
import { HomePage } from "../page";
import { buildPublicMetadata, homeSeo } from "../seo";

export const metadata: Metadata = buildPublicMetadata("en", {
  path: "/",
  ...homeSeo.en,
});

export default function EnglishHomePage() {
  return <HomePage locale="en" />;
}

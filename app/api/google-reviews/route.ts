// app/api/google-reviews/route.ts

import { getGoogleReviews } from "../../lib/googleReviews";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = await getGoogleReviews();

  return Response.json(reviews);
}

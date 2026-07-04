// app/lib/googleReviews.ts

export type GoogleReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
};

export type GoogleReviewsResult = {
  error?: string;
  rating: number | null;
  reviews: GoogleReview[];
  total: number;
  url: string;
};

export const googleMapsUrl =
  "https://www.google.com/maps/place/JCDetailing/@47.1851689,7.8752737,12z/data=!4m12!1m2!2m1!1sjc+detailing+luzern!3m8!1s0x47902198a9df5769:0xb4f52c1f731c38bb!8m2!3d47.1851689!4d8.027709!9m1!1b1!15sChNqYyBkZXRhaWxpbmcgbHV6ZXJuWhUiE2pjIGRldGFpbGluZyBsdXplcm6SARVjYXJfZGV0YWlsaW5nX3NlcnZpY2WaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnhDTTFvelJqUlBWelZRV21wa01VNUZNVzVoZWtaRVZHNXNNMlJHUlJBQuABAPoBBAgAEC8!16s%2Fg%2F11z64wxb_v?entry=ttu";

async function resolvePlaceId(key: string) {
  if (process.env.GOOGLE_PLACE_ID) {
    return process.env.GOOGLE_PLACE_ID;
  }

  const input = encodeURIComponent(process.env.GOOGLE_PLACE_QUERY ?? "JCDetailing Luzern");
  const url =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${input}` +
    `&inputtype=textquery` +
    `&fields=place_id` +
    `&key=${key}`;

  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
  });
  const data = await res.json();

  return data.candidates?.[0]?.place_id as string | undefined;
}

export async function getGoogleReviews(): Promise<GoogleReviewsResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY;

  if (!key) {
    return {
      rating: null,
      total: 0,
      reviews: [],
      url: googleMapsUrl,
      error: "Missing GOOGLE_MAPS_API_KEY",
    };
  }

  try {
    const placeId = await resolvePlaceId(key);

    if (!placeId) {
      return {
        rating: null,
        total: 0,
        reviews: [],
        url: googleMapsUrl,
        error: "Google place could not be resolved",
      };
    }

    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}` +
      `&fields=name,rating,user_ratings_total,reviews,url` +
      `&reviews_sort=newest` +
      `&key=${key}`;

    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 12 },
    });

    const data = await res.json();

    if (data.status && data.status !== "OK") {
      return {
        rating: null,
        total: 0,
        reviews: [],
        url: googleMapsUrl,
        error: data.error_message ?? data.status,
      };
    }

    return {
      rating: data.result?.rating ?? null,
      total: data.result?.user_ratings_total ?? 0,
      reviews: data.result?.reviews ?? [],
      url: data.result?.url ?? googleMapsUrl,
    };
  } catch {
    return {
      rating: null,
      total: 0,
      reviews: [],
      url: googleMapsUrl,
      error: "Google reviews unavailable",
    };
  }
}

// app/components/ReviewMarquee.tsx

import { getGoogleReviews } from "../lib/googleReviews";
import { LightGroup, LightItem, LightReveal } from "./StudioMotion";

type Review = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
};

const fallbackReviews: Review[] = [
  {
    author_name: "Jonny Glarner",
    rating: 5,
    text: "Took my Mercedes GLC 63 S here for a full interior cleaning. The service was excellent from start to finish. Very professional, honest, and explained everything clearly.",
  },
  {
    author_name: "Karin Wyss",
    rating: 5,
    text: `Unser Familienauto hatte durch den täglichen Gebrauch mit Kindern schon einiges mitgemacht und war wirklich sehr stark verschmutzt. Wir sind vom Ergebnis bei JCDetailing sehr beeindruckt, das Auto sieht aus wie neu.`,
  },
  {
    author_name: "Roshan Perera",
    rating: 5,
    text: "Habe eine Innenraum-Aufbereitung machen lassen. Das Ergebnis ist fantastisch. Der Landrover fühlt sich wieder wie ein Neuwagen an. Eine klare Empfehlung!",
  },
  {
    author_name: "Yosef delo",
    rating: 5,
    text: `Toller Service👌🏻 Unser Auto sieht wieder wie neu aus. Sehr professionelle und zuverlässige Arbeit. Absolut empfehlenswert
      Vielen Dank 🙏`,
  },
  {
    author_name: "Andi Sylaj",
    rating: 5,
    text: "Très satisfait du travail réalisé sur ma voiture. Le polissage a été effectué avec beaucoup de soin et de professionnalisme. Le résultat est impeccable.",
  },
  {
    author_name: "Adrian Burger",
    rating: 5,
    text: "Beste Adresse für Autoreinigungen im Raum Luzern. Danke für den top Service Juljan.",
  },
];

async function getReviews() {
  const data = await getGoogleReviews();

  return data.reviews as Review[];
}

export async function ReviewMarquee() {
  const reviews = await getReviews();
  const items = (reviews.length ? reviews : fallbackReviews).slice(0, 6);

  return (
    <section className="review-section section">
      <LightReveal className="section-heading compact">
        <span>05</span>
        <h2>What customers say</h2>
      </LightReveal>

      <LightGroup className="review-strip">
        <div className="review-track">
          {items.map((review, index) => (
            <LightItem key={`${review.author_name}-${index}`}>
              <article className="review-card">
                <strong>{review.author_name}</strong>
                <span>{"*".repeat(review.rating)}</span>
                <p>{review.text}</p>
                {review.relative_time_description && (
                  <small>{review.relative_time_description}</small>
                )}
              </article>
            </LightItem>
          ))}
        </div>
      </LightGroup>
    </section>
  );
}

"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePublicLocale } from "./usePublicLocale";

type Review = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
};

type ReviewResponse = {
  rating: number | null;
  reviews: Review[];
  total: number;
};

const googleReviewsUrl =
  "https://www.google.com/maps/place/JCDetailing/@47.1851689,8.027709,17z/data=!4m8!3m7!1s0x47902198a9df5769:0xb4f52c1f731c38bb!8m2!3d47.1851689!4d8.027709!9m1!1b1!16s%2Fg%2F11z64wxb_v?authuser=0&hl=en&entry=ttu&g_ep=EgoyMDI2MDYyOS4wIKXMDSoASAFQAw%3D%3D";

export function GoogleReviewWidget() {
  const locale = usePublicLocale();
  const copy = {
    de: { reviews: "Bewertungen", openMaps: "Google Bewertungen auf Google Maps öffnen", open: "Google Bewertungen öffnen", close: "Bewertungen schliessen", panel: "Google Bewertungen", stars: "von 5 Sternen", failed: "Google Bewertungen konnten nicht geladen werden.", loading: "Google Bewertungen werden geladen..." },
    en: { reviews: "Reviews", openMaps: "Open Google reviews on Google Maps", open: "Open Google reviews", close: "Close reviews", panel: "Google Reviews", stars: "out of 5 stars", failed: "Google reviews could not be loaded.", loading: "Loading Google reviews..." },
    fr: { reviews: "Avis", openMaps: "Ouvrir les avis Google sur Google Maps", open: "Ouvrir les avis Google", close: "Fermer les avis", panel: "Avis Google", stars: "sur 5 étoiles", failed: "Impossible de charger les avis Google.", loading: "Chargement des avis Google..." },
    it: { reviews: "Recensioni", openMaps: "Apri le recensioni Google su Google Maps", open: "Apri le recensioni Google", close: "Chiudi recensioni", panel: "Recensioni Google", stars: "su 5 stelle", failed: "Impossibile caricare le recensioni Google.", loading: "Caricamento recensioni Google..." },
  }[locale];
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [total, setTotal] = useState(7);
  const [loaded, setLoaded] = useState(false);
  const [hiddenWhileScrolled, setHiddenWhileScrolled] = useState(false);
  const [hiddenWhileMenuOpen, setHiddenWhileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const response = await fetch("/api/google-reviews");
        const data = (await response.json()) as ReviewResponse;

        if (!active) {
          return;
        }

        if (data.reviews?.length) {
          setReviews(data.reviews);
        }

        if (data.rating) {
          setRating(data.rating);
        }

        if (data.total) {
          setTotal(data.total);
        }

        setLoaded(true);
      } catch {
        if (active) {
          setLoaded(true);
        }
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function updateVisibility() {
      const shouldHide = window.scrollY > 24;

      setHiddenWhileScrolled(shouldHide);

      if (shouldHide) {
        setOpen(false);
      }
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  useEffect(() => {
    function syncMobileMenu(event: Event) {
      const isOpen = event instanceof CustomEvent && Boolean(event.detail?.open);

      setHiddenWhileMenuOpen(isOpen);

      if (isOpen) {
        setOpen(false);
      }
    }

    window.addEventListener("jc-mobile-menu-change", syncMobileMenu);

    return () => {
      window.removeEventListener("jc-mobile-menu-change", syncMobileMenu);
    };
  }, []);

  return (
    <div
      className={`google-review-widget${open ? " is-open" : ""}${hiddenWhileScrolled || hiddenWhileMenuOpen ? " is-hidden" : ""
        }`}
    >
      {!open && (
        <div className="google-review-badge">
          <a
            className="google-mark"
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={copy.openMaps}
          >
            G
          </a>

          <button
            className="google-rating-toggle"
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="google-review-panel"
          >
            <span className="google-rating">
              <strong>{rating.toFixed(1)}</strong>

              <span aria-hidden="true">
                {"★".repeat(5)}
              </span>

              <small>
                {total} {copy.reviews}
              </small>
            </span>

            <span className="sr-only">{copy.open}</span>

            <span
              className="google-review-arrow"
              aria-hidden="true"
            >
              <ChevronDown className="svg" size={21} />
            </span>
          </button>
        </div>
      )}

      {open && (
        <div
          className="google-review-panel"
          id="google-review-panel"
          role="region"
          aria-label={copy.panel}
        >
          <div className="google-review-panel-head">
            <span>{copy.panel}</span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.close}
            >
              <X aria-hidden="true" size={17} />
            </button>
          </div>

          <div className="google-review-table">
            {reviews.length ? (
              reviews.map((review, index) => (
                <article
                  className="google-review-row"
                  key={`${review.author_name}-${index}`}
                >
                  <div
                    className="review-avatar"
                    aria-hidden="true"
                  >
                    {review.author_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div>
                    <div className="review-row-top">
                      <strong>{review.author_name}</strong>

                      {review.relative_time_description && (
                        <small>
                          {review.relative_time_description}
                        </small>
                      )}
                    </div>

                    <span
                      className="review-stars"
                      aria-label={`${review.rating} ${copy.stars}`}
                    >
                      <span aria-hidden="true">
                        {"★".repeat(review.rating)}
                      </span>
                    </span>

                    <p>{review.text}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="google-review-empty">
                {loaded ? copy.failed : copy.loading}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  "https://www.google.com/maps/place/JCDetailing/@47.1851689,7.8752737,12z/data=!4m12!1m2!2m1!1sjc+detailing+luzern!3m8!1s0x47902198a9df5769:0xb4f52c1f731c38bb!8m2!3d47.1851689!4d8.027709!9m1!1b1!15sChNqYyBkZXRhaWxpbmcgbHV6ZXJuWhUiE2pjIGRldGFpbGluZyBsdXplcm6SARVjYXJfZGV0YWlsaW5nX3NlcnZpY2WaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnhDTTFvelJqUlBWelZRV21wa01VNUZNVzVoZWtaRVZHNXNNMlJHUlJBQuABAPoBBAgAEC8!16s%2Fg%2F11z64wxb_v?entry=ttu";

export function GoogleReviewWidget() {
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
    <div className={`google-review-widget${open ? " is-open" : ""}${hiddenWhileScrolled || hiddenWhileMenuOpen ? " is-hidden" : ""}`}>
      {!open && (
        <div className="google-review-badge">
          <a
            className="google-mark"
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Bewertungen auf Google Maps oeffnen"
          >
            G
          </a>
          <button
            className="google-rating-toggle"
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Google Bewertungen oeffnen"
          >
            <span className="google-rating">
              <strong>{rating.toFixed(1)}</strong>
              <span aria-hidden="true">{"*".repeat(5)}</span>
              <small>{total} Reviews</small>
            </span>
            <span className="google-review-arrow" aria-hidden="true">
              <ChevronDown className="svg" size={21} />
            </span>
          </button>
        </div>
      )}

      {open && (
        <div className="google-review-panel">
          <div className="google-review-panel-head">
            <span>Google Reviews</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Bewertungen schliessen">
              <X size={17} />
            </button>
          </div>

          <div className="google-review-table">
            {reviews.length ? (
              reviews.map((review, index) => (
                <article className="google-review-row" key={`${review.author_name}-${index}`}>
                  <div className="review-avatar" aria-hidden="true">
                    {review.author_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="review-row-top">
                      <strong>{review.author_name}</strong>
                      {review.relative_time_description && <small>{review.relative_time_description}</small>}
                    </div>
                    <span aria-label={`${review.rating} von 5 Sternen`}>
                      {"*".repeat(review.rating)}
                    </span>
                    <p>{review.text}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="google-review-empty">
                {loaded
                  ? "Google Bewertungen konnten nicht geladen werden."
                  : "Google Bewertungen werden geladen..."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

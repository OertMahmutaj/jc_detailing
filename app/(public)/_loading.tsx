export default function PublicLoading() {
  return (
    <main
      aria-label="Seite wird geladen"
      aria-live="polite"
      className="public-page-loading"
      role="status"
    >
      <span
        aria-hidden="true"
        className="public-page-loading-spinner"
      />

      <span className="sr-only">
        Seite wird geladen
      </span>
    </main>
  );
}
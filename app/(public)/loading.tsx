export default function PublicLoading() {
  return (
    <div
      aria-label="Seite wird geladen"
      className="public-page-loading"
      role="status"
    >
      <span className="public-page-loading-spinner" />
    </div>
  );
}
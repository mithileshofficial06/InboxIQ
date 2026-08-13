/**
 * Shown on pages whose backing data is never populated.
 *
 * The `subscriptions` and `job_applications` tables are read by the API and
 * rendered here, but no code path writes to them — there is no detection
 * pipeline yet. These pages are removed from the sidebar; this notice covers
 * anyone who reaches them by direct URL, so the feature reads as "not built"
 * rather than "broken" or "you have no data".
 */
export function FeatureUnavailable({
  title,
  what,
}: {
  title: string;
  what: string;
}) {
  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1
        className="editorial-heading"
        style={{
          fontSize: "36px",
          marginBottom: "40px",
          borderBottom: "1px solid var(--color-border-default)",
          paddingBottom: "24px",
        }}
      >
        {title}
      </h1>

      <div
        className="editorial-card"
        style={{ padding: "48px", textAlign: "center", maxWidth: "640px" }}
      >
        <div
          className="editorial-subheading"
          style={{ marginBottom: "16px", color: "var(--color-ochre)" }}
        >
          Not yet available
        </div>
        <p
          style={{
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            fontSize: "15px",
          }}
        >
          {what} Nothing currently writes this data during sync, so this page
          would always be empty. It has been removed from the sidebar until the
          detection pipeline is built.
        </p>
      </div>
    </div>
  );
}

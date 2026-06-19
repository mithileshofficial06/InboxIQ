"use client";

const MEMORIES = [
  { id: "1", type: "FIRST", color: "var(--color-sage)", title: "First Interactions", desc: "Awaiting synchronization to detect your oldest continuous threads." },
  { id: "2", type: "OFFER", color: "var(--color-ochre)", title: "Career Offers", desc: "Awaiting synchronization to extract historical offers and promotions." },
  { id: "3", type: "EDU", color: "var(--color-slate)", title: "Academic Records", desc: "Awaiting synchronization to index university acceptances." },
  { id: "4", type: "MILE", color: "var(--color-terracotta)", title: "Platform Milestones", desc: "Awaiting synchronization to compile lifetime metrics." }
];

export default function MemoriesPage() {
  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 className="editorial-heading" style={{ fontSize: "36px", marginBottom: "48px", borderBottom: "1px solid var(--color-border-default)", paddingBottom: "24px" }}>Archives</h1>
      
      <div className="editorial-card" style={{ marginBottom: "64px", padding: "48px", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border-default)" }}>
        <div className="editorial-subheading" style={{ color: "var(--color-slate)", marginBottom: "24px" }}>On This Day</div>
        <h2 className="editorial-heading" style={{ fontSize: "48px", marginBottom: "24px", color: "var(--color-text-primary)" }}>
          {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </h2>
        <p style={{ fontSize: "18px", color: "var(--color-text-secondary)", lineHeight: 1.8, maxWidth: "600px" }}>
          Your historical archive is currently pending complete synchronization. Once the system has finished indexing your inbox, significant correspondence from this exact date in previous years will be surfaced here.
        </p>
      </div>

      <h2 className="editorial-heading" style={{ fontSize: "28px", marginBottom: "32px" }}>Collections</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px" }}>
        {MEMORIES.map(m => (
          <div key={m.id} className="editorial-card" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "32px 24px" }}>
            <h3 className="editorial-heading" style={{ fontSize: "20px", color: m.color }}>{m.title}</h3>
            <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {m.desc}
            </p>
            <div style={{ marginTop: "auto", paddingTop: "24px" }}>
              <span className="editorial-subheading" style={{ color: "var(--color-text-tertiary)" }}>
                Status — Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

const MEMORIES = [
  { t: "FIRST", c: "#ff007f", title: "FIRST_CONTACT", d: "AWAITING_SYNC" },
  { t: "OFFER", c: "#00ff41", title: "CAREER_OFFER", d: "AWAITING_SYNC" },
  { t: "EDU", c: "#ffb800", title: "ACADEMIC_ADMIT", d: "AWAITING_SYNC" },
  { t: "MILE", c: "#00e5ff", title: "SYSTEM_MILESTONE", d: "AWAITING_SYNC" }
];

export default function MemoriesPage() {
  return (
    <div>
      <h1 className="brutal-text" style={{ fontSize: "40px", marginBottom: "32px", borderBottom: "4px solid #fff", paddingBottom: "16px" }}>ARCHIVE_HIGHLIGHTS</h1>
      
      <div className="brutal-card" style={{ marginBottom: "40px", borderColor: "var(--color-accent)", boxShadow: "var(--shadow-brutal-accent)" }}>
        <div style={{ background: "var(--color-accent)", color: "#000", display: "inline-block", padding: "4px 12px", fontFamily: "var(--font-mono)", fontWeight: "bold", marginBottom: "16px" }}>ON_THIS_DAY</div>
        <h2 className="brutal-text" style={{ fontSize: "28px", marginBottom: "16px" }}>{new Date().toISOString().split('T')[0]}</h2>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", lineHeight: 1.6, maxWidth: "600px" }}>
          ARCHIVE DATA PENDING. ONCE SYSTEM INDEXING IS COMPLETE, HISTORICAL RECORDS FROM THIS EXACT DATE IN PREVIOUS YEARS WILL BE DISPLAYED HERE.
        </p>
      </div>

      <h2 className="brutal-text" style={{ fontSize: "24px", marginBottom: "24px" }}>DETECTED_MILESTONES</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
        {MEMORIES.map(m => (
          <div key={m.t} className="brutal-card" style={{ borderColor: m.c }}>
            <div style={{ width: "40px", height: "40px", background: m.c, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: "bold", marginBottom: "16px", border: "2px solid #fff" }}>
              {m.t[0]}
            </div>
            <h3 className="brutal-text" style={{ fontSize: "18px", marginBottom: "8px", color: m.c }}>{m.title}</h3>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", background: "#222", padding: "8px", border: "2px solid #555" }}>
              STATUS: {m.d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

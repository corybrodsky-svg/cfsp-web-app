"use client";

import { useMemo, useState } from "react";
import SiteShell from "../components/SiteShell";
import { sps } from "../lib/mockData";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d8e0ec",
  borderRadius: "18px",
  padding: "18px",
  background: "#ffffff",
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const infoCard: React.CSSProperties = {
  border: "1px solid #d8e0ec",
  borderRadius: "14px",
  padding: "14px",
  background: "#f8fbff",
};

export default function SPsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sps;

    return sps.filter((sp) => {
      const haystack = [
        sp.fullName,
        sp.email,
        sp.phone,
        sp.portrayalAge,
        sp.raceSex,
        sp.status,
        sp.notes,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [query]);

  return (
    <SiteShell
      title="SP Database"
      subtitle="Search the roster, then review key standardized patient details."
    >
      <input
        placeholder="Search by name, email, phone, portrayal age, race, sex..."
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #cfd7e6",
          marginBottom: "18px",
          fontSize: "16px",
        }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div style={{ marginBottom: "18px", color: "#64748b" }}>
        Showing <strong>{filtered.length}</strong> of <strong>{sps.length}</strong> SPs
      </div>

      <div style={gridStyle}>
        {filtered.map((sp) => (
          <div key={sp.id} style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0 }}>{sp.fullName}</h2>

              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid #b8ddc3",
                  background: sp.status === "Active" ? "#eaf8ee" : "#f3f4f6",
                  color: sp.status === "Active" ? "#207245" : "#6b7280",
                  fontWeight: 700,
                }}
              >
                {sp.status}
              </span>
            </div>

            <div style={{ ...infoGrid, marginTop: "14px" }}>
              <div style={infoCard}>
                <strong>Working Email</strong>
                <p style={{ marginBottom: 0 }}>{sp.email}</p>
              </div>

              <div style={infoCard}>
                <strong>Phone</strong>
                <p style={{ marginBottom: 0 }}>{sp.phone}</p>
              </div>

              <div style={infoCard}>
                <strong>Portrayal Age</strong>
                <p style={{ marginBottom: 0 }}>{sp.portrayalAge}</p>
              </div>

              <div style={infoCard}>
                <strong>Race / Sex</strong>
                <p style={{ marginBottom: 0 }}>{sp.raceSex}</p>
              </div>
            </div>

            <p style={{ marginTop: "14px", marginBottom: 0 }}>
              <strong>Notes:</strong> {sp.notes}
            </p>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>No results</h3>
            <p style={{ marginBottom: 0 }}>Try a broader search term.</p>
          </div>
        ) : null}
      </div>
    </SiteShell>
  );
}
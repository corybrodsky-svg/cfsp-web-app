"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #d4deeb",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 900, color: "#12376b" }}>
          Dashboard
        </div>
        <div style={{ fontSize: 17, color: "#61748e", marginTop: 10 }}>
          This is the dashboard page. If you click Events, this page should disappear and you
          should see the Events header instead.
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link href="/events" style={blueBtn}>
            Go to Events
          </Link>
          <Link href="/upload-schedule" style={greenBtn}>
            Upload Schedule
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        <StatCard label="Total Events" value="3" accent="#1E5AA8" />
        <StatCard label="SPs Assigned" value="17" accent="#2E8B57" />
        <StatCard label="Need SPs" value="2" accent="#c84a3a" />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d4deeb",
        borderLeft: `8px solid ${accent}`,
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: "#61748e" }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 900, color: "#12376b", marginTop: 10 }}>
        {value}
      </div>
    </div>
  );
}

const blueBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#1E5AA8",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: 14,
  fontWeight: 900,
};

const greenBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#2E8B57",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: 14,
  fontWeight: 900,
};
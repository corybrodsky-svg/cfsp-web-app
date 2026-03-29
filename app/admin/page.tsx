"use client";

import Link from "next/link";

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: "16px 18px",
  border: "1px solid #d8e0ec",
  borderRadius: "14px",
  background: "#ffffff",
  color: "#16324f",
  textDecoration: "none",
  fontWeight: 700,
};

export default function AdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, color: "#16324f" }}>CFSP Admin</h1>
        <p style={{ color: "#516173", marginBottom: "24px" }}>
          Login is temporarily disabled so you can get back into the app.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <Link href="/" style={cardStyle}>Home</Link>
          <Link href="/events" style={cardStyle}>Events</Link>
          <Link href="/sp-directory" style={cardStyle}>SP Directory</Link>
          <Link href="/sim-op" style={cardStyle}>Sim Op</Link>
          <Link href="/login" style={cardStyle}>Login Page</Link>
        </div>
      </div>
    </main>
  );
}

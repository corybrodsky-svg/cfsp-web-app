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

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, color: "#16324f" }}>CFSP</h1>
        <p style={{ color: "#516173", marginBottom: "24px" }}>
          Temporary safe home page so the app can build and deploy.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <Link href="/login" style={cardStyle}>Login</Link>
          <Link href="/admin" style={cardStyle}>Admin</Link>
          <Link href="/events" style={cardStyle}>Events</Link>
          <Link href="/sp-directory" style={cardStyle}>SP Directory</Link>
          <Link href="/sim-op" style={cardStyle}>Sim Op</Link>
        </div>
      </div>
    </main>
  );
}

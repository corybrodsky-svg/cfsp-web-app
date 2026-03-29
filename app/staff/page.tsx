import Link from "next/link";

export default function StaffPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, color: "#16324f" }}>Staff</h1>
        <p style={{ color: "#516173", marginBottom: "24px" }}>
          Temporary staff page while the app is being stabilized.
        </p>

        <Link
          href="/admin"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#16324f",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Back to Admin
        </Link>
      </div>
    </main>
  );
}

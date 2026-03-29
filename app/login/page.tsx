import Link from "next/link";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #d8e0ec",
          borderRadius: "18px",
          padding: "28px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: "12px", color: "#16324f" }}>
          CFSP Access
        </h1>

        <p style={{ marginBottom: "20px", color: "#516173" }}>
          Temporary direct access while login is being rebuilt.
        </p>

        <Link
          href="/admin"
          style={{
            display: "inline-block",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#16324f",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
            boxSizing: "border-box",
          }}
        >
          Enter Admin
        </Link>
      </div>
    </main>
  );
}

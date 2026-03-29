import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Conflict-Free SP",
  description: "Simulation Scheduling Platform",
};

const bg = "#f4f7fb";
const white = "#ffffff";
const navy = "#163a70";
const blue = "#1E5AA8";
const green = "#2E8B57";
const border = "#d9e2ef";
const slate = "#5f6f86";

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: navy,
        fontWeight: 700,
        fontSize: 14,
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: white,
      }}
    >
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: bg,
          color: navy,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textDecoration: "none",
              }}
            >
              <img
                src="/logo.png"
                alt="Conflict-Free SP"
                style={{ height: 42, width: "auto", display: "block" }}
              />
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: navy }}>
                  Conflict-Free SP
                </div>
                <div style={{ fontSize: 12, color: slate }}>
                  Simulation Scheduling Platform
                </div>
              </div>
            </Link>

            <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/events" label="Events" />
              <NavLink href="/upload-schedule" label="Upload Schedule" />
              <NavLink href="/sp-directory" label="SP Directory" />
              <NavLink href="/profile" label="Profile" />
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: 20 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
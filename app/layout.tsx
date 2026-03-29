import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Conflict-Free SP",
  description: "Simulation Scheduling Platform",
};

const colors = {
  bg: "#eef3f8",
  white: "#ffffff",
  navy: "#12376b",
  blue: "#1E5AA8",
  blueDark: "#163a70",
  green: "#2E8B57",
  greenDark: "#256b45",
  border: "#d4deeb",
  text: "#17345f",
  muted: "#61748e",
};

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
        color: colors.text,
        fontWeight: 800,
        fontSize: 15,
        padding: "14px 18px",
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 4px 12px rgba(18,55,107,0.05)",
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
          background: colors.bg,
          color: colors.text,
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
            borderBottom: `1px solid ${colors.border}`,
            boxShadow: "0 6px 18px rgba(18,55,107,0.05)",
          }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto",
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
           <Link
  href="/dashboard"
  style={{
    display: "flex",
    alignItems: "center",
    gap: 18,
    textDecoration: "none",
    minWidth: 0,
  }}
>
  <div
    style={{
      height: 64,
      width: 240,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <img
      src="/logo.png"
      alt="Conflict-Free SP"
      style={{
        maxHeight: "100%",
        maxWidth: "100%",
        width: "auto",
        height: "auto",
        display: "block",
        objectFit: "contain",
      }}
    />
  </div>

  <div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 900,
        color: "#12376b",
        lineHeight: 1.05,
      }}
    >
      Conflict-Free SP
    </div>
    <div
      style={{
        fontSize: 14,
        color: "#61748e",
        marginTop: 4,
        fontWeight: 600,
      }}
    >
      Simulation Scheduling Platform
    </div>
  </div>
</Link>

            <nav
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/events" label="Events" />
              <NavLink href="/upload-schedule" label="Upload Schedule" />
              <NavLink href="/sp-directory" label="SP Directory" />
              <NavLink href="/profile" label="Profile" />
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 1320, margin: "0 auto", padding: 24 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
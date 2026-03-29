"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const colors = {
  pageBg: "#f4f7fb",
  cardBg: "#ffffff",
  navy: "#163a70",
  blue: "#1E5AA8",
  green: "#2E8B57",
  red: "#C0392B",
  slate: "#5f6f86",
  border: "#d9e2ef",
  softBlue: "#edf4ff",
};

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        padding: "10px 14px",
        borderRadius: 12,
        fontWeight: 800,
        fontSize: 14,
        color: active ? "#ffffff" : colors.navy,
        background: active ? colors.blue : "#ffffff",
        border: `1px solid ${active ? colors.blue : colors.border}`,
        boxShadow: active ? "0 8px 18px rgba(30, 90, 168, 0.18)" : "none",
      }}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        color: colors.navy,
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
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "14px 22px",
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
              gap: 14,
              textDecoration: "none",
            }}
          >
            <img
              src="/cfsp-logo.png"
              alt="Conflict-Free SP"
              style={{
                height: 52,
                width: "auto",
                display: "block",
              }}
            />
          </Link>

          <nav
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <NavLink href="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
            <NavLink href="/events" label="Events" active={pathname === "/events"} />
            <NavLink
              href="/upload-schedule"
              label="Upload Schedule"
              active={pathname === "/upload-schedule"}
            />
            <NavLink
              href="/sp-directory"
              label="SP Directory"
              active={pathname === "/sp-directory"}
            />
            <NavLink href="/profile" label="Profile" active={pathname === "/profile"} />
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "24px 20px 48px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
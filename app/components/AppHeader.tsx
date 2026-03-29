"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const colors = {
  navy: "#163a70",
  blue: "#1E5AA8",
  green: "#2E8B57",
  bg: "#f4f7fb",
  card: "#ffffff",
  border: "#d9e2ef",
  text: "#5f6f86",
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
        borderRadius: 10,
        fontWeight: 800,
        fontSize: 14,
        color: active ? "#ffffff" : colors.navy,
        background: active ? colors.blue : "#ffffff",
        border: `1px solid ${active ? colors.blue : colors.border}`,
      }}
    >
      {label}
    </Link>
  );
}

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(244,247,251,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colors.border}`,
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
        </Link>

        <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <NavLink href="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
          <NavLink
            href="/events"
            label="Events"
            active={pathname === "/events" || pathname.startsWith("/events/")}
          />
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
  );
}
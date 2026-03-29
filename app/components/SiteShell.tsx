"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

type SiteShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const shellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f7fb",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1240px",
  margin: "0 auto",
  padding: "24px",
};

const headerStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d6deeb",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "18px",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "40px",
  color: "#16213e",
};

const subtitleStyle: React.CSSProperties = {
  margin: "8px 0 0 0",
  fontSize: "16px",
  color: "#5a667a",
  lineHeight: 1.5,
};

const navWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "18px",
};

const navLinkBaseStyle: React.CSSProperties = {
  textDecoration: "none",
  padding: "11px 16px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  background: "#ffffff",
  color: "#16213e",
  fontWeight: 700,
  fontSize: "14px",
};

const contentCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d6deeb",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const footerStyle: React.CSSProperties = {
  marginTop: "16px",
  color: "#6b7280",
  fontSize: "13px",
  textAlign: "center",
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/events/new", label: "New Event" },
  { href: "/sps", label: "SP Database" },
  { href: "/sim-op", label: "Sim Op" },
  { href: "/staff", label: "Staff" },
  { href: "/admin", label: "Admin" },
  { href: "/me", label: "Me" },
  { href: "/login", label: "Login" },
];

export default function SiteShell({
  title,
  subtitle,
  children,
}: SiteShellProps) {
  const pathname = usePathname();

  return (
    <main style={shellStyle}>
      <div style={containerStyle}>
        <section style={headerStyle}>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}

          <div style={navWrapStyle}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/events" && pathname.startsWith("/events/") && pathname !== "/events/new");

              const style: React.CSSProperties = {
                ...navLinkBaseStyle,
                background: isActive ? "#1d4ed8" : "#ffffff",
                color: isActive ? "#ffffff" : "#16213e",
                border: isActive ? "1px solid #1d4ed8" : navLinkBaseStyle.border,
              };

              return (
                <Link key={item.href} href={item.href} style={style}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section style={contentCardStyle}>{children}</section>

        <div style={footerStyle}>CFSP Ops Board • local build stabilization pass</div>
      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/intake", label: "Session Intake" },
  { href: "/events", label: "Events" },
  { href: "/sp-directory", label: "SP Directory" },
  { href: "/blueprints", label: "Blueprint Builder" },
  { href: "/sim-flow", label: "Sim Flow Calculator" },
  { href: "/emails", label: "Email Builder" },
  { href: "/upload", label: "Upload" },
  { href: "/me", label: "My Profile" },
];

type SiteShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #f4fbff 0%, #edf5fb 28%, #eef8f4 65%, #f7fbff 100%)",
  color: "#173d70",
};

const topBarStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  backdropFilter: "blur(12px)",
  background: "rgba(255,255,255,0.88)",
  borderBottom: "1px solid rgba(23,61,112,0.10)",
};

const topBarInnerStyle: CSSProperties = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const brandWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  textDecoration: "none",
};

const logoStyle: CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "14px",
  background:
    "linear-gradient(135deg, #0c4a7c 0%, #1367a8 35%, #1d8a6a 70%, #9ccc3c 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: "20px",
  boxShadow: "0 12px 28px rgba(12,74,124,0.24)",
};

const brandTextWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

const brandTitleStyle: CSSProperties = {
  fontSize: "26px",
  fontWeight: 800,
  color: "#173d70",
  lineHeight: 1.1,
};

const brandSubStyle: CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#4a6b8d",
  fontWeight: 700,
};

const navStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const navLinkBaseStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "14px",
  transition: "all 0.15s ease",
  border: "1px solid rgba(23,61,112,0.10)",
};

const mainWrapStyle: CSSProperties = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "22px 20px 40px",
};

const heroStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(12,74,124,0.98) 0%, rgba(20,119,170,0.93) 35%, rgba(39,147,112,0.88) 68%, rgba(150,204,60,0.84) 100%)",
  borderRadius: "30px",
  color: "#ffffff",
  padding: "34px 30px",
  boxShadow: "0 24px 50px rgba(12,74,124,0.22)",
  marginBottom: "22px",
  overflow: "hidden",
};

const heroTitleStyle: CSSProperties = {
  fontSize: "34px",
  fontWeight: 800,
  lineHeight: 1.08,
  marginBottom: "10px",
};

const heroSubtitleStyle: CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.6,
  maxWidth: "920px",
  color: "rgba(255,255,255,0.94)",
};

const contentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "18px",
};

const footerStyle: CSSProperties = {
  marginTop: "28px",
  padding: "18px 4px 8px",
  color: "#557392",
  fontSize: "13px",
};

function getNavLinkStyle(active: boolean): CSSProperties {
  return {
    ...navLinkBaseStyle,
    color: active ? "#ffffff" : "#173d70",
    background: active
      ? "linear-gradient(135deg, #173d70 0%, #1d8a6a 100%)"
      : "rgba(255,255,255,0.88)",
    boxShadow: active ? "0 10px 24px rgba(23,61,112,0.22)" : "none",
  };
}

export default function SiteShell({
  title,
  subtitle,
  children,
}: SiteShellProps) {
  const pathname = usePathname();

  return (
    <div style={pageStyle}>
      <header style={topBarStyle}>
        <div style={topBarInnerStyle}>
          <Link href="/" style={brandWrapStyle}>
            <div style={logoStyle}>CF</div>
            <div style={brandTextWrapStyle}>
              <div style={brandTitleStyle}>Conflict-Free SP</div>
              <div style={brandSubStyle}>Simulation Scheduling Platform</div>
            </div>
          </Link>

          <nav style={navStyle}>
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} style={getNavLinkStyle(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main style={mainWrapStyle}>
        <section style={heroStyle}>
          <div style={heroTitleStyle}>{title}</div>
          {subtitle ? <div style={heroSubtitleStyle}>{subtitle}</div> : null}
        </section>

        <section style={contentStyle}>{children}</section>

        <footer style={footerStyle}>
          Conflict-Free SP • built for simulation operations, staffing, scheduling, intake,
          blueprints, sim flow, and automated communication.
        </footer>
      </main>
    </div>
  );
}
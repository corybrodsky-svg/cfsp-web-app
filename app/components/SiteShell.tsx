"use client";

import Link from "next/link";

type SiteShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

const outerWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#dfe8ef",
};

const innerWrap: React.CSSProperties = {
  maxWidth: "1360px",
  margin: "0 auto",
  padding: "18px 16px 28px",
};

const topCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9e3ec",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const headerWrap: React.CSSProperties = {
  padding: "18px 22px 14px",
  borderBottom: "1px solid #dbe4ee",
  background: "#f8fbfd",
};

const brandRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

const logoBox: React.CSSProperties = {
  width: "54px",
  height: "54px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #1f4f82 0%, #2d8aa6 55%, #95c85b 100%)",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: "18px",
  letterSpacing: "0.04em",
  flexShrink: 0,
};

const brandTitle: React.CSSProperties = {
  margin: 0,
  color: "#1e3a5f",
  fontSize: "26px",
  lineHeight: 1.05,
  fontWeight: 800,
};

const brandSub: React.CSSProperties = {
  margin: "4px 0 0 0",
  color: "#56708d",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const navRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  padding: "14px 22px 16px",
  borderBottom: "1px solid #dbe4ee",
  background: "#ffffff",
};

const navLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  border: "1px solid #d6dee8",
  borderRadius: "999px",
  padding: "11px 16px",
  color: "#1f3f67",
  fontWeight: 700,
  fontSize: "15px",
  background: "#f8fafc",
};

const pageHero: React.CSSProperties = {
  margin: "22px",
  borderRadius: "28px",
  padding: "26px 30px",
  background: "linear-gradient(135deg, #1f4f82 0%, #2d8aa6 55%, #95c85b 100%)",
  color: "#ffffff",
};

const contentWrap: React.CSSProperties = {
  padding: "0 22px 22px",
};

const navItems = [
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

export default function SiteShell({ children, title, subtitle }: SiteShellProps) {
  return (
    <div style={outerWrap}>
      <div style={innerWrap}>
        <div style={topCard}>
          <div style={headerWrap}>
            <div style={brandRow}>
              <div style={logoBox}>CF</div>
              <div>
                <h1 style={brandTitle}>Conflict-Free SP</h1>
                <p style={brandSub}>Simulation Scheduling Platform</p>
              </div>
            </div>
          </div>

          <div style={navRow}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} style={navLinkStyle}>
                {item.label}
              </Link>
            ))}
          </div>

          {title ? (
            <div style={pageHero}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "46px",
                  lineHeight: 1.05,
                  fontWeight: 800,
                }}
              >
                {title}
              </h2>
              {subtitle ? (
                <p
                  style={{
                    margin: "12px 0 0 0",
                    fontSize: "20px",
                    lineHeight: 1.35,
                    opacity: 0.97,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          ) : null}

          <div style={contentWrap}>{children}</div>
        </div>
      </div>
    </div>
  );
}
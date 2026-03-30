"use client";

import Link from "next/link";

const colors = {
  white: "#ffffff",
  navy: "#12376b",
  blue: "#1E5AA8",
  blueDark: "#163a70",
  green: "#2E8B57",
  greenDark: "#256b45",
  border: "#d4deeb",
  muted: "#61748e",
};

function HomeCard({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: 24,
        padding: 24,
        color: colors.navy,
        boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
        display: "block",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 16, color: colors.muted, lineHeight: 1.6 }}>{text}</div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 34,
          border: `1px solid ${colors.border}`,
          minHeight: 300,
          background: `linear-gradient(135deg, ${colors.blueDark} 0%, ${colors.blue} 48%, ${colors.greenDark} 100%)`,
          boxShadow: "0 18px 40px rgba(18,55,107,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 30%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12), transparent 28%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 24,
            alignItems: "center",
            padding: 34,
            minHeight: 300,
          }}
        >
          <div>
            <img
              src="/cfsp-hero.png"
              alt="Conflict-Free SP"
              style={{
                width: "100%",
                maxWidth: 620,
                height: "auto",
                display: "block",
                objectFit: "contain",
                filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.16))",
              }}
            />

            <div
              style={{
                marginTop: 20,
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.45,
                maxWidth: 760,
              }}
            >
              Clean control of scheduling, staffing, assignments, and event prep in one place.
            </div>
          </div>

          <div
            style={{
              justifySelf: "end",
              width: "100%",
              maxWidth: 420,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: 28,
              padding: 24,
              backdropFilter: "blur(8px)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", marginBottom: 12 }}>
              Quick Actions
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <Link href="/dashboard" style={heroBlueBtn}>
                Dashboard
              </Link>
              <Link href="/events" style={heroBlueBtn}>
                Open Events
              </Link>
              <Link href="/upload-schedule" style={heroGreenBtn}>
                Upload Schedule
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <HomeCard
          href="/login"
          title="Login"
          text="Sign in as SP, Sim Op, or Admin and move into the right part of the app."
        />
        <HomeCard
          href="/dashboard"
          title="Admin Dashboard"
          text="Launch point for uploads, events, staffing, and overall control."
        />
        <HomeCard
          href="/events"
          title="Events"
          text="Review imported events, assignments, and session details in a cleaner way."
        />
        <HomeCard
          href="/sp-directory"
          title="SP Directory"
          text="Browse SPs, compare pools, and prepare assignments."
        />
        <HomeCard
          href="/profile"
          title="My Profile"
          text="Personal dashboard and account area based on who is signed in."
        />
        <HomeCard
          href="/upload-schedule"
          title="Upload Schedule"
          text="Import your Excel schedule and turn it into organized events."
        />
      </section>
    </div>
  );
}

const heroBlueBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#1E5AA8",
  color: "#ffffff",
  padding: "15px 18px",
  borderRadius: 16,
  fontWeight: 900,
  fontSize: 16,
  textAlign: "center",
  boxShadow: "0 12px 24px rgba(30,90,168,0.24)",
};

const heroGreenBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#2E8B57",
  color: "#ffffff",
  padding: "15px 18px",
  borderRadius: 16,
  fontWeight: 900,
  fontSize: 16,
  textAlign: "center",
  boxShadow: "0 12px 24px rgba(46,139,87,0.24)",
};
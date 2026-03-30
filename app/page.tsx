import Link from "next/link";
import type { CSSProperties } from "react";
import SiteShell from "./components/SiteShell";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "18px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(23,61,112,0.10)",
  borderRadius: "24px",
  padding: "22px",
  textDecoration: "none",
  color: "#173d70",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  minHeight: "170px",
};

const titleStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 800,
};

const subtitleStyle: CSSProperties = {
  color: "#54708c",
  lineHeight: 1.6,
  fontSize: "15px",
};

const cardTitleStyle: CSSProperties = {
  fontSize: "24px",
  fontWeight: 800,
};

const cardTextStyle: CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#5b7593",
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  width: "fit-content",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(23,61,112,0.08)",
  color: "#173d70",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const cards = [
  {
    href: "/login",
    title: "Login",
    text: "Sign in as SP, Sim Op, or Admin and move into the right part of the app.",
    badge: "Access",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    text: "See event priorities, staffing shortages, next actions, and quick system access.",
    badge: "Control",
  },
  {
    href: "/intake",
    title: "Session Intake",
    text: "Create an event using the same operational thinking you built in Excel.",
    badge: "Core Tool",
  },
  {
    href: "/events",
    title: "Events",
    text: "Review active events, statuses, dates, staffing needs, and detail pages.",
    badge: "Operations",
  },
  {
    href: "/sp-directory",
    title: "SP Directory",
    text: "Browse standardized patients, track pool affiliation, and prep assignments.",
    badge: "Roster",
  },
  {
    href: "/blueprints",
    title: "Blueprint Builder",
    text: "Turn event structure into reusable simulation designs and segment layouts.",
    badge: "Planning",
  },
  {
    href: "/sim-flow",
    title: "Sim Flow Calculator",
    text: "Calculate rounds, timing, transitions, room usage, and staffing pressure.",
    badge: "Engine",
  },
  {
    href: "/emails",
    title: "Email Builder",
    text: "Generate training, prep, assignment, and logistics drafts from event data.",
    badge: "Automation",
  },
  {
    href: "/upload",
    title: "Upload Schedule",
    text: "Import schedules and session materials so CFSP can turn them into operations-ready events.",
    badge: "Import",
  },
  {
    href: "/me",
    title: "My Profile",
    text: "View your role, profile, assignments, and future self-service account actions.",
    badge: "Account",
  },
];

export default function HomePage() {
  return (
    <SiteShell
      title="Clean control of scheduling, staffing, assignments, automation, and sim design."
      subtitle="This is the working CFSP launch hub. Every card below is a real route so the app behaves like a real platform now, not a dead mockup."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={badgeStyle}>CFSP Launch Pad</div>
        <div style={titleStyle}>Build from here. Run from here.</div>
        <div style={subtitleStyle}>
          Intake feeds blueprints. Blueprints feed sim flow. Sim flow feeds staffing and
          email automation. That backbone starts now.
        </div>
      </div>

      <div style={gridStyle}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} style={cardStyle}>
            <div style={badgeStyle}>{card.badge}</div>
            <div style={cardTitleStyle}>{card.title}</div>
            <div style={cardTextStyle}>{card.text}</div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
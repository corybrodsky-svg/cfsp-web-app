"use client";

import Link from "next/link";
import { useMemo } from "react";

type EventItem = {
  id: string;
  title: string;
  dateText: string;
  status: "Needs SPs" | "Scheduled" | "In Progress" | "Completed" | "Canceled";
  rooms: number;
  spNeeded: number;
  spAssigned: number;
  simOpLead: string;
  location: string;
};

const eventsSeed: EventItem[] = [
  {
    id: "n651-virtual",
    title: "N651 Virtual",
    dateText: "Apr 15–Apr 16",
    status: "Needs SPs",
    rooms: 4,
    spNeeded: 6,
    spAssigned: 2,
    simOpLead: "Cory",
    location: "Virtual",
  },
  {
    id: "pa-spl-ipe",
    title: "PA/SPL IPE",
    dateText: "Apr 21",
    status: "Scheduled",
    rooms: 6,
    spNeeded: 8,
    spAssigned: 8,
    simOpLead: "Kate",
    location: "Elkins Park",
  },
  {
    id: "dysphagia-sim",
    title: "Dysphagia Simulation",
    dateText: "Apr 15 & Apr 21",
    status: "In Progress",
    rooms: 8,
    spNeeded: 10,
    spAssigned: 7,
    simOpLead: "Cory",
    location: "CNHP",
  },
];

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
  red: "#c84a3a",
  redSoft: "#fbefec",
  greenSoft: "#edf8f1",
  blueSoft: "#edf4ff",
};

function SummaryCard({
  label,
  value,
  accent,
  subtext,
}: {
  label: string;
  value: number | string;
  accent: string;
  subtext: string;
}) {
  return (
    <div
      style={{
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: accent,
        }}
      />
      <div style={{ fontSize: 15, fontWeight: 800, color: colors.muted, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 48, fontWeight: 900, color: colors.navy, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: colors.muted, marginTop: 10 }}>{subtext}</div>
    </div>
  );
}

function ActionCard({
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
        padding: 26,
        color: colors.navy,
        boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
        display: "block",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>{title}</div>
      <div style={{ fontSize: 16, color: colors.muted, lineHeight: 1.6 }}>{text}</div>
    </Link>
  );
}

export default function DashboardPage() {
  const summary = useMemo(() => {
    const totalEvents = eventsSeed.length;
    const totalAssigned = eventsSeed.reduce((sum, event) => sum + event.spAssigned, 0);
    const needSPs = eventsSeed.filter((event) => event.spAssigned < event.spNeeded).length;
    return { totalEvents, totalAssigned, needSPs };
  }, []);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 34,
          border: `1px solid ${colors.border}`,
          minHeight: 320,
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
            minHeight: 320,
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
                maxWidth: 740,
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
              <Link href="/upload-schedule" style={heroGreenBtn}>
                Upload Schedule
              </Link>
              <Link href="/events" style={heroBlueBtn}>
                Open Events
              </Link>
              <Link href="/sp-directory" style={heroGhostBtn}>
                SP Directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        <SummaryCard
          label="Total Events"
          value={summary.totalEvents}
          accent={colors.blue}
          subtext="Visible in the current dashboard"
        />
        <SummaryCard
          label="SPs Assigned"
          value={summary.totalAssigned}
          accent={colors.green}
          subtext="Across visible events"
        />
        <SummaryCard
          label="Need SPs"
          value={summary.needSPs}
          accent={colors.red}
          subtext="Events below needed coverage"
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <ActionCard
          href="/events"
          title="Events"
          text="View imported events, expand details, and manage schedules cleanly."
        />
        <ActionCard
          href="/upload-schedule"
          title="Upload Schedule"
          text="Import your Excel semester schedule and auto-generate events."
        />
        <ActionCard
          href="/sp-directory"
          title="SP Directory"
          text="Browse your SPs and prepare for assignment workflows."
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

const heroGhostBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "rgba(255,255,255,0.14)",
  color: "#ffffff",
  padding: "15px 18px",
  borderRadius: 16,
  fontWeight: 900,
  fontSize: 16,
  textAlign: "center",
  border: "1px solid rgba(255,255,255,0.22)",
};
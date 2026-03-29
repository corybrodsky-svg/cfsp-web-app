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

const cardBg = "#ffffff";
const navy = "#163a70";
const blue = "#1E5AA8";
const green = "#2E8B57";
const red = "#C0392B";
const border = "#d9e2ef";
const slate = "#5f6f86";

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
        background: cardBg,
        border: `1px solid ${border}`,
        borderLeft: `6px solid ${accent}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 8px 22px rgba(19, 45, 89, 0.06)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: slate }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: navy, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 13, color: slate, marginTop: 6 }}>{subtext}</div>
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
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: 18,
        padding: 20,
        color: navy,
        boxShadow: "0 8px 22px rgba(19, 45, 89, 0.06)",
        display: "block",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: slate, lineHeight: 1.5 }}>{text}</div>
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
    <div style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          background: "#ffffff",
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 34, fontWeight: 900, color: navy }}>Dashboard</div>
          <div style={{ fontSize: 15, color: slate, marginTop: 8 }}>
            Clean overview of events, assignments, and schedule health.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/upload-schedule"
            style={{
              textDecoration: "none",
              background: green,
              color: "#fff",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 800,
            }}
          >
            Upload Schedule
          </Link>

          <Link
            href="/events"
            style={{
              textDecoration: "none",
              background: blue,
              color: "#fff",
              borderRadius: 12,
              padding: "12px 18px",
              fontWeight: 800,
            }}
          >
            Open Events
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        <SummaryCard
          label="Total Events"
          value={summary.totalEvents}
          accent={blue}
          subtext="Visible in the current dashboard"
        />
        <SummaryCard
          label="SPs Assigned"
          value={summary.totalAssigned}
          accent={green}
          subtext="Across visible events"
        />
        <SummaryCard
          label="Need SPs"
          value={summary.needSPs}
          accent={red}
          subtext="Events below needed coverage"
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}
      >
        <ActionCard
          href="/events"
          title="Events"
          text="View imported events, expand details, and manage schedules."
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
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  {
    id: "neuro-checkoff",
    title: "Neuro Checkoff",
    dateText: "Apr 28",
    status: "Completed",
    rooms: 3,
    spNeeded: 3,
    spAssigned: 3,
    simOpLead: "Jamiel",
    location: "Philadelphia",
  },
];

const colors = {
  pageBg: "#f4f7fb",
  cardBg: "#ffffff",
  navy: "#163a70",
  blue: "#1E5AA8",
  green: "#2E8B57",
  red: "#C0392B",
  amber: "#D68910",
  slate: "#5f6f86",
  border: "#d9e2ef",
  softBlue: "#edf4ff",
  softGreen: "#edf8f1",
  softRed: "#fdf0ee",
  softGray: "#eef2f7",
};

function getStatusColors(status: EventItem["status"]) {
  switch (status) {
    case "Needs SPs":
      return { bg: colors.softRed, text: colors.red, borderColor: "#f2c8c2" };
    case "Scheduled":
      return { bg: colors.softGreen, text: colors.green, borderColor: "#bfe0cb" };
    case "In Progress":
      return { bg: "#fff7e8", text: colors.amber, borderColor: "#f1dbab" };
    case "Completed":
      return { bg: colors.softBlue, text: colors.blue, borderColor: "#c8daf5" };
    case "Canceled":
      return { bg: colors.softGray, text: colors.slate, borderColor: "#d7deea" };
    default:
      return { bg: colors.softGray, text: colors.slate, borderColor: colors.border };
  }
}

function summaryFromEvents(events: EventItem[]) {
  const totalEvents = events.length;
  const totalAssigned = events.reduce((sum, event) => sum + event.spAssigned, 0);
  const totalConflicts = events.filter(
    (event) => event.spAssigned < event.spNeeded && event.status !== "Canceled"
  ).length;

  return { totalEvents, totalAssigned, totalConflicts };
}

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
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderLeft: `6px solid ${accent}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 8px 22px rgba(19, 45, 89, 0.06)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: colors.slate, letterSpacing: 0.3 }}>
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: colors.navy, marginTop: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: colors.slate, marginTop: 6 }}>{subtext}</div>
    </div>
  );
}

function ActionButton({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 42,
        padding: "0 16px",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 14,
        background: primary ? colors.blue : "#ffffff",
        color: primary ? "#ffffff" : colors.navy,
        border: primary ? `1px solid ${colors.blue}` : `1px solid ${colors.border}`,
        boxShadow: primary ? "0 10px 20px rgba(30, 90, 168, 0.18)" : "none",
      }}
    >
      {label}
    </Link>
  );
}

export default function DashboardPage() {
  const [expandedIds, setExpandedIds] = useState<string[]>(["n651-virtual"]);
  const [search, setSearch] = useState("");

  const events = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return eventsSeed;

    return eventsSeed.filter((event) => {
      const blob =
        `${event.title} ${event.dateText} ${event.status} ${event.simOpLead} ${event.location}`.toLowerCase();
      return blob.includes(query);
    });
  }, [search]);

  const summary = useMemo(() => summaryFromEvents(events), [events]);

  function toggleExpand(id: string) {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        color: colors.navy,
      }}
    >
      <div
        style={{
          marginBottom: 24,
          borderRadius: 26,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          background: colors.cardBg,
          boxShadow: "0 12px 28px rgba(19, 45, 89, 0.08)",
        }}
      >
        <div
          style={{
            position: "relative",
            minHeight: 260,
            backgroundImage: "url('/cfsp-hero-logo.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(10,25,47,0.08) 0%, rgba(10,25,47,0.4) 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "28px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.88)",
                color: colors.navy,
                fontWeight: 800,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              Conflict-Free SP
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: -0.5,
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                maxWidth: 700,
                color: "rgba(255,255,255,0.94)",
                fontSize: 16,
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              Clean overview of events, assignments, and scheduling risk using your new CFSP brand.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          label="Total Events"
          value={summary.totalEvents}
          accent={colors.blue}
          subtext="Visible in current dashboard view"
        />
        <SummaryCard
          label="SPs Assigned"
          value={summary.totalAssigned}
          accent={colors.green}
          subtext="Across all visible events"
        />
        <SummaryCard
          label="Conflicts Detected"
          value={summary.totalConflicts}
          accent={colors.red}
          subtext="Events needing more SP coverage"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 0.85fr)",
          gap: 20,
        }}
      >
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 22,
            boxShadow: "0 12px 28px rgba(19, 45, 89, 0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: colors.navy }}>Upcoming Events</div>
              <div style={{ fontSize: 13, color: colors.slate, marginTop: 4 }}>
                Click any event to expand details without leaving the page.
              </div>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              style={{
                width: 240,
                maxWidth: "100%",
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: "11px 14px",
                fontSize: 14,
                outline: "none",
                color: colors.navy,
                background: "#ffffff",
              }}
            />
          </div>

          <div style={{ padding: 18 }}>
            {events.length === 0 ? (
              <div
                style={{
                  border: `1px dashed ${colors.border}`,
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "center",
                  color: colors.slate,
                  fontSize: 14,
                }}
              >
                No events match your search.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {events.map((event) => {
                  const isExpanded = expandedIds.includes(event.id);
                  const statusStyle = getStatusColors(event.status);
                  const coveragePct =
                    event.spNeeded > 0
                      ? Math.max(0, Math.min(100, Math.round((event.spAssigned / event.spNeeded) * 100)))
                      : 0;

                  return (
                    <div
                      key={event.id}
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: 18,
                        overflow: "hidden",
                        background: "#ffffff",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(event.id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background: "#ffffff",
                          padding: 18,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 14,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "wrap",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  fontWeight: 900,
                                  color: colors.navy,
                                }}
                              >
                                {isExpanded ? "▼" : "▶"} {event.title}
                              </span>

                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "5px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  background: statusStyle.bg,
                                  color: statusStyle.text,
                                  border: `1px solid ${statusStyle.borderColor}`,
                                }}
                              >
                                {event.status}
                              </span>
                            </div>

                            <div style={{ fontSize: 14, color: colors.slate }}>
                              {event.dateText} • {event.location} • Lead: {event.simOpLead}
                            </div>
                          </div>

                          <div style={{ minWidth: 180 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 12,
                                color: colors.slate,
                                fontWeight: 700,
                                marginBottom: 6,
                              }}
                            >
                              <span>Coverage</span>
                              <span>
                                {event.spAssigned}/{event.spNeeded}
                              </span>
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: 10,
                                borderRadius: 999,
                                background: "#eaf0f7",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${coveragePct}%`,
                                  height: "100%",
                                  background:
                                    coveragePct >= 100
                                      ? colors.green
                                      : coveragePct >= 60
                                      ? colors.blue
                                      : colors.red,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 18px 18px 18px",
                            borderTop: `1px solid ${colors.border}`,
                            background: "#fbfcfe",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                              gap: 12,
                              marginTop: 16,
                            }}
                          >
                            <div
                              style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: 14,
                                background: "#ffffff",
                              }}
                            >
                              <div style={{ fontSize: 12, color: colors.slate, fontWeight: 700 }}>Rooms</div>
                              <div style={{ fontSize: 22, fontWeight: 900, color: colors.navy, marginTop: 4 }}>
                                {event.rooms}
                              </div>
                            </div>

                            <div
                              style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: 14,
                                background: "#ffffff",
                              }}
                            >
                              <div style={{ fontSize: 12, color: colors.slate, fontWeight: 700 }}>SP Needed</div>
                              <div style={{ fontSize: 22, fontWeight: 900, color: colors.navy, marginTop: 4 }}>
                                {event.spNeeded}
                              </div>
                            </div>

                            <div
                              style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: 14,
                                background: "#ffffff",
                              }}
                            >
                              <div style={{ fontSize: 12, color: colors.slate, fontWeight: 700 }}>Assigned</div>
                              <div style={{ fontSize: 22, fontWeight: 900, color: colors.navy, marginTop: 4 }}>
                                {event.spAssigned}
                              </div>
                            </div>

                            <div
                              style={{
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: 14,
                                background: "#ffffff",
                              }}
                            >
                              <div style={{ fontSize: 12, color: colors.slate, fontWeight: 700 }}>Lead</div>
                              <div style={{ fontSize: 22, fontWeight: 900, color: colors.navy, marginTop: 4 }}>
                                {event.simOpLead}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                              marginTop: 16,
                            }}
                          >
                            <ActionButton href={`/events/${event.id}`} label="View Event" primary />
                            <ActionButton href={`/events/${event.id}/assign`} label="Assign SPs" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 12px 28px rgba(19, 45, 89, 0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <img
                src="/cfsp-logo.png"
                alt="Conflict-Free SP"
                style={{ height: 42, width: "auto", display: "block" }}
              />
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: colors.navy }}>Quick Actions</div>
            <div style={{ fontSize: 13, color: colors.slate, marginTop: 4 }}>
              Fast paths for the work you do most.
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <ActionButton href="/events/new" label="Create New Event" primary />
              <ActionButton href="/events" label="Open All Events" />
              <ActionButton href="/sp-directory" label="Open SP Directory" />
              <ActionButton href="/upload-schedule" label="Upload Schedule" />
            </div>
          </div>

          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              padding: 20,
              boxShadow: "0 12px 28px rgba(19, 45, 89, 0.07)",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: colors.navy }}>Attention Needed</div>
            <div style={{ fontSize: 13, color: colors.slate, marginTop: 4 }}>
              Events below full SP coverage.
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {eventsSeed
                .filter((event) => event.spAssigned < event.spNeeded && event.status !== "Canceled")
                .map((event) => (
                  <div
                    key={`attention-${event.id}`}
                    style={{
                      border: `1px solid #efd0cb`,
                      background: colors.softRed,
                      borderRadius: 16,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 800, color: colors.navy }}>{event.title}</div>
                    <div style={{ fontSize: 13, color: colors.slate, marginTop: 4 }}>
                      {event.dateText} • {event.spAssigned}/{event.spNeeded} assigned
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
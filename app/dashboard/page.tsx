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

const pageBg = "#F4F7F8";
const panelBg = "#FFFFFF";
const sidebarBg = "#F8FBFB";
const ink = "#1F3A5F";
const inkSoft = "#4F6277";
const teal = "#2F7D6B";
const tealDark = "#245F52";
const line = "#D7E0E5";
const softTeal = "#EDF6F3";
const softSlate = "#EEF3F6";
const softAmber = "#F8F1E7";
const amber = "#A86B1F";
const softRed = "#F9ECEC";
const danger = "#C94B4B";
const success = "#2F7D6B";

function getStatusColors(status: EventItem["status"]) {
  switch (status) {
    case "Needs SPs":
      return { bg: softRed, text: danger, borderColor: "#E9C6C6" };
    case "Scheduled":
      return { bg: softTeal, text: tealDark, borderColor: "#C6E0D9" };
    case "In Progress":
      return { bg: softAmber, text: amber, borderColor: "#E7D1B0" };
    case "Completed":
      return { bg: softSlate, text: ink, borderColor: "#D5E0E8" };
    case "Canceled":
      return { bg: "#F2F4F6", text: inkSoft, borderColor: "#DCE3E8" };
    default:
      return { bg: softSlate, text: inkSoft, borderColor: line };
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

function CFSPLogo({
  compact = false,
  showTagline = false,
}: {
  compact?: boolean;
  showTagline?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 14 }}>
      <div
        style={{
          width: compact ? 40 : 52,
          height: compact ? 40 : 52,
          borderRadius: compact ? 12 : 16,
          background: `linear-gradient(135deg, ${ink} 0%, ${teal} 100%)`,
          display: "grid",
          placeItems: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontSize: compact ? 16 : 20,
          boxShadow: "0 10px 24px rgba(31, 58, 95, 0.14)",
          border: "1px solid rgba(255,255,255,0.35)",
          flexShrink: 0,
        }}
      >
        CF
      </div>

      <div>
        <div
          style={{
            fontSize: compact ? 18 : 22,
            fontWeight: 900,
            color: ink,
            lineHeight: 1.05,
            letterSpacing: -0.3,
          }}
        >
          Conflict-Free SP
        </div>
        {showTagline ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: 700,
              color: inkSoft,
              letterSpacing: 0.2,
            }}
          >
            Precision scheduling for simulation programs
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "12px 14px",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 15,
        color: active ? "#ffffff" : ink,
        background: active ? teal : "transparent",
        border: active ? `1px solid ${teal}` : "1px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </Link>
  );
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
        background: panelBg,
        border: `1px solid ${line}`,
        borderLeft: `6px solid ${accent}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 8px 22px rgba(24, 45, 72, 0.05)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: inkSoft, letterSpacing: 0.3 }}>
        {label}
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, color: ink, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 13, color: inkSoft, marginTop: 6 }}>{subtext}</div>
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
        background: primary ? teal : "#ffffff",
        color: primary ? "#ffffff" : ink,
        border: primary ? `1px solid ${teal}` : `1px solid ${line}`,
        boxShadow: primary ? "0 10px 20px rgba(47, 125, 107, 0.16)" : "none",
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
    <main
      style={{
        minHeight: "100vh",
        background: pageBg,
        color: ink,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            background: sidebarBg,
            borderRight: `1px solid ${line}`,
            padding: 22,
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <div
            style={{
              marginBottom: 28,
              paddingBottom: 18,
              borderBottom: `1px solid ${line}`,
            }}
          >
            <CFSPLogo compact showTagline />
          </div>

          <nav style={{ display: "grid", gap: 8 }}>
            <SidebarLink href="/dashboard" label="Dashboard" active />
            <SidebarLink href="/events" label="Events" />
            <SidebarLink href="/sp-directory" label="SP Directory" />
            <SidebarLink href="/assignments" label="Assignments" />
            <SidebarLink href="/payroll" label="Payroll" />
            <SidebarLink href="/admin" label="Admin" />
          </nav>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 16,
              background: softTeal,
              border: `1px solid #D5E7E1`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: teal,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                CF
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: tealDark }}>Quick Status</div>
            </div>

            <div style={{ fontSize: 13, color: inkSoft, lineHeight: 1.5 }}>
              You have{" "}
              <span style={{ fontWeight: 900, color: danger }}>{summary.totalConflicts}</span> event
              {summary.totalConflicts === 1 ? "" : "s"} that still need SP attention.
            </div>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              background: "rgba(244, 247, 248, 0.92)",
              backdropFilter: "blur(10px)",
              borderBottom: `1px solid ${line}`,
            }}
          >
            <div
              style={{
                maxWidth: 1280,
                margin: "0 auto",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <CFSPLogo />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: ink }}>Dashboard</div>
                  <div style={{ fontSize: 14, color: inkSoft, marginTop: 4 }}>
                    Clean overview of events, assignments, and conflict risk.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <ActionButton href="/events/new" label="+ Create Event" primary />
                <ActionButton href="/login" label="Logout" />
              </div>
            </div>
          </header>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
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
                accent={ink}
                subtext="Visible in current dashboard view"
              />
              <SummaryCard
                label="SPs Assigned"
                value={summary.totalAssigned}
                accent={teal}
                subtext="Across all visible events"
              />
              <SummaryCard
                label="Conflicts Detected"
                value={summary.totalConflicts}
                accent={danger}
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
                  background: panelBg,
                  border: `1px solid ${line}`,
                  borderRadius: 22,
                  boxShadow: "0 12px 28px rgba(19, 45, 89, 0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: 20,
                    borderBottom: `1px solid ${line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: ink }}>Upcoming Events</div>
                    <div style={{ fontSize: 13, color: inkSoft, marginTop: 4 }}>
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
                      border: `1px solid ${line}`,
                      borderRadius: 12,
                      padding: "11px 14px",
                      fontSize: 14,
                      outline: "none",
                      color: ink,
                      background: "#ffffff",
                    }}
                  />
                </div>

                <div style={{ padding: 18 }}>
                  {events.length === 0 ? (
                    <div
                      style={{
                        border: `1px dashed ${line}`,
                        borderRadius: 16,
                        padding: 24,
                        textAlign: "center",
                        color: inkSoft,
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
                              border: `1px solid ${line}`,
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
                                        color: ink,
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

                                  <div style={{ fontSize: 14, color: inkSoft }}>
                                    {event.dateText} • {event.location} • Lead: {event.simOpLead}
                                  </div>
                                </div>

                                <div style={{ minWidth: 180 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: 12,
                                      color: inkSoft,
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
                                      background: "#E7EDF1",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${coveragePct}%`,
                                        height: "100%",
                                        background:
                                          coveragePct >= 100
                                            ? success
                                            : coveragePct >= 60
                                            ? teal
                                            : danger,
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
                                  borderTop: `1px solid ${line}`,
                                  background: "#FBFDFC",
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
                                      border: `1px solid ${line}`,
                                      borderRadius: 14,
                                      padding: 14,
                                      background: "#ffffff",
                                    }}
                                  >
                                    <div style={{ fontSize: 12, color: inkSoft, fontWeight: 700 }}>Rooms</div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: ink, marginTop: 4 }}>
                                      {event.rooms}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      border: `1px solid ${line}`,
                                      borderRadius: 14,
                                      padding: 14,
                                      background: "#ffffff",
                                    }}
                                  >
                                    <div style={{ fontSize: 12, color: inkSoft, fontWeight: 700 }}>SP Needed</div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: ink, marginTop: 4 }}>
                                      {event.spNeeded}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      border: `1px solid ${line}`,
                                      borderRadius: 14,
                                      padding: 14,
                                      background: "#ffffff",
                                    }}
                                  >
                                    <div style={{ fontSize: 12, color: inkSoft, fontWeight: 700 }}>Assigned</div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: ink, marginTop: 4 }}>
                                      {event.spAssigned}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      border: `1px solid ${line}`,
                                      borderRadius: 14,
                                      padding: 14,
                                      background: "#ffffff",
                                    }}
                                  >
                                    <div style={{ fontSize: 12, color: inkSoft, fontWeight: 700 }}>Lead</div>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: ink, marginTop: 4 }}>
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
                    background: panelBg,
                    border: `1px solid ${line}`,
                    borderRadius: 22,
                    padding: 20,
                    boxShadow: "0 12px 28px rgba(19, 45, 89, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <CFSPLogo compact />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: ink }}>Quick Actions</div>
                  <div style={{ fontSize: 13, color: inkSoft, marginTop: 4 }}>
                    Fast paths for the work you do most.
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                    <ActionButton href="/events/new" label="Create New Event" primary />
                    <ActionButton href="/events" label="Open All Events" />
                    <ActionButton href="/sp-directory" label="Open SP Directory" />
                    <ActionButton href="/payroll" label="Go to Payroll" />
                  </div>
                </div>

                <div
                  style={{
                    background: panelBg,
                    border: `1px solid ${line}`,
                    borderRadius: 22,
                    padding: 20,
                    boxShadow: "0 12px 28px rgba(19, 45, 89, 0.06)",
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 900, color: ink }}>Attention Needed</div>
                  <div style={{ fontSize: 13, color: inkSoft, marginTop: 4 }}>
                    Events below full SP coverage.
                  </div>

                  <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    {eventsSeed
                      .filter((event) => event.spAssigned < event.spNeeded && event.status !== "Canceled")
                      .map((event) => (
                        <div
                          key={`attention-${event.id}`}
                          style={{
                            border: `1px solid #E7D3D3`,
                            background: softRed,
                            borderRadius: 16,
                            padding: 14,
                          }}
                        >
                          <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>{event.title}</div>
                          <div style={{ fontSize: 13, color: inkSoft, marginTop: 4 }}>
                            {event.dateText} • {event.spAssigned}/{event.spNeeded} assigned
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div
                  style={{
                    background: panelBg,
                    border: `1px solid ${line}`,
                    borderRadius: 22,
                    padding: 20,
                    boxShadow: "0 12px 28px rgba(19, 45, 89, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${ink} 0%, ${teal} 100%)`,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      CF
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: ink }}>Admin Snapshot</div>
                  </div>

                  <div style={{ fontSize: 13, color: inkSoft, marginTop: 4 }}>
                    Tight, readable, and expandable only when needed.
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        border: `1px solid ${line}`,
                        background: "#ffffff",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: inkSoft }}>Current User</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: ink, marginTop: 4 }}>Cory / Admin</div>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        border: `1px solid ${line}`,
                        background: "#ffffff",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: inkSoft }}>Design Rule</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: ink, marginTop: 4 }}>
                        Nothing visible unless needed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
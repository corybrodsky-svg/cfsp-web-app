"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type EventStatus =
  | "Needs SPs"
  | "Draft"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Canceled";

type ImportedSession = {
  id?: string;
  date?: string;
  room?: string;
  roomRaw?: string;
  startTime?: string;
  endTime?: string;
  employees?: string[];
  lead?: string;
};

type EventItem = {
  id: string;
  name: string;
  status: EventStatus;
  date_text: string;
  sp_needed: number;
  sp_assigned: number;
  updated_at: string;
  assignedSimOps?: string[];
  leadSimOps?: string[];
  sessions?: ImportedSession[];
};

const STORAGE_KEY = "cfsp_events_v1";

const colors = {
  white: "#ffffff",
  navy: "#12376b",
  blue: "#1E5AA8",
  blueDark: "#163a70",
  green: "#2E8B57",
  greenDark: "#256b45",
  border: "#d4deeb",
  muted: "#61748e",
  red: "#c84a3a",
  redSoft: "#fbefec",
  greenSoft: "#edf8f1",
  blueSoft: "#edf4ff",
  graySoft: "#eef2f7",
  pageBg: "#eef3f8",
};

const statuses: EventStatus[] = [
  "Draft",
  "Needs SPs",
  "Scheduled",
  "In Progress",
  "Completed",
  "Canceled",
];

function loadEvents(): EventItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events: EventItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => String(v || "").trim()).filter(Boolean)));
}

function getDisplayDates(event: EventItem) {
  const validISO = Array.from(
    new Set(
      (event.sessions || [])
        .map((session) => String(session.date || ""))
        .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    )
  ).sort();

  const pretty = validISO
    .map((iso) => {
      const dt = new Date(`${iso}T00:00:00`);
      if (Number.isNaN(dt.getTime())) return "";
      return `${dt.getMonth() + 1}/${dt.getDate()}/${String(dt.getFullYear()).slice(-2)}`;
    })
    .filter(Boolean);

  return pretty.length ? pretty.join(", ") : "Date TBD";
}

function formatSessionDate(value?: string) {
  if (!value) return "TBD";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const dt = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(dt.getTime())) {
      return `${dt.getMonth() + 1}/${dt.getDate()}/${String(dt.getFullYear()).slice(-2)}`;
    }
  }
  return "TBD";
}

function summarizeRooms(event: EventItem) {
  return uniqueStrings(
    (event.sessions || []).map((session) => session.room || session.roomRaw || "").filter(Boolean)
  );
}

function summarizeSimOps(event: EventItem) {
  const direct = uniqueStrings(event.assignedSimOps || []);
  if (direct.length) return direct;
  return uniqueStrings((event.sessions || []).flatMap((session) => session.employees || []));
}

function summarizeLeads(event: EventItem) {
  const direct = uniqueStrings(event.leadSimOps || []);
  if (direct.length) return direct;
  return uniqueStrings((event.sessions || []).map((session) => session.lead || ""));
}

function getStatusPillStyle(status: EventStatus): React.CSSProperties {
  switch (status) {
    case "Needs SPs":
      return {
        background: colors.redSoft,
        color: colors.red,
        border: `1px solid #f1c9c2`,
      };
    case "Scheduled":
      return {
        background: colors.greenSoft,
        color: colors.greenDark,
        border: `1px solid #c9e5d3`,
      };
    case "In Progress":
      return {
        background: "#fff6e8",
        color: "#b97814",
        border: `1px solid #f1ddb3`,
      };
    case "Completed":
      return {
        background: colors.blueSoft,
        color: colors.blueDark,
        border: `1px solid #cfe0f6`,
      };
    case "Canceled":
      return {
        background: colors.graySoft,
        color: colors.muted,
        border: `1px solid ${colors.border}`,
      };
    default:
      return {
        background: colors.graySoft,
        color: colors.navy,
        border: `1px solid ${colors.border}`,
      };
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    setEvents(loadEvents());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveEvents(events);
  }, [events, loaded]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function updateEventStatus(id: string, status: EventStatus) {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              status,
              updated_at: new Date().toISOString(),
            }
          : event
      )
    );
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setExpandedIds((prev) => prev.filter((item) => item !== id));
  }

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    const base = events.filter((event) => {
      const simOps = summarizeSimOps(event).join(" ").toLowerCase();
      const rooms = summarizeRooms(event).join(" ").toLowerCase();
      const leads = summarizeLeads(event).join(" ").toLowerCase();

      if (!q) return true;

      return (
        event.name.toLowerCase().includes(q) ||
        event.status.toLowerCase().includes(q) ||
        getDisplayDates(event).toLowerCase().includes(q) ||
        simOps.includes(q) ||
        rooms.includes(q) ||
        leads.includes(q)
      );
    });

    return [...base].sort((a, b) => {
      const aDate =
        (a.sessions || [])
          .map((session) => String(session.date || ""))
          .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
          .sort()[0] || "9999-12-31";

      const bDate =
        (b.sessions || [])
          .map((session) => String(session.date || ""))
          .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
          .sort()[0] || "9999-12-31";

      if (aDate !== bDate) return aDate.localeCompare(bDate);
      return a.name.localeCompare(b.name);
    });
  }, [events, query]);

  const summary = useMemo(() => {
    const total = events.length;
    const drafts = events.filter((event) => event.status === "Draft").length;
    const needsSPs = events.filter((event) => event.status === "Needs SPs").length;
    const scheduled = events.filter((event) => event.status === "Scheduled").length;
    return { total, drafts, needsSPs, scheduled };
  }, [events]);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 34,
          border: `1px solid ${colors.border}`,
          background: `linear-gradient(135deg, ${colors.blueDark} 0%, ${colors.blue} 50%, ${colors.greenDark} 100%)`,
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
            padding: 30,
            display: "flex",
            justifyContent: "space-between",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#ffffff" }}>Events</div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.9)",
                marginTop: 10,
                maxWidth: 720,
                lineHeight: 1.5,
              }}
            >
              Imported schedule events, expandable details, and cleaner organization.
            </div>
          </div>

          <Link href="/upload-schedule" style={greenBtn}>
            Upload Schedule
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
        {[
          { label: "Total Events", value: summary.total, color: colors.blue },
          { label: "Drafts", value: summary.drafts, color: colors.muted },
          { label: "Need SPs", value: summary.needsSPs, color: colors.red },
          { label: "Scheduled", value: summary.scheduled, color: colors.green },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              padding: 22,
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
                background: item.color,
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 800, color: colors.muted }}>{item.label}</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: colors.navy, marginTop: 10 }}>
              {item.value}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          background: colors.white,
          border: `1px solid ${colors.border}`,
          borderRadius: 30,
          padding: 22,
          display: "grid",
          gap: 18,
          boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, color: colors.navy }}>All Events</div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event, room, Sim Op, lead..."
            style={{
              width: 380,
              maxWidth: "100%",
              height: 50,
              borderRadius: 14,
              border: `1px solid ${colors.border}`,
              padding: "0 14px",
              fontSize: 15,
              color: colors.navy,
              background: "#fff",
            }}
          />
        </div>

        {filteredEvents.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${colors.border}`,
              borderRadius: 18,
              padding: 32,
              textAlign: "center",
              color: colors.muted,
              fontSize: 15,
            }}
          >
            No events found.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedIds.includes(event.id);
            const rooms = summarizeRooms(event);
            const simOps = summarizeSimOps(event);
            const leads = summarizeLeads(event);
            const sessions = event.sessions || [];

            return (
              <div
                key={event.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${colors.border}`,
                  borderRadius: 24,
                  padding: 22,
                  display: "grid",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: colors.navy }}>{event.name}</div>
                    <div style={{ fontSize: 14, color: colors.muted, marginTop: 8 }}>
                      Last updated: {new Date(event.updated_at).toLocaleString()}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      padding: "9px 13px",
                      fontWeight: 800,
                      fontSize: 13,
                      ...getStatusPillStyle(event.status),
                    }}
                  >
                    {event.status}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 14,
                  }}
                >
                  {[
                    { label: "Dates", value: getDisplayDates(event) },
                    { label: "Sessions", value: sessions.length },
                    { label: "Rooms", value: rooms.length },
                    { label: "SP Coverage", value: `${event.sp_assigned} / ${event.sp_needed}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#f8fbff",
                        border: `1px solid #e4edf7`,
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 800, color: colors.muted }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: colors.navy, marginTop: 8 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: 8, color: colors.navy, fontSize: 16 }}>
                  <div>
                    <strong>Assigned Sim Ops:</strong> {simOps.length ? simOps.join(", ") : "None shown"}
                  </div>
                  <div>
                    <strong>Lead(s):</strong> {leads.length ? leads.join(", ") : "None shown"}
                  </div>
                  <div>
                    <strong>Rooms:</strong> {rooms.length ? rooms.join(", ") : "None shown"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => toggleExpanded(event.id)} style={blueBtn}>
                    {isExpanded ? "Hide Details" : "Expand"}
                  </button>

                  <Link href={`/events/${event.id}`} style={whiteBtn}>
                    View
                  </Link>

                  <select
                    value={event.status}
                    onChange={(e) => updateEventStatus(event.id, e.target.value as EventStatus)}
                    style={{
                      height: 46,
                      borderRadius: 14,
                      border: `1px solid ${colors.border}`,
                      padding: "0 12px",
                      fontSize: 14,
                      color: colors.navy,
                      background: "#fff",
                    }}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => handleDelete(event.id)} style={softBtn}>
                    Delete
                  </button>
                </div>

                {isExpanded ? (
                  <div
                    style={{
                      borderTop: `1px solid ${colors.border}`,
                      paddingTop: 16,
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 20, fontWeight: 900, color: colors.navy }}>Session Schedule</div>

                    <div
                      style={{
                        overflowX: "auto",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 16,
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                        <thead>
                          <tr>
                            {["Date", "Start", "End", "Room", "Lead", "Assigned"].map((label) => (
                              <th
                                key={label}
                                style={{
                                  textAlign: "left",
                                  padding: "14px 12px",
                                  background: "#f8fbff",
                                  borderBottom: `1px solid ${colors.border}`,
                                  fontSize: 13,
                                  color: colors.muted,
                                }}
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((session, index) => (
                            <tr key={session.id || `${event.id}-${index}`}>
                              <td style={td}>{formatSessionDate(session.date)}</td>
                              <td style={td}>{session.startTime || "TBD"}</td>
                              <td style={td}>{session.endTime || "TBD"}</td>
                              <td style={td}>{session.room || session.roomRaw || "TBD"}</td>
                              <td style={td}>{session.lead || "—"}</td>
                              <td style={td}>
                                {(session.employees || []).length
                                  ? (session.employees || []).join(", ")
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

const blueBtn: React.CSSProperties = {
  background: "#1E5AA8",
  color: "#fff",
  border: "none",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const greenBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#2E8B57",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
};

const whiteBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#ffffff",
  color: "#12376b",
  border: "1px solid #d4deeb",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
};

const softBtn: React.CSSProperties = {
  background: "#eef2f7",
  color: "#12376b",
  border: "1px solid #d4deeb",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const td: React.CSSProperties = {
  padding: "12px 10px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 14,
  color: "#12376b",
  verticalAlign: "top",
};
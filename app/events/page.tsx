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
  eventName?: string;
  room?: string;
  roomRaw?: string;
  startTime?: string;
  endTime?: string;
  timeRaw?: string;
  employees?: string[];
  lead?: string;
  sourceRow?: number;
};

type EventItem = {
  id: string;
  name: string;
  status: EventStatus;
  date_text: string;
  sp_needed: number;
  sp_assigned: number;
  notes?: string;
  updated_at: string;
  assignedSimOps?: string[];
  leadSimOps?: string[];
  sessions?: ImportedSession[];
};

const STORAGE_KEY = "cfsp_events_v1";

const navy = "#163a70";
const blue = "#1E5AA8";
const green = "#2E8B57";
const red = "#C0392B";
const border = "#d9e2ef";
const slate = "#5f6f86";
const white = "#ffffff";

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
  return Array.from(
    new Set(values.map((v) => String(v || "").trim()).filter(Boolean))
  );
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
    (event.sessions || []).map((s) => s.room || s.roomRaw || "").filter(Boolean)
  );
}

function summarizeSimOps(event: EventItem) {
  const direct = uniqueStrings(event.assignedSimOps || []);
  if (direct.length) return direct;
  return uniqueStrings((event.sessions || []).flatMap((s) => s.employees || []));
}

function summarizeLeads(event: EventItem) {
  const direct = uniqueStrings(event.leadSimOps || []);
  if (direct.length) return direct;
  return uniqueStrings((event.sessions || []).map((s) => s.lead || ""));
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
        event.id === id ? { ...event, status, updated_at: new Date().toISOString() } : event
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
    const drafts = events.filter((e) => e.status === "Draft").length;
    const needsSPs = events.filter((e) => e.status === "Needs SPs").length;
    const scheduled = events.filter((e) => e.status === "Scheduled").length;
    return { total, drafts, needsSPs, scheduled };
  }, [events]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          background: white,
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: 24,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 34, fontWeight: 900, color: navy }}>Events</div>
          <div style={{ fontSize: 15, color: slate, marginTop: 8 }}>
            Imported schedule events, expandable details, and cleaner organization.
          </div>
        </div>

        <Link
          href="/upload-schedule"
          style={{
            textDecoration: "none",
            background: green,
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 12,
            fontWeight: 800,
          }}
        >
          Upload Schedule
        </Link>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { label: "Total Events", value: summary.total, color: blue },
          { label: "Drafts", value: summary.drafts, color: slate },
          { label: "Need SPs", value: summary.needsSPs, color: red },
          { label: "Scheduled", value: summary.scheduled, color: green },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: white,
              border: `1px solid ${border}`,
              borderLeft: `6px solid ${item.color}`,
              borderRadius: 18,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: slate }}>{item.label}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: navy, marginTop: 8 }}>
              {item.value}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          background: white,
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: 20,
          display: "grid",
          gap: 16,
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
          <div style={{ fontSize: 22, fontWeight: 900, color: navy }}>All Events</div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event, room, Sim Op, lead..."
            style={{
              width: 340,
              maxWidth: "100%",
              height: 44,
              borderRadius: 12,
              border: `1px solid ${border}`,
              padding: "0 12px",
              fontSize: 14,
              color: navy,
            }}
          />
        </div>

        {filteredEvents.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${border}`,
              borderRadius: 16,
              padding: 28,
              textAlign: "center",
              color: slate,
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
                  border: `1px solid ${border}`,
                  borderRadius: 20,
                  padding: 20,
                  display: "grid",
                  gap: 16,
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
                    <div style={{ fontSize: 24, fontWeight: 900, color: navy }}>{event.name}</div>
                    <div style={{ fontSize: 13, color: slate, marginTop: 6 }}>
                      Last updated: {new Date(event.updated_at).toLocaleString()}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      border: `1px solid ${border}`,
                      color: blue,
                      fontWeight: 800,
                      fontSize: 12,
                      background: "#edf4ff",
                    }}
                  >
                    {event.status}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
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
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 800, color: slate }}>{item.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: navy, marginTop: 8 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gap: 8, color: navy, fontSize: 15 }}>
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

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggleExpanded(event.id)}
                    style={{
                      background: blue,
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "11px 16px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {isExpanded ? "Hide Details" : "Expand"}
                  </button>

                  <Link
                    href={`/events/${event.id}`}
                    style={{
                      textDecoration: "none",
                      background: white,
                      color: navy,
                      border: `1px solid ${border}`,
                      borderRadius: 12,
                      padding: "11px 16px",
                      fontWeight: 800,
                    }}
                  >
                    View
                  </Link>

                  <select
                    value={event.status}
                    onChange={(e) => updateEventStatus(event.id, e.target.value as EventStatus)}
                    style={{
                      height: 42,
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      padding: "0 12px",
                      fontSize: 14,
                      color: navy,
                    }}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleDelete(event.id)}
                    style={{
                      background: "#eef2f7",
                      color: navy,
                      border: `1px solid ${border}`,
                      borderRadius: 12,
                      padding: "11px 16px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>

                {isExpanded ? (
                  <div
                    style={{
                      borderTop: `1px solid ${border}`,
                      paddingTop: 16,
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900, color: navy }}>Session Schedule</div>

                    <div
                      style={{
                        overflowX: "auto",
                        border: `1px solid ${border}`,
                        borderRadius: 14,
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
                                  padding: "12px 10px",
                                  background: "#f8fbff",
                                  borderBottom: `1px solid ${border}`,
                                  fontSize: 13,
                                  color: slate,
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

const td: React.CSSProperties = {
  padding: "12px 10px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 14,
  color: "#163a70",
  verticalAlign: "top",
};
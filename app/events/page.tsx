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
    if (!Array.isArray(parsed)) return [];
    return parsed;
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
    new Set(
      values
        .map((v) => String(v || "").trim())
        .filter(Boolean)
    )
  );
}

function formatSessionDate(value?: string) {
  if (!value) return "TBD";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const dt = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(dt.getTime())) {
      return `${dt.getMonth() + 1}/${dt.getDate()}/${String(dt.getFullYear()).slice(-2)}`;
    }
  }
  return value;
}

function cleanNotes(notes?: string) {
  if (!notes) return "";
  const lines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const filtered = lines.filter(
    (line) =>
      !line.toLowerCase().includes("imported schedule refreshed") &&
      !line.toLowerCase().includes("imported from spring schedule uploader")
  );

  return filtered.join("\n");
}

function summarizeRooms(event: EventItem) {
  const rooms = uniqueStrings(
    (event.sessions || [])
      .map((session) => session.room || session.roomRaw || "")
      .filter(Boolean)
  );

  return rooms;
}

function summarizeSimOps(event: EventItem) {
  const direct = uniqueStrings(event.assignedSimOps || []);
  if (direct.length > 0) return direct;

  const fromSessions = uniqueStrings(
    (event.sessions || []).flatMap((session) => session.employees || [])
  );

  return fromSessions;
}

function summarizeLeads(event: EventItem) {
  const direct = uniqueStrings(event.leadSimOps || []);
  if (direct.length > 0) return direct;

  const fromSessions = uniqueStrings(
    (event.sessions || []).map((session) => session.lead || "")
  );

  return fromSessions;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState("");
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveEvents(events);
  }, [events, loaded]);

  function showFlash(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(""), 2200);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
  function handleDelete(id: string) {
    const target = events.find((e) => e.id === id);
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    setExpandedIds((prev) => prev.filter((item) => item !== id));
    showFlash(target ? `Deleted: ${target.name}` : "Event deleted");
  }

  function updateEventStatus(id: string, status: EventStatus) {
    const next = events.map((event) =>
      event.id === id
        ? { ...event, status, updated_at: new Date().toISOString() }
        : event
    );
    setEvents(next);
    const updated = next.find((e) => e.id === id);
    showFlash(updated ? `Status updated: ${updated.name}` : "Status updated");
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
    const needsSPs = events.filter((e) => e.status === "Needs SPs").length;
    const drafts = events.filter((e) => e.status === "Draft").length;
    const scheduled = events.filter((e) => e.status === "Scheduled").length;
    return { total, needsSPs, drafts, scheduled };
  }, [events]);

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.navBar}>
          <Link href="/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link href="/events" style={styles.navLinkActive}>Events</Link>
          <Link href="/upload-schedule" style={styles.navLink}>Upload Schedule</Link>
          <Link href="/sp-directory" style={styles.navLink}>SP Directory</Link>
          <Link href="/profile" style={styles.navLink}>Profile</Link>
          <Link href="/" style={styles.navLink}>Home</Link>
        </div>

        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>Events</h1>
            <p style={styles.subtitle}>
              Clean event list with expandable details, rooms, Sim Ops, and session schedule.
            </p>
          </div>

          <div style={styles.topBarButtons}>
            <Link href="/upload-schedule" style={styles.primaryLinkButton}>
              Upload Schedule
            </Link>
          </div>
        </div>

        {flash ? <div style={styles.flash}>{flash}</div> : null}

        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Events</div>
            <div style={styles.summaryValue}>{summary.total}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Drafts</div>
            <div style={styles.summaryValue}>{summary.drafts}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Need SPs</div>
            <div style={styles.summaryValue}>{summary.needsSPs}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Scheduled</div>
            <div style={styles.summaryValue}>{summary.scheduled}</div>
          </div>
        </div>

        <div style={styles.listTopRow}>
          <h2 style={styles.sectionTitle}>All Events</h2>
          <input
            style={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event, room, Sim Op, lead..."
          />
        </div>

        <div style={styles.eventList}>
          {filteredEvents.length === 0 ? (
            <div style={styles.emptyState}>
              No events found.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const isExpanded = expandedIds.includes(event.id);
              const rooms = summarizeRooms(event);
              const simOps = summarizeSimOps(event);
              const leads = summarizeLeads(event);
              const sessions = event.sessions || [];
              const noteText = cleanNotes(event.notes);

              return (
                <div key={event.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardTitleBlock}>
                      <h3 style={styles.cardTitle}>{event.name}</h3>
                      <div style={styles.metaLine}>
                        Last updated: {new Date(event.updated_at).toLocaleString()}
                      </div>
                    </div>

                    <div style={styles.cardRight}>
                      <span style={styles.badge}>{event.status}</span>
                    </div>
                  </div>

                  <div style={styles.infoGrid}>
                    <div style={styles.infoCell}>
                      <div style={styles.infoLabel}>Dates</div>
                      <div style={styles.infoValue}>{getDisplayDates(event)}</div>
                    </div>

                    <div style={styles.infoCell}>
                      <div style={styles.infoLabel}>Sessions</div>
                      <div style={styles.infoValue}>{sessions.length}</div>
                    </div>

                    <div style={styles.infoCell}>
                      <div style={styles.infoLabel}>Rooms</div>
                      <div style={styles.infoValue}>{rooms.length}</div>
                    </div>

                    <div style={styles.infoCell}>
                      <div style={styles.infoLabel}>SP Coverage</div>
                      <div style={styles.infoValue}>
                        {event.sp_assigned} / {event.sp_needed}
                      </div>
                    </div>
                  </div>

                  <div style={styles.summaryBlock}>
                    <div style={styles.summaryLine}>
                      <span style={styles.summaryKey}>Assigned Sim Ops:</span>{" "}
                      {simOps.length ? simOps.join(", ") : "None shown"}
                    </div>
                    <div style={styles.summaryLine}>
                      <span style={styles.summaryKey}>Lead(s):</span>{" "}
                      {leads.length ? leads.join(", ") : "None shown"}
                    </div>
                    <div style={styles.summaryLine}>
                      <span style={styles.summaryKey}>Rooms:</span>{" "}
                      {rooms.length ? rooms.join(", ") : "None shown"}
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      style={styles.primaryButton}
                      onClick={() => toggleExpanded(event.id)}
                    >
                      {isExpanded ? "Hide Details" : "Expand"}
                    </button>

                    <Link href={`/events/${event.id}`} style={styles.secondaryLink}>
                      View
                    </Link>

                    <select
                      style={styles.statusSelect}
                      value={event.status}
                      onChange={(e) =>
                        updateEventStatus(event.id, e.target.value as EventStatus)
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <button
                      style={styles.dangerButton}
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {isExpanded ? (
                    <div style={styles.expandedPanel}>
                      <div style={styles.expandedSection}>
                        <h4 style={styles.expandedHeading}>Session Schedule</h4>

                        {sessions.length === 0 ? (
                          <div style={styles.mutedBox}>No imported sessions attached yet.</div>
                        ) : (
                          <div style={styles.tableWrap}>
                            <table style={styles.table}>
                              <thead>
                                <tr>
                                  <th style={styles.th}>Date</th>
                                  <th style={styles.th}>Start</th>
                                  <th style={styles.th}>End</th>
                                  <th style={styles.th}>Room</th>
                                  <th style={styles.th}>Lead</th>
                                  <th style={styles.th}>Assigned</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sessions.map((session, index) => (
                                  <tr key={session.id || `${event.id}-${index}`}>
                                    <td style={styles.td}>{formatSessionDate(session.date)}</td>
                                    <td style={styles.td}>{session.startTime || "TBD"}</td>
                                    <td style={styles.td}>{session.endTime || "TBD"}</td>
                                    <td style={styles.td}>{session.room || session.roomRaw || "TBD"}</td>
                                    <td style={styles.td}>{session.lead || "—"}</td>
                                    <td style={styles.td}>
                                      {(session.employees || []).length
                                        ? (session.employees || []).join(", ")
                                        : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div style={styles.expandedSection}>
                        <h4 style={styles.expandedHeading}>Event Notes</h4>
                        <div style={styles.mutedBox}>
                          {noteText || "No notes."}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "24px 18px 60px",
  },
  shell: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  navBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  navLink: {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#183153",
    border: "1px solid #d8e0ec",
    fontWeight: 700,
  },
  navLinkActive: {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#1d4ed8",
    color: "#ffffff",
    border: "1px solid #1d4ed8",
    fontWeight: 800,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 800,
    color: "#183153",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#516273",
    fontSize: "15px",
  },
  topBarButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryLinkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 15px",
    borderRadius: "10px",
    textDecoration: "none",
    background: "#1d4ed8",
    color: "#ffffff",
    border: "1px solid #1d4ed8",
    fontWeight: 800,
  },
  flash: {
    marginBottom: "18px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "12px",
    padding: "12px 14px",
    fontWeight: 700,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #d8e0ec",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  },
  summaryLabel: {
    color: "#5f7183",
    fontSize: "13px",
    marginBottom: "8px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  summaryValue: {
    color: "#183153",
    fontSize: "28px",
    fontWeight: 800,
  },
  listTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#183153",
    fontWeight: 800,
  },
  search: {
    width: "320px",
    maxWidth: "100%",
    height: "44px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
  eventList: {
    display: "grid",
    gap: "16px",
  },
  emptyState: {
    background: "#ffffff",
    border: "1px dashed #cfd8e3",
    borderRadius: "18px",
    padding: "28px",
    color: "#5f7183",
    textAlign: "center",
    fontWeight: 600,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #d8e0ec",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  cardTitleBlock: {
    flex: 1,
    minWidth: "240px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#183153",
  },
  metaLine: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#64748b",
  },
  cardRight: {
    flexShrink: 0,
  },
  badge: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: 800,
    border: "1px solid #bfdbfe",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "14px",
  },
  infoCell: {
    background: "#f8fbff",
    border: "1px solid #e5edf7",
    borderRadius: "12px",
    padding: "12px",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "6px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#183153",
    wordBreak: "break-word",
  },
  summaryBlock: {
    display: "grid",
    gap: "8px",
    marginBottom: "16px",
  },
  summaryLine: {
    fontSize: "14px",
    color: "#334155",
    lineHeight: 1.5,
  },
  summaryKey: {
    fontWeight: 800,
    color: "#183153",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  primaryButton: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "11px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    background: "#ffffff",
    color: "#183153",
    border: "1px solid #cfd8e3",
    fontWeight: 700,
  },
  dangerButton: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "11px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statusSelect: {
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
  expandedPanel: {
    marginTop: "18px",
    borderTop: "1px solid #e5edf7",
    paddingTop: "18px",
    display: "grid",
    gap: "18px",
  },
  expandedSection: {
    display: "grid",
    gap: "10px",
  },
  expandedHeading: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#183153",
  },
  mutedBox: {
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "14px",
    color: "#475569",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
  th: {
    textAlign: "left",
    fontSize: "13px",
    color: "#475569",
    padding: "12px 10px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#1e293b",
    verticalAlign: "top",
  },
};
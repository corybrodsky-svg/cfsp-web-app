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

type EventItem = {
  id: string;
  name: string;
  status: EventStatus;
  date_text: string;
  sp_needed: number;
  sp_assigned: number;
  notes?: string;
  updated_at: string;
};

const STORAGE_KEY = "cfsp_events_v1";

const starterEvents: EventItem[] = [
  {
    id: "evt-1",
    name: "N651 Virtual",
    status: "Needs SPs",
    date_text: "3/10, 3/11",
    sp_needed: 6,
    sp_assigned: 2,
    notes: "Initial sample event",
    updated_at: new Date().toISOString(),
  },
];

const statuses: EventStatus[] = [
  "Draft",
  "Needs SPs",
  "Scheduled",
  "In Progress",
  "Completed",
  "Canceled",
];

function uid() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadEvents(): EventItem[] {
  if (typeof window === "undefined") return starterEvents;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(starterEvents));
      return starterEvents;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return starterEvents;

    return parsed;
  } catch {
    return starterEvents;
  }
}

function saveEvents(events: EventItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [flash, setFlash] = useState("");
  const [query, setQuery] = useState("");

  const [newName, setNewName] = useState("");
  const [newDateText, setNewDateText] = useState("");
  const [newStatus, setNewStatus] = useState<EventStatus>("Draft");
  const [newNeeded, setNewNeeded] = useState<number>(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EventItem>>({});

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
    window.setTimeout(() => {
      setFlash("");
    }, 2200);
  }

  function handleCreateDraft() {
    const trimmedName = newName.trim();

    const event: EventItem = {
      id: uid(),
      name: trimmedName || "Untitled Event",
      status: newStatus,
      date_text: newDateText.trim() || "Date TBD",
      sp_needed: Number.isFinite(newNeeded) ? Math.max(0, newNeeded) : 0,
      sp_assigned: 0,
      notes: "",
      updated_at: new Date().toISOString(),
    };

    const next = [event, ...events];
    setEvents(next);

    setNewName("");
    setNewDateText("");
    setNewStatus("Draft");
    setNewNeeded(0);

    showFlash(`Saved draft: ${event.name}`);
  }

  function handleDelete(id: string) {
    const target = events.find((e) => e.id === id);
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    if (editingId === id) {
      setEditingId(null);
      setEditForm({});
    }
    showFlash(target ? `Deleted: ${target.name}` : "Event deleted");
  }

  function startEdit(event: EventItem) {
    setEditingId(event.id);
    setEditForm({ ...event });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function saveEdit() {
    if (!editingId) return;

    const next = events.map((event) => {
      if (event.id !== editingId) return event;

      return {
        ...event,
        name: String(editForm.name ?? event.name).trim() || "Untitled Event",
        status: (editForm.status as EventStatus) ?? event.status,
        date_text: String(editForm.date_text ?? event.date_text).trim() || "Date TBD",
        sp_needed: Math.max(0, Number(editForm.sp_needed ?? event.sp_needed) || 0),
        sp_assigned: Math.max(
          0,
          Number(editForm.sp_assigned ?? event.sp_assigned) || 0
        ),
        notes: String(editForm.notes ?? event.notes ?? ""),
        updated_at: new Date().toISOString(),
      };
    });

    const savedItem = next.find((e) => e.id === editingId);
    setEvents(next);
    setEditingId(null);
    setEditForm({});
    showFlash(savedItem ? `Changes saved: ${savedItem.name}` : "Changes saved");
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

  function saveAssignmentDraft() {
    saveEvents(events);
    showFlash("Assignment draft saved");
  }

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;

    return events.filter((event) => {
      return (
        event.name.toLowerCase().includes(q) ||
        event.status.toLowerCase().includes(q) ||
        event.date_text.toLowerCase().includes(q) ||
        (event.notes || "").toLowerCase().includes(q)
      );
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
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Events</h1>
          <p style={styles.subtitle}>
            Create, save, edit, and manage event drafts from one page.
          </p>
        </div>

        <div style={styles.topBarButtons}>
          <Link href="/" style={styles.linkButton}>
            Home
          </Link>
          <Link href="/dashboard" style={styles.linkButton}>
            Dashboard
          </Link>
          <Link href="/events/new" style={styles.primaryLinkButton}>
            New Event Page
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

      <div style={styles.createCard}>
        <h2 style={styles.sectionTitle}>Quick Draft Event</h2>

        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Event Name</label>
            <input
              style={styles.input}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Example: PA/SPL IPE Virtual"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Date Text</label>
            <input
              style={styles.input}
              value={newDateText}
              onChange={(e) => setNewDateText(e.target.value)}
              placeholder="Example: Apr 15, Apr 21"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Status</label>
            <select
              style={styles.input}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as EventStatus)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>SPs Needed</label>
            <input
              style={styles.input}
              type="number"
              min={0}
              value={newNeeded}
              onChange={(e) => setNewNeeded(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={styles.rowButtons}>
          <button style={styles.primaryButton} onClick={handleCreateDraft}>
            Save Event Draft
          </button>
          <button style={styles.secondaryButton} onClick={saveAssignmentDraft}>
            Save Assignment Draft
          </button>
        </div>
      </div>

      <div style={styles.listTopRow}>
        <h2 style={styles.sectionTitle}>All Events</h2>
        <input
          style={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events..."
        />
      </div>

      <div style={styles.list}>
        {filteredEvents.length === 0 ? (
          <div style={styles.emptyState}>
            No events found. Create one above and it will save on this device.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isEditing = editingId === event.id;

            return (
              <div key={event.id} style={styles.card}>
                {!isEditing ? (
                  <>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>{event.name}</h3>
                        <div style={styles.cardMeta}>
                          Last updated:{" "}
                          {new Date(event.updated_at).toLocaleString()}
                        </div>
                      </div>

                      <div style={styles.badgeWrap}>
                        <span style={styles.badge}>{event.status}</span>
                      </div>
                    </div>

                    <div style={styles.cardBody}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Dates</span>
                        <span>{event.date_text}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>SP Coverage</span>
                        <span>
                          {event.sp_assigned} / {event.sp_needed}
                        </span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Notes</span>
                        <span>{event.notes || "—"}</span>
                      </div>
                    </div>

                    <div style={styles.cardActions}>
                      <Link href={`/events/${event.id}`} style={styles.linkButton}>
                        View
                      </Link>

                      <button
                        style={styles.secondaryButton}
                        onClick={() => startEdit(event)}
                      >
                        Edit
                      </button>

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
                  </>
                ) : (
                  <>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>Edit Event</h3>
                    </div>

                    <div style={styles.formGrid}>
                      <div style={styles.field}>
                        <label style={styles.label}>Event Name</label>
                        <input
                          style={styles.input}
                          value={String(editForm.name ?? "")}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Date Text</label>
                        <input
                          style={styles.input}
                          value={String(editForm.date_text ?? "")}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              date_text: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Status</label>
                        <select
                          style={styles.input}
                          value={String(editForm.status ?? "Draft")}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              status: e.target.value as EventStatus,
                            }))
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>SPs Needed</label>
                        <input
                          style={styles.input}
                          type="number"
                          min={0}
                          value={Number(editForm.sp_needed ?? 0)}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              sp_needed: Number(e.target.value),
                            }))
                          }
                        />
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>SPs Assigned</label>
                        <input
                          style={styles.input}
                          type="number"
                          min={0}
                          value={Number(editForm.sp_assigned ?? 0)}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              sp_assigned: Number(e.target.value),
                            }))
                          }
                        />
                      </div>

                      <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                        <label style={styles.label}>Notes</label>
                        <textarea
                          style={styles.textarea}
                          value={String(editForm.notes ?? "")}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          placeholder="Optional notes"
                        />
                      </div>
                    </div>

                    <div style={styles.cardActions}>
                      <button style={styles.primaryButton} onClick={saveEdit}>
                        Save Changes
                      </button>
                      <button style={styles.secondaryButton} onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "32px 20px 60px",
  },
  topBar: {
    maxWidth: "1200px",
    margin: "0 auto 20px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "32px",
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
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    background: "#ffffff",
    color: "#183153",
    border: "1px solid #d8e0ec",
    fontWeight: 600,
  },
  primaryLinkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    background: "#1d4ed8",
    color: "#ffffff",
    border: "1px solid #1d4ed8",
    fontWeight: 700,
  },
  flash: {
    maxWidth: "1200px",
    margin: "0 auto 18px auto",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "12px",
    padding: "12px 14px",
    fontWeight: 700,
  },
  summaryRow: {
    maxWidth: "1200px",
    margin: "0 auto 20px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
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
  createCard: {
    maxWidth: "1200px",
    margin: "0 auto 22px auto",
    background: "#ffffff",
    border: "1px solid #d8e0ec",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    fontSize: "22px",
    color: "#183153",
    fontWeight: 800,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
  textarea: {
    minHeight: "100px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "12px",
    fontSize: "14px",
    background: "#fff",
    resize: "vertical",
  },
  rowButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
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
  secondaryButton: {
    background: "#ffffff",
    color: "#183153",
    border: "1px solid #cfd8e3",
    borderRadius: "10px",
    padding: "11px 16px",
    fontWeight: 700,
    cursor: "pointer",
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
  listTopRow: {
    maxWidth: "1200px",
    margin: "0 auto 14px auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  search: {
    width: "280px",
    maxWidth: "100%",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
  list: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "16px",
  },
  emptyState: {
    gridColumn: "1 / -1",
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
    padding: "18px",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#183153",
  },
  cardMeta: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "12px",
  },
  badgeWrap: {
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
  cardBody: {
    display: "grid",
    gap: "10px",
    marginBottom: "16px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    fontSize: "14px",
    color: "#334155",
  },
  infoLabel: {
    fontWeight: 700,
    color: "#5f7183",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  statusSelect: {
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #cfd8e3",
    padding: "0 12px",
    fontSize: "14px",
    background: "#fff",
  },
};
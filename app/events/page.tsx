"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteShell from "../components/SiteShell";
import * as planningData from "../lib/planningData";

type AnyRecord = Record<string, any>;

type EventRecord = {
  id: string;
  name: string;
  status: string;
  dateText: string;
  sessionCount: number;
  roomCount: number;
  roomsLabel: string;
  simOpsLabel: string;
  leadsLabel: string;
  spNeeded: number;
  raw: AnyRecord;
};

type EventHire = {
  id: string;
  eventId: string;
  spName: string;
  confirmed: boolean;
  createdAt: string;
};

const STORAGE_KEY = "cfsp-event-sp-hires-v1";

const pageWrap: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "20px",
};

const heroCard: React.CSSProperties = {
  borderRadius: "28px",
  padding: "28px 30px",
  marginBottom: "20px",
  background: "linear-gradient(135deg, #1f4f82 0%, #2d8aa6 55%, #95c85b 100%)",
  color: "#ffffff",
  boxShadow: "0 14px 36px rgba(15, 23, 42, 0.12)",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dbe4ee",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  marginBottom: "22px",
};

const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const statCard: React.CSSProperties = {
  border: "1px solid #dbe4ee",
  borderRadius: "18px",
  padding: "14px 16px",
  background: "#f8fbff",
};

const statLabel: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#64748b",
  marginBottom: "6px",
};

const statValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 800,
  color: "#173b6c",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  alignItems: "center",
  marginTop: "14px",
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  padding: "13px 18px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "#1f5fbf",
  color: "#ffffff",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid #cfd8e3",
  borderRadius: "14px",
  padding: "13px 18px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "#ffffff",
  color: "#173b6c",
};

const dangerButton: React.CSSProperties = {
  border: "1px solid #cfd8e3",
  borderRadius: "14px",
  padding: "13px 18px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "#eef2f7",
  color: "#173b6c",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "999px",
  fontSize: "14px",
  fontWeight: 800,
};

const hiresWrap: React.CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const chipRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 800,
  color: "#173b6c",
};

function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function slugify(value: string): string {
  return safeString(value)
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractAllRows(moduleLike: AnyRecord): AnyRecord[] {
  const rows: AnyRecord[] = [];

  Object.values(moduleLike).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((row) => {
        if (row && typeof row === "object") rows.push(row);
      });
    }
  });

  return rows;
}

function buildEvents(rows: AnyRecord[]): EventRecord[] {
  const rawEvents = rows.filter((row) => {
    const maybeName =
      safeString(row.name) ||
      safeString(row.title) ||
      safeString(row.event_name) ||
      safeString(row.eventName);
    return Boolean(maybeName);
  });

  const mapped = rawEvents.map((row) => {
    const name =
      safeString(row.name) ||
      safeString(row.title) ||
      safeString(row.event_name) ||
      safeString(row.eventName) ||
      "Untitled Event";

    const id =
      safeString(row.id) ||
      safeString(row.event_id) ||
      safeString(row.eventId) ||
      slugify(name);

    const dates =
      safeString(row.date_text) ||
      safeString(row.dateText) ||
      safeString(row.event_date) ||
      safeString(row.eventDate) ||
      safeString(row.date) ||
      "No date listed";

    const sessionCount =
      toNumber(row.session_count) ||
      toNumber(row.sessionCount) ||
      toNumber(row.sessions) ||
      0;

    const roomCount =
      toNumber(row.room_count) ||
      toNumber(row.roomCount) ||
      toNumber(row.rooms_count) ||
      0;

    const roomsLabel =
      safeString(row.rooms_label) ||
      safeString(row.roomsLabel) ||
      safeString(row.rooms) ||
      safeString(row.location) ||
      safeString(row.room) ||
      "—";

    const simOpsLabel =
      safeString(row.sim_ops) ||
      safeString(row.simOps) ||
      safeString(row.assigned_staff) ||
      safeString(row.staff) ||
      safeString(row.sim_op) ||
      safeString(row.simOp) ||
      "—";

    const leadsLabel =
      safeString(row.leads) ||
      safeString(row.lead) ||
      safeString(row.faculty) ||
      safeString(row.faculty_contact) ||
      "—";

    return {
      id,
      name,
      status:
        safeString(row.status) ||
        safeString(row.event_status) ||
        safeString(row.eventStatus) ||
        "Draft",
      dateText: dates,
      sessionCount,
      roomCount,
      roomsLabel,
      simOpsLabel,
      leadsLabel,
      spNeeded:
        toNumber(row.sp_needed) ||
        toNumber(row.spNeeded) ||
        toNumber(row.needed) ||
        0,
      raw: row,
    };
  });

  return mapped.filter(
    (event, index, arr) =>
      arr.findIndex(
        (x) =>
          slugify(x.id) === slugify(event.id) ||
          (slugify(x.name) === slugify(event.name) && x.dateText === event.dateText)
      ) === index
  );
}

function loadSavedHires(): EventHire[] {
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

function saveHires(hires: EventHire[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hires));
}

function statusBadge(status: string): React.CSSProperties {
  const s = status.toLowerCase();

  if (s.includes("need")) {
    return { ...badgeStyle, background: "#fef2f2", color: "#c2410c", border: "1px solid #fecaca" };
  }
  if (s.includes("draft")) {
    return { ...badgeStyle, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  }
  if (s.includes("scheduled")) {
    return { ...badgeStyle, background: "#eef2ff", color: "#4338ca", border: "1px solid #c7d2fe" };
  }
  if (s.includes("progress")) {
    return { ...badgeStyle, background: "#ecfeff", color: "#0f766e", border: "1px solid #a5f3fc" };
  }
  if (s.includes("complete")) {
    return { ...badgeStyle, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" };
  }

  return { ...badgeStyle, background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0" };
}

function hireChipStyle(confirmed: boolean): React.CSSProperties {
  if (confirmed) {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "9px 12px",
      borderRadius: "999px",
      border: "1px solid #111111",
      background: "#ffffff",
      color: "#111111",
      fontWeight: 800,
      fontSize: "14px",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 12px",
    borderRadius: "999px",
    border: "1px solid #dc2626",
    background: "#fff1f2",
    color: "#dc2626",
    fontWeight: 800,
    fontSize: "14px",
  };
}

export default function EventsPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [eventStatuses, setEventStatuses] = useState<Record<string, string>>({});
  const [deleted, setDeleted] = useState<Record<string, boolean>>({});
  const [savedHires, setSavedHires] = useState<EventHire[]>([]);

  const events = useMemo(() => {
    const rows = extractAllRows(planningData as AnyRecord);
    return buildEvents(rows);
  }, []);

  useEffect(() => {
    setSavedHires(loadSavedHires());
  }, []);

  function toggleExpanded(eventId: string) {
    setExpanded((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  }

  function handleDelete(eventId: string) {
    const ok = window.confirm("Delete this event card from view?");
    if (!ok) return;

    setDeleted((prev) => ({
      ...prev,
      [eventId]: true,
    }));
  }

  function handleAddSP(eventId: string) {
    const spName = window.prompt("Enter the SP name:");
    if (!spName || !spName.trim()) return;

    const confirmed = window.confirm(
      "Click OK for CONFIRMED HIRE.\nClick Cancel for NOT CONFIRMED."
    );

    const newHire: EventHire = {
      id: `${eventId}-${Date.now()}`,
      eventId,
      spName: spName.trim(),
      confirmed,
      createdAt: new Date().toISOString(),
    };

    const next = [...savedHires, newHire];
    setSavedHires(next);
    saveHires(next);
  }

  function handleRemoveSP(hireId: string) {
    const next = savedHires.filter((hire) => hire.id !== hireId);
    setSavedHires(next);
    saveHires(next);
  }

  const visibleEvents = events.filter((event) => !deleted[event.id]);

  return (
    <SiteShell>
      <div style={pageWrap}>
        <div style={heroCard}>
          <h1 style={{ margin: 0, fontSize: "46px", lineHeight: 1.02 }}>Events</h1>
          <p style={{ margin: "12px 0 0 0", fontSize: "20px", opacity: 0.96 }}>
            Event control center with quick staffing, coverage view, and direct SP adds.
          </p>
        </div>

        {visibleEvents.map((event) => {
          const currentStatus = eventStatuses[event.id] || event.status;
          const hiresForEvent = savedHires.filter((hire) => hire.eventId === event.id);
          const confirmedCount = hiresForEvent.filter((hire) => hire.confirmed).length;
          const totalCount = hiresForEvent.length;
          const spNeeded = event.spNeeded || 0;
          const coverageDisplay = `${totalCount} / ${spNeeded}`;
          const isExpanded = !!expanded[event.id];

          return (
            <div key={event.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "34px",
                      lineHeight: 1.08,
                      color: "#173b6c",
                    }}
                  >
                    {event.name}
                  </h2>

                  <div style={{ marginTop: "10px", color: "#64748b", fontSize: "15px" }}>
                    Last updated: {new Date().toLocaleDateString()} ,{" "}
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>

                <span style={statusBadge(currentStatus)}>{currentStatus}</span>
              </div>

              <div style={statGrid}>
                <div style={statCard}>
                  <div style={statLabel}>Dates</div>
                  <div style={statValue}>{event.dateText || "—"}</div>
                </div>

                <div style={statCard}>
                  <div style={statLabel}>Sessions</div>
                  <div style={statValue}>{event.sessionCount}</div>
                </div>

                <div style={statCard}>
                  <div style={statLabel}>Rooms</div>
                  <div style={statValue}>{event.roomCount}</div>
                </div>

                <div style={statCard}>
                  <div style={statLabel}>SP Coverage</div>
                  <div style={statValue}>{coverageDisplay}</div>
                </div>
              </div>

              <div style={{ color: "#173b6c", fontSize: "16px", lineHeight: 1.7 }}>
                <div>
                  <strong>Assigned Sim Ops:</strong> {event.simOpsLabel || "—"}
                </div>
                <div>
                  <strong>Lead(s):</strong> {event.leadsLabel || "—"}
                </div>
                <div>
                  <strong>Rooms:</strong> {event.roomsLabel || "—"}
                </div>
              </div>

              <div style={buttonRow}>
                <button
                  type="button"
                  onClick={() => toggleExpanded(event.id)}
                  style={primaryButton}
                >
                  {isExpanded ? "Collapse" : "Expand"}
                </button>

                <Link
                  href={`/events/${event.id}`}
                  style={{
                    ...secondaryButton,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  View
                </Link>

                <button
                  type="button"
                  onClick={() => handleAddSP(event.id)}
                  style={{
                    ...secondaryButton,
                    border: "1px solid #1f5fbf",
                    color: "#1f5fbf",
                    fontWeight: 800,
                  }}
                >
                  Add SP
                </button>

                <select
                  value={currentStatus}
                  onChange={(e) =>
                    setEventStatuses((prev) => ({
                      ...prev,
                      [event.id]: e.target.value,
                    }))
                  }
                  style={{
                    borderRadius: "14px",
                    border: "1px solid #cfd8e3",
                    padding: "13px 16px",
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "#173b6c",
                    background: "#ffffff",
                  }}
                >
                  <option value="Draft">Draft</option>
                  <option value="Needs SPs">Needs SPs</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  style={dangerButton}
                >
                  Delete
                </button>
              </div>

              {(isExpanded || hiresForEvent.length > 0) && (
                <div style={hiresWrap}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={sectionLabel}>SP Hires / Assignments</div>
                    <div style={{ color: "#475569", fontSize: "14px", fontWeight: 700 }}>
                      Confirmed: {confirmedCount} | Total added: {totalCount}
                    </div>
                  </div>

                  {hiresForEvent.length === 0 ? (
                    <div style={{ marginTop: "12px", color: "#64748b", fontSize: "15px" }}>
                      No SPs added yet for this event.
                    </div>
                  ) : (
                    <div style={chipRow}>
                      {hiresForEvent.map((hire) => (
                        <span key={hire.id} style={hireChipStyle(hire.confirmed)}>
                          {hire.spName}
                          <span style={{ fontWeight: 700, opacity: 0.9 }}>
                            {hire.confirmed ? "(Confirmed)" : "(Not Confirmed)"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSP(hire.id)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontWeight: 900,
                              color: hire.confirmed ? "#111111" : "#dc2626",
                              padding: 0,
                              marginLeft: "2px",
                            }}
                            aria-label={`Remove ${hire.spName}`}
                            title="Remove SP"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SiteShell>
  );
}
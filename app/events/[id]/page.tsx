"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import SiteShell from "../../components/SiteShell";
import * as planningData from "../../lib/planningData";

type AnyRecord = Record<string, any>;

type EventRecord = {
  id: string;
  name: string;
  status: string;
  dateText: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  simOp?: string;
  faculty?: string;
  notes?: string;
  spNeeded: number;
  blueprintUrl?: string;
  simFlowUrl?: string;
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
  maxWidth: "1180px",
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
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
  marginBottom: "18px",
};

const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
};

const statCard: React.CSSProperties = {
  border: "1px solid #dbe4ee",
  borderRadius: "18px",
  padding: "14px",
  background: "#f8fbff",
};

const statLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const statValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 800,
  color: "#173b6c",
};

const rosterWrap: React.CSSProperties = {
  marginTop: "14px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value: unknown): number {
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

function extractRows(moduleLike: AnyRecord): AnyRecord[] {
  const rows: AnyRecord[] = [];

  Object.values(moduleLike).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((row) => {
        if (row && typeof row === "object") {
          rows.push(row as AnyRecord);
        }
      });
    }
  });

  return rows;
}

function loadHires(): EventHire[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EventHire[]) : [];
  } catch {
    return [];
  }
}

function chipStyle(confirmed: boolean): React.CSSProperties {
  if (confirmed) {
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "9px 12px",
      borderRadius: "999px",
      border: "1px solid #111111",
      color: "#111111",
      background: "#ffffff",
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
    color: "#dc2626",
    background: "#fff1f2",
    fontWeight: 800,
    fontSize: "14px",
  };
}

function normalizeEvent(row: AnyRecord): EventRecord {
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

  return {
    id,
    name,
    status:
      safeString(row.status) ||
      safeString(row.event_status) ||
      safeString(row.eventStatus) ||
      "Draft",
    dateText:
      safeString(row.date_text) ||
      safeString(row.dateText) ||
      safeString(row.event_date) ||
      safeString(row.eventDate) ||
      safeString(row.date) ||
      "",
    startTime:
      safeString(row.start_time) ||
      safeString(row.startTime) ||
      safeString(row.time_start),
    endTime:
      safeString(row.end_time) ||
      safeString(row.endTime) ||
      safeString(row.time_end),
    location:
      safeString(row.location) ||
      safeString(row.room) ||
      safeString(row.site),
    simOp:
      safeString(row.sim_op) ||
      safeString(row.simOp) ||
      safeString(row.assigned_staff) ||
      safeString(row.staff),
    faculty:
      safeString(row.faculty) ||
      safeString(row.faculty_contact) ||
      safeString(row.leads) ||
      safeString(row.lead),
    notes: safeString(row.notes) || safeString(row.description),
    spNeeded:
      toNumber(row.sp_needed) ||
      toNumber(row.spNeeded) ||
      toNumber(row.needed),
    blueprintUrl:
      safeString(row.blueprint_url) ||
      safeString(row.blueprintUrl) ||
      safeString(row.blueprint_link) ||
      safeString(row.blueprintLink) ||
      safeString(row.blueprint) ||
      undefined,
    simFlowUrl:
      safeString(row.sim_flow_url) ||
      safeString(row.simFlowUrl) ||
      safeString(row.sim_flow_link) ||
      safeString(row.simFlowLink) ||
      safeString(row.simFlow) ||
      undefined,
    raw: row,
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const rawId = safeString(params?.id);
  const [hires, setHires] = useState<EventHire[]>([]);

  useEffect(() => {
    setHires(loadHires());
  }, []);

  const event = useMemo(() => {
    const rows = extractRows(planningData as AnyRecord);
    const events = rows.map(normalizeEvent);

    return (
      events.find((row) => slugify(row.id) === slugify(rawId)) ||
      events.find((row) => slugify(row.name) === slugify(rawId)) ||
      null
    );
  }, [rawId]);

  const hiresForEvent = useMemo(() => {
    return hires.filter((hire) => slugify(hire.eventId) === slugify(rawId));
  }, [hires, rawId]);

  const confirmedCount = hiresForEvent.filter((hire) => hire.confirmed).length;
  const pageTitle = event ? event.name : "Event Detail";

  if (!event) {
    return (
      <SiteShell title="Event Detail">
        <div style={pageWrap}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Event not found</h2>
            <p>Return to Events and open one of the available imported event cards.</p>
            <Link
              href="/events"
              style={{ color: "#1f5fbf", fontWeight: 700, textDecoration: "none" }}
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title={pageTitle}>
      <div style={pageWrap}>
        <div style={heroCard}>
          <Link
            href="/events"
            style={{
              display: "inline-block",
              marginBottom: "12px",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Back to Events
          </Link>

          <h1 style={{ margin: 0, fontSize: "38px", lineHeight: 1.05 }}>{event.name}</h1>
          <p style={{ margin: "12px 0 0 0", fontSize: "18px", opacity: 0.96 }}>
            Event control center with synced hires, coverage, and quick links.
          </p>
        </div>

        <div style={cardStyle}>
          <div style={statGrid}>
            <div style={statCard}>
              <div style={statLabel}>Date</div>
              <div style={statValue}>{event.dateText || "—"}</div>
            </div>

            <div style={statCard}>
              <div style={statLabel}>Time</div>
              <div style={statValue}>
                {event.startTime || event.endTime
                  ? `${event.startTime || "?"}${event.endTime ? ` – ${event.endTime}` : ""}`
                  : "—"}
              </div>
            </div>

            <div style={statCard}>
              <div style={statLabel}>Location</div>
              <div style={statValue}>{event.location || "—"}</div>
            </div>

            <div style={statCard}>
              <div style={statLabel}>SP Coverage</div>
              <div style={statValue}>
                {hiresForEvent.length} / {event.spNeeded}
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Event Overview</h2>
          <p><strong>Status:</strong> {event.status || "—"}</p>
          <p><strong>Assigned Sim Ops:</strong> {event.simOp || "—"}</p>
          <p><strong>Lead(s):</strong> {event.faculty || "—"}</p>
          <p><strong>Notes:</strong> {event.notes || "—"}</p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }}>
            {event.blueprintUrl ? (
              <a
                href={event.blueprintUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  border: "1px solid #cfd8e3",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  textDecoration: "none",
                  color: "#173b6c",
                  fontWeight: 700,
                  background: "#ffffff",
                }}
              >
                Open Blueprint
              </a>
            ) : null}

            {event.simFlowUrl ? (
              <a
                href={event.simFlowUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  border: "1px solid #cfd8e3",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  textDecoration: "none",
                  color: "#173b6c",
                  fontWeight: 700,
                  background: "#ffffff",
                }}
              >
                Open Sim Flow
              </a>
            ) : null}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Assigned SP Roster</h2>
          <p style={{ color: "#475569" }}>
            Confirmed: {confirmedCount} | Total added: {hiresForEvent.length}
          </p>

          {hiresForEvent.length === 0 ? (
            <p>No SPs added yet for this event.</p>
          ) : (
            <div style={rosterWrap}>
              {hiresForEvent.map((hire) => (
                <span key={hire.id} style={chipStyle(hire.confirmed)}>
                  {hire.spName} {hire.confirmed ? "(Confirmed)" : "(Not Confirmed)"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
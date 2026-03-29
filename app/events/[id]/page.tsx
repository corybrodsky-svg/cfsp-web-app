"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  status: string;
  date_text: string;
  sp_needed: number;
  sp_assigned: number;
  updated_at: string;
  assignedSimOps?: string[];
  leadSimOps?: string[];
  sessions?: ImportedSession[];
};

const STORAGE_KEY = "cfsp_events_v1";
const navy = "#163a70";
const blue = "#1E5AA8";
const green = "#2E8B57";
const border = "#d9e2ef";
const slate = "#5f6f86";
const white = "#ffffff";

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

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const event = useMemo(
    () => events.find((item) => item.id === params.id),
    [events, params.id]
  );

  if (!event) {
    return (
      <div
        style={{
          background: white,
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: 24,
          display: "grid",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 900, color: navy }}>Event Not Found</div>
        <div style={{ fontSize: 15, color: slate }}>
          This event id does not match the current dataset.
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/events" style={linkBtn}>
            Back to Events
          </Link>
          <Link href="/dashboard" style={linkBtn}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const simOps = event.assignedSimOps || [];
  const leads = event.leadSimOps || [];
  const sessions = event.sessions || [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          background: white,
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: 24,
          display: "grid",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 34, fontWeight: 900, color: navy }}>{event.name}</div>
            <div style={{ fontSize: 14, color: slate, marginTop: 8 }}>
              Last updated: {new Date(event.updated_at).toLocaleString()}
            </div>
          </div>

          <div
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              border: `1px solid ${border}`,
              background: "#edf4ff",
              color: blue,
              fontWeight: 800,
              height: "fit-content",
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
            { label: "Rooms", value: new Set(sessions.map((s) => s.room || s.roomRaw || "")).size },
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
              <div style={{ fontSize: 12, fontWeight: 800, color: slate }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: navy, marginTop: 8 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 8, fontSize: 15, color: navy }}>
          <div><strong>Assigned Sim Ops:</strong> {simOps.length ? simOps.join(", ") : "None shown"}</div>
          <div><strong>Lead(s):</strong> {leads.length ? leads.join(", ") : "None shown"}</div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/events" style={primaryBtn}>Back to Events</Link>
          <Link href="/upload-schedule" style={secondaryBtn}>Upload Schedule</Link>
        </div>
      </section>

      <section
        style={{
          background: white,
          border: `1px solid ${border}`,
          borderRadius: 24,
          padding: 24,
          display: "grid",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900, color: navy }}>Session Schedule</div>

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
                    {(session.employees || []).length ? (session.employees || []).join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#ffffff",
  color: "#163a70",
  border: "1px solid #d9e2ef",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
};

const primaryBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#1E5AA8",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
};

const secondaryBtn: React.CSSProperties = {
  textDecoration: "none",
  background: "#2E8B57",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 16px",
  fontWeight: 800,
};

const td: React.CSSProperties = {
  padding: "12px 10px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 14,
  color: "#163a70",
  verticalAlign: "top",
};
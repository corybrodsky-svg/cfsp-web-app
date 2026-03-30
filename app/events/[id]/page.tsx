"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cfsp_events_v1";

type SessionItem = {
  id?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  roomRaw?: string;
  employees?: string[];
  lead?: string;
};

type EventItem = {
  id: string;
  name: string;
  status?: string;
  sp_needed?: number;
  sp_assigned?: number;
  updated_at?: string;
  assignedSimOps?: string[];
  leadSimOps?: string[];
  sessions?: SessionItem[];
  notes?: string;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEvents(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  const event = useMemo(() => {
    return events.find((item) => item.id === params.id);
  }, [events, params.id]);

  if (!loaded) {
    return (
      <div style={shell}>
        <div style={card}>
          <div style={title}>Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={shell}>
        <div style={card}>
          <div style={title}>Event Not Found</div>
          <div style={subtle}>
            This event id does not match what is currently saved in local storage.
          </div>

          <div style={buttonRow}>
            <Link href="/events" style={blueBtn}>
              Back to Events
            </Link>
            <Link href="/dashboard" style={whiteBtn}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sessions = event.sessions || [];
  const leads =
    event.leadSimOps && event.leadSimOps.length
      ? event.leadSimOps
      : uniqueStrings(sessions.map((s) => s.lead || "").filter(Boolean));

  const simOps =
    event.assignedSimOps && event.assignedSimOps.length
      ? event.assignedSimOps
      : uniqueStrings(sessions.flatMap((s) => s.employees || []));

  const rooms = uniqueStrings(
    sessions.map((s) => s.room || s.roomRaw || "").filter(Boolean)
  );

  const displayDates = getDisplayDates(sessions);

  return (
    <div style={shell}>
      <div style={heroCard}>
        <div>
          <div style={heroTitle}>{event.name}</div>
          <div style={subtle}>
            {event.updated_at
              ? `Last updated: ${new Date(event.updated_at).toLocaleString()}`
              : "Imported event"}
          </div>
        </div>

        <div style={pill}>{event.status || "Draft"}</div>
      </div>

      <div style={statsGrid}>
        <Stat label="Dates" value={displayDates} />
        <Stat label="Sessions" value={String(sessions.length)} />
        <Stat label="Rooms" value={String(rooms.length)} />
        <Stat
          label="SP Coverage"
          value={`${event.sp_assigned || 0}/${event.sp_needed || 0}`}
        />
      </div>

      <div style={card}>
        <div style={sectionTitle}>Event Summary</div>

        <div style={infoGrid}>
          <InfoRow label="Assigned Sim Ops" value={simOps.join(", ") || "None shown"} />
          <InfoRow label="Lead(s)" value={leads.join(", ") || "None shown"} />
          <InfoRow label="Rooms" value={rooms.join(", ") || "None shown"} />
          <InfoRow label="Notes" value={event.notes || "No notes"} />
        </div>

        <div style={buttonRow}>
          <Link href="/events" style={blueBtn}>
            Back to Events
          </Link>
          <Link href="/upload-schedule" style={greenBtn}>
            Upload Schedule
          </Link>
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>Session Schedule</div>

        {sessions.length === 0 ? (
          <div style={subtle}>No sessions attached to this event yet.</div>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Start</th>
                  <th style={th}>End</th>
                  <th style={th}>Room</th>
                  <th style={th}>Lead</th>
                  <th style={th}>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={session.id || `${event.id}-${index}`}>
                    <td style={td}>{formatDateSafe(session.date)}</td>
                    <td style={td}>{session.startTime || "—"}</td>
                    <td style={td}>{session.endTime || "—"}</td>
                    <td style={td}>{session.room || session.roomRaw || "—"}</td>
                    <td style={td}>{session.lead || "—"}</td>
                    <td style={td}>
                      {(session.employees || []).length
                        ? session.employees!.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoRow}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{value}</div>
    </div>
  );
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function formatDateSafe(value?: string) {
  if (!value) return "TBD";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const dt = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(dt.getTime())) {
      return `${dt.getMonth() + 1}/${dt.getDate()}/${String(dt.getFullYear()).slice(-2)}`;
    }
  }
  return "TBD";
}

function getDisplayDates(sessions: SessionItem[]) {
  const validISO = Array.from(
    new Set(
      sessions
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

const shell: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const heroCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d4deeb",
  borderRadius: 28,
  padding: 26,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
  boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
};

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d4deeb",
  borderRadius: 24,
  padding: 22,
  display: "grid",
  gap: 16,
  boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
};

const title: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
  color: "#12376b",
};

const heroTitle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  color: "#12376b",
};

const subtle: React.CSSProperties = {
  fontSize: 15,
  color: "#61748e",
  lineHeight: 1.5,
};

const pill: React.CSSProperties = {
  background: "#edf4ff",
  color: "#1E5AA8",
  border: "1px solid #d4deeb",
  borderRadius: 999,
  padding: "8px 14px",
  fontWeight: 800,
  fontSize: 13,
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const statCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d4deeb",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 12px 28px rgba(18,55,107,0.07)",
};

const statLabel: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: "#61748e",
};

const statValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: "#12376b",
  marginTop: 10,
  lineHeight: 1.2,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: "#12376b",
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const infoRow: React.CSSProperties = {
  background: "#f8fbff",
  border: "1px solid #e4edf7",
  borderRadius: 16,
  padding: 16,
  display: "grid",
  gap: 6,
};

const infoLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "#61748e",
};

const infoValue: React.CSSProperties = {
  fontSize: 16,
  color: "#12376b",
  lineHeight: 1.5,
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const blueBtn: React.CSSProperties = {
  background: "#1E5AA8",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
  textDecoration: "none",
};

const greenBtn: React.CSSProperties = {
  background: "#2E8B57",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
  textDecoration: "none",
};

const whiteBtn: React.CSSProperties = {
  background: "#ffffff",
  color: "#12376b",
  border: "1px solid #d4deeb",
  borderRadius: 14,
  padding: "12px 18px",
  fontWeight: 900,
  textDecoration: "none",
};

const tableWrap: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid #d4deeb",
  borderRadius: 16,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 12px",
  background: "#f8fbff",
  borderBottom: "1px solid #d4deeb",
  fontSize: 13,
  color: "#61748e",
};

const td: React.CSSProperties = {
  padding: "12px 10px",
  borderBottom: "1px solid #eef2f7",
  fontSize: 14,
  color: "#12376b",
  verticalAlign: "top",
};
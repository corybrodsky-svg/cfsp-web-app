"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "cfsp_events_v1";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setEvents(JSON.parse(data));
  }, []);

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {/* HEADER */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #d4deeb",
          borderRadius: 24,
          padding: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#12376b" }}>
            Events
          </div>
          <div style={{ color: "#61748e", marginTop: 6 }}>
            View, manage, and expand event details.
          </div>
        </div>

        <Link href="/upload-schedule" style={greenBtn}>
          Upload Schedule
        </Link>
      </div>

      {/* EVENTS LIST */}
      <div style={{ display: "grid", gap: 16 }}>
        {events.length === 0 ? (
          <div style={emptyState}>
            No events yet. Upload a schedule to get started.
          </div>
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={card}>

      {/* TITLE */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#12376b" }}>
          {event.name}
        </div>

        <span style={pill}>
          {event.status || "Draft"}
        </span>
      </div>

      {/* SUMMARY */}
      <div style={summaryGrid}>
        <Stat label="Sessions" value={event.sessions?.length || 0} />
        <Stat label="Rooms" value={event.sessions?.length || 0} />
        <Stat label="SPs" value={`${event.sp_assigned || 0}/${event.sp_needed || 0}`} />
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setExpanded(!expanded)} style={blueBtn}>
          {expanded ? "Hide" : "Expand"}
        </button>

        <Link href={`/events/${event.id}`} style={whiteBtn}>
          View
        </Link>

        <button style={dangerBtn}>Delete</button>
      </div>

      {/* EXPANDED */}
      {expanded && (
        <div style={expandedBox}>
          {(event.sessions || []).map((s: any, i: number) => (
            <div key={i} style={sessionRow}>
              <div>{s.date || "TBD"}</div>
              <div>{s.startTime || "—"} - {s.endTime || "—"}</div>
              <div>{s.room || "—"}</div>
              <div>{s.lead || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div style={statBox}>
      <div style={{ fontSize: 12, color: "#61748e", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

const card = {
  background: "#ffffff",
  border: "1px solid #d4deeb",
  borderRadius: 20,
  padding: 20,
  display: "grid",
  gap: 14,
};

const statBox = {
  background: "#f8fbff",
  borderRadius: 12,
  padding: 12,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
};

const expandedBox = {
  borderTop: "1px solid #d4deeb",
  paddingTop: 12,
  display: "grid",
  gap: 6,
};

const sessionRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr",
  fontSize: 14,
};

const emptyState = {
  padding: 30,
  textAlign: "center" as const,
  border: "1px dashed #d4deeb",
  borderRadius: 16,
  color: "#61748e",
};

const pill = {
  background: "#edf4ff",
  padding: "6px 12px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 12,
};

const blueBtn = {
  background: "#1E5AA8",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 14px",
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
};

const greenBtn = {
  background: "#2E8B57",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 16px",
  textDecoration: "none",
  fontWeight: 800,
};

const whiteBtn = {
  background: "#fff",
  border: "1px solid #d4deeb",
  borderRadius: 10,
  padding: "10px 14px",
  textDecoration: "none",
  fontWeight: 800,
  color: "#12376b",
};

const dangerBtn = {
  background: "#c84a3a",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 14px",
  border: "none",
  fontWeight: 800,
};
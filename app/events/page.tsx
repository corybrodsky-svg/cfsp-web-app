"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteShell from "../components/SiteShell";
import * as planningData from "../lib/planningData";
import {
  EventAssignment,
  ImportedEvent,
  buildImportedEvents,
  loadAssignments,
  slugify,
} from "../lib/cfspData";

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
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginTop: "14px",
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

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  textDecoration: "none",
  border: "1px solid #cfd8e3",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 700,
  color: "#173b6c",
  background: "#ffffff",
};

function countAssignmentsForEvent(event: ImportedEvent, assignments: EventAssignment[]) {
  const eventKey = slugify(event.id);
  const eventNameKey = slugify(event.name);

  const matching = assignments.filter(
    (a) => slugify(a.eventId) === eventKey || slugify(a.eventName) === eventNameKey
  );

  return {
    total: matching.length,
    confirmed: matching.filter((a) => a.confirmed).length,
  };
}

export default function EventsPage() {
  const events = useMemo(() => buildImportedEvents(planningData), []);
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);

  useEffect(() => {
    const refresh = () => setAssignments(loadAssignments());
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  return (
    <SiteShell
      title="Events"
      subtitle="Imported event list with synced SP assignment coverage pulled from each event detail page."
    >
      {events.map((event) => {
        const counts = countAssignmentsForEvent(event, assignments);

        return (
          <div key={event.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "34px", color: "#173b6c" }}>{event.name}</h2>
                <div style={{ marginTop: 8, color: "#64748b" }}>{event.status}</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href={`/events/${event.id}`} style={buttonStyle}>
                  Open Event
                </Link>
                <Link href={`/emails?eventId=${encodeURIComponent(event.id)}`} style={buttonStyle}>
                  Event Email
                </Link>
              </div>
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
                <div style={statValue}>
                  {counts.confirmed} confirmed / {event.spNeeded} needed
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, color: "#173b6c", lineHeight: 1.7 }}>
              <div><strong>Assigned Sim Ops:</strong> {event.simOp || "—"}</div>
              <div><strong>Lead(s):</strong> {event.faculty || "—"}</div>
              <div><strong>Rooms:</strong> {event.roomsLabel || "—"}</div>
              <div><strong>Total Assigned SPs:</strong> {counts.total}</div>
            </div>
          </div>
        );
      })}
    </SiteShell>
  );
}
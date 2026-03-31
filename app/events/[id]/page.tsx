"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  EventBlueprint,
  EventRecord,
  formatIsoDateShort,
  getBlueprintForEvent,
  getEventById,
  getEventDateLabel,
  getEventLeads,
  getEventRooms,
  getEventSimOps,
} from "../../lib/planningData";

const pageStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

const buttonLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: 800,
};

const tableWrapStyle: CSSProperties = {
  overflowX: "auto",
  border: "1px solid rgba(23,61,112,0.10)",
  borderRadius: "18px",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid rgba(23,61,112,0.10)",
  color: "#597391",
  fontSize: "13px",
  background: "rgba(243,248,252,0.85)",
};

const tdStyle: CSSProperties = {
  padding: "12px 10px",
  borderBottom: "1px solid rgba(23,61,112,0.08)",
  color: "#173d70",
  fontSize: "14px",
  verticalAlign: "top",
};

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const eventId = decodeURIComponent(params.id);

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(null);

  useEffect(() => {
    const foundEvent = getEventById(eventId) || null;
    setEvent(foundEvent);
    setBlueprint(foundEvent ? getBlueprintForEvent(foundEvent.id) || null : null);
  }, [eventId]);

  const summary = useMemo(() => {
    if (!event) return null;

    return {
      dates: getEventDateLabel(event),
      rooms: getEventRooms(event),
      simOps: getEventSimOps(event),
      leads: getEventLeads(event),
      sessions: event.sessions || [],
    };
  }, [event]);

  if (!event || !summary) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#173d70",
              marginBottom: "12px",
            }}
          >
            Event not found
          </div>

          <div
            style={{
              color: "#597391",
              lineHeight: 1.7,
              marginBottom: "18px",
            }}
          >
            Import the schedule first, or return to the Events page and open a currently available event.
          </div>

          <Link
            href="/events"
            style={{
              ...buttonLinkStyle,
              background: "#173d70",
              color: "#ffffff",
            }}
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={actionRowStyle}>
        <Link
          href="/blueprints"
          style={{
            ...buttonLinkStyle,
            background: "#173d70",
            color: "#ffffff",
          }}
        >
          Build Blueprint
        </Link>

        <Link
          href="/sim-flow"
          style={{
            ...buttonLinkStyle,
            background: "#1d8a6a",
            color: "#ffffff",
          }}
        >
          Run Sim Flow
        </Link>

        <Link
          href="/events"
          style={{
            ...buttonLinkStyle,
            background: "#ffffff",
            color: "#173d70",
            border: "1px solid rgba(23,61,112,0.12)",
          }}
        >
          Back to Events
        </Link>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#173d70",
              marginBottom: "14px",
            }}
          >
            Event Overview
          </div>

          <div style={{ display: "grid", gap: "10px", color: "#597391", lineHeight: 1.7 }}>
            <div>
              <strong style={{ color: "#173d70" }}>Event:</strong> {event.name}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>Status:</strong> {event.status}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>Dates:</strong> {summary.dates}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>SP Coverage:</strong> {event.sp_assigned} /{" "}
              {event.sp_needed}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>Sessions:</strong> {summary.sessions.length}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>Rooms:</strong>{" "}
              {summary.rooms.length ? summary.rooms.join(", ") : "None shown"}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>Assigned Sim Ops:</strong>{" "}
              {summary.simOps.length ? summary.simOps.join(", ") : "None shown"}
            </div>
            <div>
              <strong style={{ color: "#173d70" }}>Lead(s):</strong>{" "}
              {summary.leads.length ? summary.leads.join(", ") : "None shown"}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#173d70",
              marginBottom: "14px",
            }}
          >
            Blueprint Status
          </div>

          {blueprint ? (
            <div style={{ display: "grid", gap: "10px", color: "#597391", lineHeight: 1.7 }}>
              <div>
                <strong style={{ color: "#173d70" }}>Blueprint:</strong> {blueprint.blueprintName}
              </div>
              <div>
                <strong style={{ color: "#173d70" }}>Type:</strong> {blueprint.eventType}
              </div>
              <div>
                <strong style={{ color: "#173d70" }}>Start Time:</strong> {blueprint.startTime}
              </div>
              <div>
                <strong style={{ color: "#173d70" }}>Rounds:</strong> {blueprint.rounds}
              </div>
              <div>
                <strong style={{ color: "#173d70" }}>Encounter / Transition:</strong>{" "}
                {blueprint.encounterMinutes} / {blueprint.transitionMinutes} minutes
              </div>
              <div>
                <strong style={{ color: "#173d70" }}>Orientation / Debrief:</strong>{" "}
                {blueprint.orientationMinutes} / {blueprint.debriefMinutes} minutes
              </div>
              <div>
                <strong style={{ color: "#173d70" }}>Learners / Rooms:</strong>{" "}
                {blueprint.learnersPerRound} / {blueprint.roomCountOverride}
              </div>
            </div>
          ) : (
            <div style={{ color: "#597391", lineHeight: 1.7 }}>
              No blueprint has been saved for this event yet. Build one next, then use Sim Flow
              to calculate timing against the real uploaded event.
            </div>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#173d70",
            marginBottom: "14px",
          }}
        >
          Imported Session Schedule
        </div>

        {summary.sessions.length === 0 ? (
          <div style={{ color: "#597391" }}>No session rows are attached to this event yet.</div>
        ) : (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Room</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Lead</th>
                  <th style={thStyle}>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {summary.sessions.map((session, index) => (
                  <tr key={session.id || `${event.id}-${index}`}>
                    <td style={tdStyle}>{formatIsoDateShort(session.date)}</td>
                    <td style={tdStyle}>{session.room || session.roomRaw || "TBD"}</td>
                    <td style={tdStyle}>{session.startTime || "TBD"}</td>
                    <td style={tdStyle}>{session.endTime || "TBD"}</td>
                    <td style={tdStyle}>{session.lead || "—"}</td>
                    <td style={tdStyle}>
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
    </div>
  );
}
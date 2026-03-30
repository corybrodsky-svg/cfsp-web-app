"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";
import {
  EventBlueprint,
  EventRecord,
  buildDefaultBlueprint,
  buildSimFlow,
  formatIsoDateShort,
  getBlueprintForEvent,
  getEventDateLabel,
  getEventRooms,
  getSortedEvents,
  getEventSimOps,
} from "../lib/planningData";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.95fr 1.05fr",
  gap: "18px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(23,61,112,0.16)",
  fontSize: "15px",
  boxSizing: "border-box",
};

function getKindBadge(kind: string): CSSProperties {
  if (kind === "encounter") {
    return {
      background: "rgba(23,61,112,0.10)",
      color: "#173d70",
      border: "1px solid rgba(23,61,112,0.12)",
    };
  }

  if (kind === "transition") {
    return {
      background: "rgba(217,119,6,0.10)",
      color: "#b45309",
      border: "1px solid rgba(217,119,6,0.14)",
    };
  }

  return {
    background: "rgba(29,138,106,0.10)",
    color: "#1d8a6a",
    border: "1px solid rgba(29,138,106,0.14)",
  };
}

export default function SimFlowPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(null);

  useEffect(() => {
    const nextEvents = getSortedEvents();
    setEvents(nextEvents);

    const fallbackId = nextEvents[0]?.id || "";
    setSelectedEventId(fallbackId);
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setEvent(null);
      setBlueprint(null);
      return;
    }

    const nextEvent = events.find((item) => item.id === selectedEventId) || null;
    setEvent(nextEvent);

    if (!nextEvent) {
      setBlueprint(null);
      return;
    }

    const existing = getBlueprintForEvent(nextEvent.id);
    setBlueprint(existing || buildDefaultBlueprint(nextEvent));
  }, [selectedEventId, events]);

  const output = useMemo(() => {
    if (!event || !blueprint) return null;
    return buildSimFlow(event, blueprint);
  }, [event, blueprint]);

  return (
    <SiteShell
      title="Sim Flow Calculator"
      subtitle="Calculate timing from the real imported event and its saved blueprint instead of disconnected placeholder values."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Event + Blueprint Inputs
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Select Event</div>
              <select
                style={inputStyle}
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.length === 0 ? <option value="">No imported events</option> : null}
                {events.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {getEventDateLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            {event && blueprint ? (
              <>
                <div style={{ color: "#597391", lineHeight: 1.7 }}>
                  <strong style={{ color: "#173d70" }}>Dates:</strong> {getEventDateLabel(event)}
                  <br />
                  <strong style={{ color: "#173d70" }}>Imported Sessions:</strong> {(event.sessions || []).length}
                  <br />
                  <strong style={{ color: "#173d70" }}>Rooms:</strong> {getEventRooms(event).join(", ") || "None shown"}
                  <br />
                  <strong style={{ color: "#173d70" }}>Sim Ops:</strong> {getEventSimOps(event).join(", ") || "None shown"}
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Blueprint</div>
                    <input style={inputStyle} value={blueprint.blueprintName} readOnly />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Start</div>
                      <input style={inputStyle} value={blueprint.startTime} readOnly />
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Rounds</div>
                      <input style={inputStyle} value={String(blueprint.rounds)} readOnly />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Encounter</div>
                      <input style={inputStyle} value={`${blueprint.encounterMinutes} min`} readOnly />
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Transition</div>
                      <input style={inputStyle} value={`${blueprint.transitionMinutes} min`} readOnly />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link
                      href="/blueprints"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        borderRadius: "14px",
                        padding: "12px 16px",
                        background: "#173d70",
                        color: "#ffffff",
                        fontWeight: 800,
                      }}
                    >
                      Edit Blueprint
                    </Link>

                    <Link
                      href={`/events/${encodeURIComponent(event.id)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        borderRadius: "14px",
                        padding: "12px 16px",
                        background: "#ffffff",
                        color: "#173d70",
                        border: "1px solid rgba(23,61,112,0.12)",
                        fontWeight: 800,
                      }}
                    >
                      Open Event
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "#597391" }}>No imported event is available yet.</div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Calculated Sim Flow
          </div>

          {!output ? (
            <div style={{ color: "#597391" }}>Choose an event to calculate flow.</div>
          ) : (
            <>
              <div style={{ display: "grid", gap: "10px", marginBottom: "18px", color: "#597391" }}>
                <div><strong style={{ color: "#173d70" }}>Imported Event Dates:</strong> {output.importedDateLabel}</div>
                <div><strong style={{ color: "#173d70" }}>Estimated End Time:</strong> {output.endTime}</div>
                <div><strong style={{ color: "#173d70" }}>Total Runtime:</strong> {output.totalMinutes} minutes</div>
                <div><strong style={{ color: "#173d70" }}>Room Pressure:</strong> {output.roomPressure}</div>
                <div><strong style={{ color: "#173d70" }}>Approx. SP Load Per Round:</strong> {output.approxSPLoad}</div>
                <div><strong style={{ color: "#173d70" }}>Rooms Used:</strong> {output.roomCount}</div>
                <div><strong style={{ color: "#173d70" }}>Learners Per Round:</strong> {output.learnersPerRound}</div>
              </div>

              <div style={{ display: "grid", gap: "10px", marginBottom: "18px" }}>
                {output.rows.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    style={{
                      borderRadius: "18px",
                      padding: "14px 16px",
                      background: "rgba(243,248,252,0.85)",
                      border: "1px solid rgba(23,61,112,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 800, color: "#173d70" }}>{row.label}</div>
                      <div
                        style={{
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontWeight: 800,
                          fontSize: "12px",
                          ...getKindBadge(row.kind),
                        }}
                      >
                        {row.kind}
                      </div>
                    </div>
                    <div style={{ color: "#597391", marginTop: "6px", lineHeight: 1.6 }}>
                      {row.start} → {row.end}
                    </div>
                  </div>
                ))}
              </div>

              {event && (event.sessions || []).length ? (
                <>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#173d70", marginBottom: "12px" }}>
                    Imported Schedule Reference
                  </div>

                  <div style={{ display: "grid", gap: "10px" }}>
                    {(event.sessions || []).slice(0, 8).map((session, index) => (
                      <div
                        key={session.id || `${event.id}-${index}`}
                        style={{
                          borderRadius: "18px",
                          padding: "14px 16px",
                          background: "#ffffff",
                          border: "1px solid rgba(23,61,112,0.08)",
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "#173d70" }}>
                          {formatIsoDateShort(session.date)} • {session.room || session.roomRaw || "TBD"}
                        </div>
                        <div style={{ color: "#597391", marginTop: "6px", lineHeight: 1.6 }}>
                          {session.startTime || "TBD"} → {session.endTime || "TBD"}
                          <br />
                          Lead: {session.lead || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
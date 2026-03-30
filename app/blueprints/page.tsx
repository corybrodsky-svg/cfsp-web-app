"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";
import {
  BlueprintSegment,
  EventBlueprint,
  EventRecord,
  buildDefaultBlueprint,
  getBlueprintForEvent,
  getEventDateLabel,
  getEventRooms,
  getSortedEvents,
  inferEncounterMinutes,
  inferEventStartTime,
  inferLearnersPerRound,
  inferRoomCount,
  saveBlueprint,
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

const segmentStyle: CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  border: "1px solid rgba(23,61,112,0.08)",
  background: "rgba(243,248,252,0.85)",
};

function makeSegment(name = "New Segment", duration = 10, roomType = "Exam Room"): BlueprintSegment {
  return {
    id: `segment-${Math.random().toString(36).slice(2, 10)}`,
    name,
    duration,
    roomType,
    notes: "",
  };
}

export default function BlueprintsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [blueprint, setBlueprint] = useState<EventBlueprint | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const nextEvents = getSortedEvents();
    setEvents(nextEvents);

    const fallbackId = nextEvents[0]?.id || "";
    setSelectedEventId(fallbackId);

    if (fallbackId) {
      const existing = getBlueprintForEvent(fallbackId);
      const event = nextEvents.find((item) => item.id === fallbackId);
      setBlueprint(existing || (event ? buildDefaultBlueprint(event) : null));
    } else {
      setBlueprint(null);
    }
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    const event = events.find((item) => item.id === selectedEventId);
    if (!event) {
      setBlueprint(null);
      return;
    }

    const existing = getBlueprintForEvent(selectedEventId);
    setBlueprint(existing || buildDefaultBlueprint(event));
  }, [selectedEventId, events]);

  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  function updateBlueprintField<K extends keyof EventBlueprint>(key: K, value: EventBlueprint[K]) {
    setBlueprint((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateSegment(segmentId: string, updates: Partial<BlueprintSegment>) {
    setBlueprint((prev) =>
      prev
        ? {
            ...prev,
            segments: prev.segments.map((segment) =>
              segment.id === segmentId ? { ...segment, ...updates } : segment
            ),
          }
        : prev
    );
  }

  function addSegment() {
    setBlueprint((prev) =>
      prev
        ? {
            ...prev,
            segments: [...prev.segments, makeSegment()],
          }
        : prev
    );
  }

  function removeSegment(segmentId: string) {
    setBlueprint((prev) =>
      prev
        ? {
            ...prev,
            segments: prev.segments.filter((segment) => segment.id !== segmentId),
          }
        : prev
    );
  }

  function resetFromEvent() {
    if (!selectedEvent) return;
    setBlueprint(buildDefaultBlueprint(selectedEvent));
    setSavedMessage("Blueprint reset from imported event defaults.");
    setTimeout(() => setSavedMessage(""), 1800);
  }

  function handleSave() {
    if (!blueprint || !selectedEvent) return;
    saveBlueprint({
      ...blueprint,
      eventId: selectedEvent.id,
    });
    setSavedMessage(`Saved blueprint for ${selectedEvent.name}.`);
    setTimeout(() => setSavedMessage(""), 2200);
  }

  return (
    <SiteShell
      title="Blueprint Builder"
      subtitle="Build the operational structure of a real imported event, then hand it directly to Sim Flow."
    >
      {savedMessage ? (
        <div
          style={{
            ...cardStyle,
            background: "#edf9f0",
            border: "1px solid #b7dfc4",
            color: "#14532d",
            fontWeight: 800,
          }}
        >
          {savedMessage}
        </div>
      ) : null}

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Blueprint settings
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
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} — {getEventDateLabel(event)}
                  </option>
                ))}
              </select>
            </div>

            {blueprint ? (
              <>
                <div>
                  <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                    Blueprint Name
                  </div>
                  <input
                    style={inputStyle}
                    value={blueprint.blueprintName}
                    onChange={(e) => updateBlueprintField("blueprintName", e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                    Event Type
                  </div>
                  <select
                    style={inputStyle}
                    value={blueprint.eventType}
                    onChange={(e) => updateBlueprintField("eventType", e.target.value)}
                  >
                    <option>OSCE</option>
                    <option>IPE</option>
                    <option>PA Skills</option>
                    <option>SLP Simulation</option>
                    <option>Interview / Counseling</option>
                    <option>Custom</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Start Time
                    </div>
                    <input
                      style={inputStyle}
                      type="time"
                      value={blueprint.startTime}
                      onChange={(e) => updateBlueprintField("startTime", e.target.value)}
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Number of Rounds
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={blueprint.rounds}
                      onChange={(e) => updateBlueprintField("rounds", Number(e.target.value || 1))}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Encounter Minutes
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={blueprint.encounterMinutes}
                      onChange={(e) =>
                        updateBlueprintField("encounterMinutes", Number(e.target.value || 1))
                      }
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Transition Minutes
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="0"
                      value={blueprint.transitionMinutes}
                      onChange={(e) =>
                        updateBlueprintField("transitionMinutes", Number(e.target.value || 0))
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Orientation Minutes
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="0"
                      value={blueprint.orientationMinutes}
                      onChange={(e) =>
                        updateBlueprintField("orientationMinutes", Number(e.target.value || 0))
                      }
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Debrief Minutes
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="0"
                      value={blueprint.debriefMinutes}
                      onChange={(e) =>
                        updateBlueprintField("debriefMinutes", Number(e.target.value || 0))
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Learners Per Round
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={blueprint.learnersPerRound}
                      onChange={(e) =>
                        updateBlueprintField("learnersPerRound", Number(e.target.value || 1))
                      }
                    />
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                      Rooms Available
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={blueprint.roomCountOverride}
                      onChange={(e) =>
                        updateBlueprintField("roomCountOverride", Number(e.target.value || 1))
                      }
                    />
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                    Notes
                  </div>
                  <textarea
                    style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                    value={blueprint.notes}
                    onChange={(e) => updateBlueprintField("notes", e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div style={{ color: "#597391" }}>No imported event selected.</div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70" }}>Segments</div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={addSegment}
                style={{
                  border: "none",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #173d70 0%, #1d8a6a 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Add Segment
              </button>

              <button
                type="button"
                onClick={resetFromEvent}
                style={{
                  border: "1px solid rgba(23,61,112,0.12)",
                  borderRadius: "14px",
                  padding: "12px 16px",
                  background: "#ffffff",
                  color: "#173d70",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Reset Defaults
              </button>
            </div>
          </div>

          {selectedEvent ? (
            <div
              style={{
                ...segmentStyle,
                marginBottom: "14px",
                background: "rgba(237,244,251,0.9)",
              }}
            >
              <div style={{ fontSize: "19px", fontWeight: 800, color: "#173d70" }}>
                {selectedEvent.name}
              </div>
              <div style={{ color: "#597391", lineHeight: 1.7, marginTop: "6px" }}>
                Dates: {getEventDateLabel(selectedEvent)}
                <br />
                Sessions: {(selectedEvent.sessions || []).length}
                <br />
                Rooms: {getEventRooms(selectedEvent).join(", ") || "None shown"}
                <br />
                Imported Defaults: start {inferEventStartTime(selectedEvent)} • encounter{" "}
                {inferEncounterMinutes(selectedEvent)} min • rooms {inferRoomCount(selectedEvent)} • learners{" "}
                {inferLearnersPerRound(selectedEvent)}
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: "12px" }}>
            {(blueprint?.segments || []).map((segment, index) => (
              <div key={segment.id} style={segmentStyle}>
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#173d70" }}>
                    Segment {index + 1}
                  </div>

                  <input
                    style={inputStyle}
                    value={segment.name}
                    onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                    placeholder="Segment name"
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={segment.duration}
                      onChange={(e) =>
                        updateSegment(segment.id, { duration: Number(e.target.value || 1) })
                      }
                      placeholder="Minutes"
                    />

                    <input
                      style={inputStyle}
                      value={segment.roomType}
                      onChange={(e) => updateSegment(segment.id, { roomType: e.target.value })}
                      placeholder="Room type"
                    />
                  </div>

                  <input
                    style={inputStyle}
                    value={segment.notes || ""}
                    onChange={(e) => updateSegment(segment.id, { notes: e.target.value })}
                    placeholder="Optional notes"
                  />

                  <div>
                    <button
                      type="button"
                      onClick={() => removeSegment(segment.id)}
                      style={{
                        border: "1px solid rgba(190,24,93,0.16)",
                        borderRadius: "12px",
                        padding: "10px 14px",
                        background: "#fff1f2",
                        color: "#be185d",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Remove Segment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "18px" }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 18px",
                background: "#173d70",
                color: "#ffffff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Save Blueprint
            </button>

            {selectedEvent ? (
              <Link
                href="/sim-flow"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  background: "#1d8a6a",
                  color: "#ffffff",
                  fontWeight: 800,
                }}
              >
                Open Sim Flow
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
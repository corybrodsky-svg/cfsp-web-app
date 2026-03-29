"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AssignmentDraft,
  events as baseEvents,
  EventItem,
  getStoredAssignments,
  getSPById,
  resolveSimOpName,
} from "../lib/mockData";

const EVENT_OVERRIDES_STORAGE_KEY = "cfsp_event_overrides";

type EventOverride = Partial<
  Pick<
    EventItem,
    | "name"
    | "status"
    | "dateText"
    | "spNeeded"
    | "visibility"
    | "location"
    | "notes"
    | "leadSimOp"
    | "assignedStaff"
    | "associatedStaff"
  >
>;

type DisplayEvent = EventItem & {
  assignedNames: string[];
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #edf4fb 0%, #dfeaf7 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #12233f 0%, #173d70 100%)",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(18, 35, 63, 0.22)",
  marginBottom: "18px",
};

const heroTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  alignItems: "flex-start",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "34px",
  fontWeight: 900,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "rgba(255,255,255,0.82)",
  fontSize: "15px",
};

const navRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const lightButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  background: "#ffffff",
  color: "#173d70",
  fontWeight: 800,
};

const darkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.15)",
  color: "#ffffff",
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.22)",
};

const toolbarStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8e3f1",
  borderRadius: "20px",
  padding: "18px",
  boxShadow: "0 12px 28px rgba(20, 40, 90, 0.08)",
  marginBottom: "18px",
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: "16px",
  border: "1px solid #cfd9e8",
  fontSize: "15px",
  boxSizing: "border-box",
  background: "#fbfdff",
};

const statRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const pillStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f3f7fc",
  border: "1px solid #d7e1ee",
  fontSize: "13px",
  fontWeight: 800,
  color: "#35506f",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "22px",
  padding: "22px",
  border: "1px solid #d9e3f1",
  boxShadow: "0 14px 28px rgba(20, 40, 90, 0.08)",
};

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const eventTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
  fontWeight: 900,
  color: "#12233f",
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#edf4fb",
  border: "1px solid #d9e3f1",
  color: "#173d70",
  fontWeight: 800,
  fontSize: "13px",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const infoCardStyle: React.CSSProperties = {
  border: "1px solid #dde6f2",
  borderRadius: "16px",
  padding: "14px",
  background: "#f8fbff",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#6b7c93",
  marginBottom: "6px",
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  color: "#24364d",
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const sectionStyle: React.CSSProperties = {
  marginTop: "16px",
  border: "1px solid #dde6f2",
  borderRadius: "16px",
  padding: "14px",
  background: "#fcfdff",
};

const listStyle: React.CSSProperties = {
  margin: "8px 0 0 18px",
  color: "#24364d",
  lineHeight: 1.7,
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #cdd8e8",
  background: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
  color: "#173d70",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#173d70",
  color: "#ffffff",
  border: "1px solid #173d70",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  fontSize: "14px",
  boxSizing: "border-box",
  background: "#ffffff",
};

const editorGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginTop: "14px",
};

function getEventOverrides(): Record<string, EventOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(EVENT_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveEventOverrides(data: Record<string, EventOverride>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EVENT_OVERRIDES_STORAGE_KEY, JSON.stringify(data));
}

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [assignments, setAssignments] = useState<AssignmentDraft[]>([]);
  const [overrides, setOverrides] = useState<Record<string, EventOverride>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<EventItem["status"]>("Needs SPs");
  const [editDateText, setEditDateText] = useState("");
  const [editSpNeeded, setEditSpNeeded] = useState("0");
  const [editVisibility, setEditVisibility] = useState<EventItem["visibility"]>("Team");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLeadSimOp, setEditLeadSimOp] = useState("");
  const [editAssignedStaff, setEditAssignedStaff] = useState("");
  const [editAssociatedStaff, setEditAssociatedStaff] = useState("");

  useEffect(() => {
    setAssignments(getStoredAssignments());
    setOverrides(getEventOverrides());

    const refresh = () => {
      setAssignments(getStoredAssignments());
      setOverrides(getEventOverrides());
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("cfsp-assignments-updated", refresh as EventListener);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(
        "cfsp-assignments-updated",
        refresh as EventListener
      );
    };
  }, []);

  const displayEvents = useMemo<DisplayEvent[]>(() => {
    return baseEvents.map((baseEvent) => {
      const merged: EventItem = {
        ...baseEvent,
        ...(overrides[baseEvent.id] || {}),
      };

      const baseAssigned = new Set(merged.assignedSPIds || []);
      const draftMatches = assignments.filter(
        (item) => item.eventMode === "existing" && item.eventId === merged.id
      );

      draftMatches.forEach((item) => baseAssigned.add(item.spId));

      const assignedNames = Array.from(baseAssigned).map((spId) => {
        const found = getSPById(spId);
        const fallback = draftMatches.find((item) => item.spId === spId)?.spName;
        return found?.fullName || fallback || spId;
      });

      return {
        ...merged,
        spAssigned: assignedNames.length,
        assignedNames,
        leadSimOp: merged.leadSimOp ? resolveSimOpName(merged.leadSimOp) : "",
        assignedStaff: (merged.assignedStaff || []).map(resolveSimOpName),
        associatedStaff: (merged.associatedStaff || []).map(resolveSimOpName),
      };
    });
  }, [assignments, overrides]);

  const placeholderGroups = useMemo(() => {
    const placeholderAssignments = assignments.filter(
      (item) => item.eventMode === "placeholder"
    );

    const groups = new Map<
      string,
      { eventName: string; dateText: string; assignedNames: string[]; notes: string[] }
    >();

    placeholderAssignments.forEach((item) => {
      const key = `${item.eventName}__${item.dateText || ""}`;
      const existing = groups.get(key);

      if (existing) {
        if (!existing.assignedNames.includes(item.spName)) {
          existing.assignedNames.push(item.spName);
        }
        if (item.notes) existing.notes.push(item.notes);
      } else {
        groups.set(key, {
          eventName: item.eventName,
          dateText: item.dateText || "",
          assignedNames: [item.spName],
          notes: item.notes ? [item.notes] : [],
        });
      }
    });

    return Array.from(groups.values());
  }, [assignments]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return displayEvents;

    return displayEvents.filter((event) =>
      [
        event.name,
        event.status,
        event.dateText,
        event.location,
        event.notes,
        event.leadSimOp,
        ...(event.assignedStaff || []),
        ...(event.associatedStaff || []),
        ...event.assignedNames,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [displayEvents, query]);

  const filteredPlaceholderGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return placeholderGroups;

    return placeholderGroups.filter((item) =>
      [item.eventName, item.dateText, ...item.assignedNames, ...item.notes]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [placeholderGroups, query]);

  function startEdit(event: DisplayEvent) {
    setEditingId(event.id);
    setEditName(event.name);
    setEditStatus(event.status);
    setEditDateText(event.dateText);
    setEditSpNeeded(String(event.spNeeded));
    setEditVisibility(event.visibility);
    setEditLocation(event.location);
    setEditNotes(event.notes);
    setEditLeadSimOp(event.leadSimOp || "");
    setEditAssignedStaff((event.assignedStaff || []).join(", "));
    setEditAssociatedStaff((event.associatedStaff || []).join(", "));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(eventId: string) {
    const nextOverrides = {
      ...overrides,
      [eventId]: {
        name: editName.trim(),
        status: editStatus,
        dateText: editDateText.trim(),
        spNeeded: Number(editSpNeeded) || 0,
        visibility: editVisibility,
        location: editLocation.trim(),
        notes: editNotes.trim(),
        leadSimOp: editLeadSimOp.trim(),
        assignedStaff: editAssignedStaff
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        associatedStaff: editAssociatedStaff
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    };

    setOverrides(nextOverrides);
    saveEventOverrides(nextOverrides);
    setEditingId(null);
    setSaveMessage("Event changes saved.");
    setTimeout(() => setSaveMessage(""), 1800);
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={heroTopStyle}>
            <div>
              <h1 style={titleStyle}>Events</h1>
              <div style={subtitleStyle}>
                Edit events, review staffing, and see live SP assignment results.
              </div>
            </div>

            <div style={navRowStyle}>
              <Link href="/admin" style={lightButtonStyle}>
                Admin
              </Link>
              <Link href="/sp-directory" style={lightButtonStyle}>
                SP Directory
              </Link>
              <Link href="/login" style={darkButtonStyle}>
                Login
              </Link>
            </div>
          </div>
        </div>

        <div style={toolbarStyle}>
          <input
            type="text"
            placeholder="Search by event, staff, assigned SP, status, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchStyle}
          />

          <div style={statRowStyle}>
            <span style={pillStyle}>Base Events: {baseEvents.length}</span>
            <span style={pillStyle}>Assignment Drafts: {assignments.length}</span>
            <span style={pillStyle}>Placeholder Events: {placeholderGroups.length}</span>
          </div>
        </div>

        {saveMessage ? (
          <div style={{ ...cardStyle, marginBottom: "16px" }}>{saveMessage}</div>
        ) : null}

        <div style={gridStyle}>
          {filteredEvents.map((event) => (
            <div key={event.id} style={cardStyle}>
              <div style={cardTopStyle}>
                <h2 style={eventTitleStyle}>{event.name}</h2>

                <div style={badgeRowStyle}>
                  <div style={badgeStyle}>{event.status}</div>
                  <div style={badgeStyle}>
                    {event.spAssigned} / {event.spNeeded} SPs
                  </div>
                  <div style={badgeStyle}>{event.location}</div>
                </div>
              </div>

              <div style={infoGridStyle}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Date</div>
                  <p style={valueStyle}>{event.dateText}</p>
                </div>

                <div style={infoCardStyle}>
                  <div style={labelStyle}>Lead Sim Op</div>
                  <p style={valueStyle}>{event.leadSimOp || "—"}</p>
                </div>

                <div style={infoCardStyle}>
                  <div style={labelStyle}>Assigned Staff</div>
                  <p style={valueStyle}>
                    {event.assignedStaff?.length ? event.assignedStaff.join(", ") : "—"}
                  </p>
                </div>

                <div style={infoCardStyle}>
                  <div style={labelStyle}>Associated Staff</div>
                  <p style={valueStyle}>
                    {event.associatedStaff?.length
                      ? event.associatedStaff.join(", ")
                      : "—"}
                  </p>
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={labelStyle}>Assigned SPs</div>
                {event.assignedNames.length ? (
                  <ul style={listStyle}>
                    {event.assignedNames.map((name) => (
                      <li key={`${event.id}-${name}`}>{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={valueStyle}>No SPs assigned yet.</p>
                )}
              </div>

              <div style={sectionStyle}>
                <div style={labelStyle}>Notes</div>
                <p style={valueStyle}>{event.notes || "—"}</p>
              </div>

              <div style={buttonRowStyle}>
                <button type="button" style={buttonStyle} onClick={() => startEdit(event)}>
                  Edit Event
                </button>
              </div>

              {editingId === event.id ? (
                <div style={sectionStyle}>
                  <div style={labelStyle}>Edit Event</div>

                  <div style={editorGridStyle}>
                    <input
                      style={inputStyle}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Event name"
                    />

                    <select
                      style={inputStyle}
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as EventItem["status"])}
                    >
                      <option>Needs SPs</option>
                      <option>Scheduled</option>
                      <option>In Progress</option>
                      <option>Complete</option>
                    </select>

                    <input
                      style={inputStyle}
                      value={editDateText}
                      onChange={(e) => setEditDateText(e.target.value)}
                      placeholder="Date text"
                    />

                    <input
                      style={inputStyle}
                      value={editSpNeeded}
                      onChange={(e) => setEditSpNeeded(e.target.value)}
                      placeholder="SP needed"
                    />

                    <select
                      style={inputStyle}
                      value={editVisibility}
                      onChange={(e) =>
                        setEditVisibility(e.target.value as EventItem["visibility"])
                      }
                    >
                      <option>Team</option>
                      <option>Personal</option>
                    </select>

                    <input
                      style={inputStyle}
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location"
                    />

                    <input
                      style={inputStyle}
                      value={editLeadSimOp}
                      onChange={(e) => setEditLeadSimOp(e.target.value)}
                      placeholder="Lead Sim Op"
                    />

                    <input
                      style={inputStyle}
                      value={editAssignedStaff}
                      onChange={(e) => setEditAssignedStaff(e.target.value)}
                      placeholder="Assigned staff, comma separated"
                    />

                    <input
                      style={inputStyle}
                      value={editAssociatedStaff}
                      onChange={(e) => setEditAssociatedStaff(e.target.value)}
                      placeholder="Associated staff, comma separated"
                    />
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <textarea
                      style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Event notes"
                    />
                  </div>

                  <div style={buttonRowStyle}>
                    <button
                      type="button"
                      style={primaryButtonStyle}
                      onClick={() => saveEdit(event.id)}
                    >
                      Save Event Changes
                    </button>

                    <button type="button" style={buttonStyle} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          {filteredPlaceholderGroups.map((item) => (
            <div key={`${item.eventName}-${item.dateText}`} style={cardStyle}>
              <div style={cardTopStyle}>
                <h2 style={eventTitleStyle}>{item.eventName}</h2>

                <div style={badgeRowStyle}>
                  <div style={badgeStyle}>Placeholder</div>
                  <div style={badgeStyle}>{item.dateText || "Date TBD"}</div>
                  <div style={badgeStyle}>{item.assignedNames.length} SPs</div>
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={labelStyle}>Assigned SPs</div>
                <ul style={listStyle}>
                  {item.assignedNames.map((name) => (
                    <li key={`${item.eventName}-${name}`}>{name}</li>
                  ))}
                </ul>
              </div>

              {item.notes.length ? (
                <div style={sectionStyle}>
                  <div style={labelStyle}>Notes</div>
                  <ul style={listStyle}>
                    {item.notes.map((note, index) => (
                      <li key={`${item.eventName}-note-${index}`}>{note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
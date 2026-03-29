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

const assignmentListStyle: React.CSSProperties = {
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

type DisplayEvent = EventItem & {
  assignedNames: string[];
};

type PlaceholderGroup = {
  eventName: string;
  dateText: string;
  assignedNames: string[];
  notes: string[];
};

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [assignments, setAssignments] = useState<AssignmentDraft[]>([]);

  useEffect(() => {
    setAssignments(getStoredAssignments());
  }, []);

  const displayEvents = useMemo<DisplayEvent[]>(() => {
    return baseEvents.map((event) => {
      const baseAssigned = new Set(event.assignedSPIds || []);

      const draftMatches = assignments.filter(
        (item) => item.eventMode === "existing" && item.eventId === event.id
      );

      draftMatches.forEach((item) => baseAssigned.add(item.spId));

      const assignedNames = Array.from(baseAssigned).map((spId) => {
        const found = getSPById(spId);
        const draftName = draftMatches.find((item) => item.spId === spId)?.spName;
        return found?.fullName || draftName || spId;
      });

      return {
        ...event,
        spAssigned: assignedNames.length,
        assignedNames,
        leadSimOp: event.leadSimOp ? resolveSimOpName(event.leadSimOp) : "",
        assignedStaff: (event.assignedStaff || []).map(resolveSimOpName),
        associatedStaff: (event.associatedStaff || []).map(resolveSimOpName),
      };
    });
  }, [assignments]);

  const placeholderGroups = useMemo<PlaceholderGroup[]>(() => {
    const placeholderAssignments = assignments.filter(
      (item) => item.eventMode === "placeholder"
    );

    const groups = new Map<string, PlaceholderGroup>();

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

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={heroTopStyle}>
            <div>
              <h1 style={titleStyle}>Events</h1>
              <div style={subtitleStyle}>
                Live event view with SP assignments pulled into the roster.
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
                    {event.assignedStaff?.length
                      ? event.assignedStaff.join(", ")
                      : "—"}
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

              <div style={assignmentListStyle}>
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

              <div style={assignmentListStyle}>
                <div style={labelStyle}>Notes</div>
                <p style={valueStyle}>{event.notes || "—"}</p>
              </div>
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

              <div style={assignmentListStyle}>
                <div style={labelStyle}>Assigned SPs</div>
                <ul style={listStyle}>
                  {item.assignedNames.map((name) => (
                    <li key={`${item.eventName}-${name}`}>{name}</li>
                  ))}
                </ul>
              </div>

              {item.notes.length ? (
                <div style={assignmentListStyle}>
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
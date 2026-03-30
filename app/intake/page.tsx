"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "18px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(23,61,112,0.16)",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  fontWeight: 700,
  color: "#173d70",
  marginBottom: "8px",
};

const buttonStyle: CSSProperties = {
  border: "none",
  borderRadius: "14px",
  padding: "14px 18px",
  background: "linear-gradient(135deg, #173d70 0%, #1d8a6a 100%)",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

export default function IntakePage() {
  const [form, setForm] = useState({
    eventName: "",
    program: "PA Program",
    eventStatus: "Needs SPs",
    primaryDate: "",
    startTime: "",
    endTime: "",
    faculty: "",
    simOp: "",
    location: "",
    zoomLink: "",
    rooms: "",
    cases: "",
    spNeeded: "0",
    notes: "",
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const summary = useMemo(() => {
    const count = Number(form.spNeeded || 0);
    const roomCount = form.rooms
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean).length;
    return {
      eventName: form.eventName || "Untitled Session",
      staffingLabel: count > 0 ? `${count} SPs requested` : "No SP count set",
      roomLabel: roomCount > 0 ? `${roomCount} room entries` : "No rooms entered",
    };
  }, [form]);

  return (
    <SiteShell
      title="Session Intake"
      subtitle="Turn raw session details into structured event data that can power assignments, blueprints, sim flow, and automated emails."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            New intake form
          </div>

          <div style={formGridStyle}>
            <div>
              <div style={labelStyle}>Event Name</div>
              <input
                style={inputStyle}
                value={form.eventName}
                onChange={(e) => updateField("eventName", e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <div style={labelStyle}>Program</div>
              <select
                style={inputStyle}
                value={form.program}
                onChange={(e) => updateField("program", e.target.value)}
              >
                <option>PA Program</option>
                <option>College of Medicine</option>
                <option>Speech-Language Pathology</option>
                <option>IPE</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <div style={labelStyle}>Status</div>
              <select
                style={inputStyle}
                value={form.eventStatus}
                onChange={(e) => updateField("eventStatus", e.target.value)}
              >
                <option>Needs SPs</option>
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Complete</option>
              </select>
            </div>

            <div>
              <div style={labelStyle}>Primary Date</div>
              <input
                style={inputStyle}
                type="date"
                value={form.primaryDate}
                onChange={(e) => updateField("primaryDate", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>Start Time</div>
              <input
                style={inputStyle}
                type="time"
                value={form.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>End Time</div>
              <input
                style={inputStyle}
                type="time"
                value={form.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
              />
            </div>

            <div>
              <div style={labelStyle}>Faculty</div>
              <input
                style={inputStyle}
                value={form.faculty}
                onChange={(e) => updateField("faculty", e.target.value)}
                placeholder="Cara Orr, Michelle Fischer"
              />
            </div>

            <div>
              <div style={labelStyle}>Sim Op / Staff Lead</div>
              <input
                style={inputStyle}
                value={form.simOp}
                onChange={(e) => updateField("simOp", e.target.value)}
                placeholder="Assigned Sim Staff"
              />
            </div>

            <div>
              <div style={labelStyle}>Location</div>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Elkins Park / Center City / Zoom"
              />
            </div>

            <div>
              <div style={labelStyle}>Zoom Link</div>
              <input
                style={inputStyle}
                value={form.zoomLink}
                onChange={(e) => updateField("zoomLink", e.target.value)}
                placeholder="Paste Zoom link if needed"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={labelStyle}>Rooms</div>
              <input
                style={inputStyle}
                value={form.rooms}
                onChange={(e) => updateField("rooms", e.target.value)}
                placeholder="Exam 1, Exam 2, Flex A, Debrief Room"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={labelStyle}>Cases / Segments</div>
              <textarea
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                value={form.cases}
                onChange={(e) => updateField("cases", e.target.value)}
                placeholder="List cases, encounters, segments, or agenda blocks"
              />
            </div>

            <div>
              <div style={labelStyle}>SPs Needed</div>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={form.spNeeded}
                onChange={(e) => updateField("spNeeded", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={labelStyle}>Notes</div>
              <textarea
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Add logistics, faculty notes, prep requirements, or session details"
              />
            </div>
          </div>

          <div style={{ marginTop: "18px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" style={buttonStyle}>
              Save Intake
            </button>
            <button
              type="button"
              style={{ ...buttonStyle, background: "#ffffff", color: "#173d70", border: "1px solid rgba(23,61,112,0.12)" }}
            >
              Save + Open Blueprint
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Intake Summary
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ color: "#5b7593", fontWeight: 700 }}>Event</div>
              <div style={{ color: "#173d70", fontWeight: 800, fontSize: "20px", marginTop: "6px" }}>
                {summary.eventName}
              </div>
            </div>

            <div>
              <div style={{ color: "#5b7593", fontWeight: 700 }}>Staffing</div>
              <div style={{ color: "#173d70", marginTop: "6px" }}>{summary.staffingLabel}</div>
            </div>

            <div>
              <div style={{ color: "#5b7593", fontWeight: 700 }}>Rooms</div>
              <div style={{ color: "#173d70", marginTop: "6px" }}>{summary.roomLabel}</div>
            </div>

            <div>
              <div style={{ color: "#5b7593", fontWeight: 700 }}>Why this matters</div>
              <div style={{ color: "#597391", lineHeight: 1.7, marginTop: "6px" }}>
                This page is the foundation for replacing Session Intake from the Excel version.
                The event data created here should later populate the event record, blueprint,
                sim flow calculations, and email merge fields.
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
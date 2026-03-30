"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.9fr 1.1fr",
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

export default function EmailsPage() {
  const [template, setTemplate] = useState("Event Prep");
  const [eventName, setEventName] = useState("PA / SLP IPE Virtual");
  const [eventDate, setEventDate] = useState("Thursday, April 9, 2026");
  const [eventTime, setEventTime] = useState("10:00 AM - 12:00 PM");
  const [zoom, setZoom] = useState("https://drexel.zoom.us/j/example");
  const [faculty, setFaculty] = useState("Cara Orr, Michelle Fischer, Bob Serrano, Kelly Salmon");
  const [simStaff, setSimStaff] = useState("Cory Brodsky");

  const body = useMemo(() => {
    if (template === "Training") {
      return `SPs,

In preparation for ${eventName}, please review the following training details:

• Date: ${eventDate}
• Time: ${eventTime}
• Zoom Link: ${zoom}
• Faculty / Program Leads: ${faculty}
• Sim Staff Contact: ${simStaff}

Please reach out with any questions.

Sincerely,
${simStaff}`;
    }

    if (template === "Assignment") {
      return `SPs,

Thank you for supporting ${eventName}. Below is the current assignment-related information available for this event:

• Event Date: ${eventDate}
• Event Time: ${eventTime}
• Sim Staff Contact: ${simStaff}
• Faculty Contacts: ${faculty}

A more detailed assignment breakdown will follow as final preparation is completed.

Sincerely,
${simStaff}`;
    }

    return `SPs,

In preparation for ${eventName}, please review the following:

• Date: ${eventDate}
• Time: ${eventTime}
• Zoom / Location: ${zoom}
• Faculty: ${faculty}
• Sim Staff Contact: ${simStaff}

Please let me know if you have any questions ahead of the event.

Sincerely,
${simStaff}`;
  }, [template, eventName, eventDate, eventTime, zoom, faculty, simStaff]);

  return (
    <SiteShell
      title="Email Builder"
      subtitle="Generate polished drafts for training, event prep, assignment, and logistics communication from structured event data."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Draft settings
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Template</div>
              <select style={inputStyle} value={template} onChange={(e) => setTemplate(e.target.value)}>
                <option>Event Prep</option>
                <option>Training</option>
                <option>Assignment</option>
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Event Name</div>
              <input style={inputStyle} value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Date</div>
              <input style={inputStyle} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Time</div>
              <input style={inputStyle} value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Zoom / Location</div>
              <input style={inputStyle} value={zoom} onChange={(e) => setZoom(e.target.value)} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Faculty</div>
              <input style={inputStyle} value={faculty} onChange={(e) => setFaculty(e.target.value)} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Sim Staff</div>
              <input style={inputStyle} value={simStaff} onChange={(e) => setSimStaff(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Draft Preview
          </div>

          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              color: "#2f4f70",
              background: "rgba(243,248,252,0.85)",
              borderRadius: "18px",
              padding: "18px",
              border: "1px solid rgba(23,61,112,0.08)",
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

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

export default function BlueprintsPage() {
  const [segments, setSegments] = useState([
    { name: "Orientation", duration: 15, roomType: "Classroom" },
    { name: "Encounter Round 1", duration: 20, roomType: "Exam Room" },
    { name: "Feedback / Debrief", duration: 15, roomType: "Debrief Room" },
  ]);

  return (
    <SiteShell
      title="Blueprint Builder"
      subtitle="Define the operational architecture of an event so intake data can become a true simulation plan."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Blueprint settings
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                Blueprint Name
              </div>
              <input style={inputStyle} placeholder="PA Interview OSCE / IPE Dysphagia / etc." />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                Event Type
              </div>
              <select style={inputStyle}>
                <option>OSCE</option>
                <option>IPE</option>
                <option>PA Skills</option>
                <option>SLP Simulation</option>
                <option>Interview / Counseling</option>
                <option>Custom</option>
              </select>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                Number of Rounds
              </div>
              <input style={inputStyle} type="number" min="1" defaultValue={4} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>
                Notes
              </div>
              <textarea
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                placeholder="Operational assumptions, room rules, timing notes, staffing constraints, or template guidance"
              />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Segments
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {segments.map((segment, index) => (
              <div key={`${segment.name}-${index}`} style={segmentStyle}>
                <div style={{ fontSize: "19px", fontWeight: 800, color: "#173d70" }}>
                  {index + 1}. {segment.name}
                </div>
                <div style={{ color: "#597391", marginTop: "6px", lineHeight: 1.6 }}>
                  Duration: {segment.duration} minutes
                  <br />
                  Room Type: {segment.roomType}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "18px" }}>
            <button
              type="button"
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 18px",
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
              style={{
                border: "1px solid rgba(23,61,112,0.12)",
                borderRadius: "14px",
                padding: "14px 18px",
                background: "#ffffff",
                color: "#173d70",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Save Blueprint
            </button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
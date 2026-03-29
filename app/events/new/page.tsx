"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #f4f7fb 0%, #e8eef7 45%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1000px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "22px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 800,
  color: "#12233f",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "6px",
  color: "#62748d",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid #d9e3f1",
  boxShadow: "0 14px 34px rgba(20, 40, 90, 0.08)",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#16213e",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  fontSize: "15px",
  marginTop: "6px",
  background: "#fbfcfe",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "18px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#173d70",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  background: "#ffffff",
  color: "#16213e",
  fontWeight: 700,
  textDecoration: "none",
};

const previewStyle: React.CSSProperties = {
  border: "1px solid #d9e3f1",
  borderRadius: "14px",
  background: "#f6f9fd",
  padding: "16px",
  marginTop: "18px",
};

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Needs SPs");
  const [dateText, setDateText] = useState("");
  const [spNeeded, setSpNeeded] = useState("");
  const [spAssigned, setSpAssigned] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("Team");
  const [notes, setNotes] = useState("");

  const previewId = useMemo(() => {
    const base = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || "new-event-id";
  }, [name]);

  function handleSave() {
    alert(`(Next step: connect to Supabase)\n\nEvent: ${name}`);
  }

  function handleClear() {
    setName("");
    setStatus("Needs SPs");
    setDateText("");
    setSpNeeded("");
    setSpAssigned("");
    setLocation("");
    setVisibility("Team");
    setNotes("");
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Create Event</h1>
          <div style={subtitleStyle}>
            Build a new event record for staffing and tracking.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={gridStyle}>
            <label style={labelStyle}>
              Event Name
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Status
              <select
                style={inputStyle}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Needs SPs</option>
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Complete</option>
              </select>
            </label>

            <label style={labelStyle}>
              Date(s)
              <input
                style={inputStyle}
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Location
              <input
                style={inputStyle}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              SP Needed
              <input
                style={inputStyle}
                value={spNeeded}
                onChange={(e) => setSpNeeded(e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              SP Assigned
              <input
                style={inputStyle}
                value={spAssigned}
                onChange={(e) => setSpAssigned(e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Visibility
              <select
                style={inputStyle}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option>Team</option>
                <option>Personal</option>
              </select>
            </label>
          </div>

          <label style={{ ...labelStyle, marginTop: "14px", display: "block" }}>
            Notes
            <textarea
              style={{ ...inputStyle, minHeight: "120px" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div style={previewStyle}>
            <strong>Preview</strong>
            <div>ID: {previewId}</div>
            <div>Name: {name || "—"}</div>
            <div>Status: {status}</div>
            <div>Date(s): {dateText || "—"}</div>
            <div>Location: {location || "—"}</div>
          </div>

          <div style={buttonRowStyle}>
            <button style={primaryButtonStyle} onClick={handleSave}>
              Save Event
            </button>

            <button style={secondaryButtonStyle} onClick={handleClear}>
              Clear
            </button>

            <Link href="/events" style={secondaryButtonStyle}>
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
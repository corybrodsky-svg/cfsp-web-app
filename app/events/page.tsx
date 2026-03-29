"use client";

import React from "react";
import Link from "next/link";
import { events } from "../lib/mockData";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #f4f7fb 0%, #e8eef7 45%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
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

const primaryButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#173d70",
  color: "#ffffff",
  fontWeight: 800,
};

const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid #d9e3f1",
  boxShadow: "0 10px 26px rgba(20, 40, 90, 0.08)",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "14px",
};

const pillStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f2f6fc",
  border: "1px solid #d9e3f1",
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  fontWeight: 700,
  color: "#173d70",
};

function shortage(spNeeded: number, spAssigned: number) {
  return Math.max(spNeeded - spAssigned, 0);
}

export default function EventsPage() {
  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={headerRowStyle}>
          <div>
            <h1 style={titleStyle}>Events</h1>
            <div style={subtitleStyle}>
              {events.length} total event{events.length === 1 ? "" : "s"}
            </div>
          </div>

          <Link href="/events/new" style={primaryButtonStyle}>
            + Create Event
          </Link>
        </div>

        <div style={cardGridStyle}>
          {events.map((event) => {
            const shortCount = shortage(event.spNeeded, event.spAssigned);

            return (
              <div key={event.id} style={cardStyle}>
                <div style={topRowStyle}>
                  <div>
                    <h2 style={{ margin: "0 0 6px 0", color: "#12233f" }}>
                      {event.name}
                    </h2>
                    <div style={{ color: "#64748b" }}>{event.notes}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800 }}>{event.status}</div>
                    <div style={{ color: "#64748b", fontSize: "14px" }}>
                      {event.visibility}
                    </div>
                  </div>
                </div>

                <div style={metaRowStyle}>
                  <span style={pillStyle}>📅 {event.dateText}</span>
                  <span style={pillStyle}>📍 {event.location}</span>
                  <span style={pillStyle}>Needed: {event.spNeeded}</span>
                  <span style={pillStyle}>Assigned: {event.spAssigned}</span>
                  <span style={pillStyle}>Short: {shortCount}</span>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <Link href={`/events/${event.id}`} style={linkStyle}>
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
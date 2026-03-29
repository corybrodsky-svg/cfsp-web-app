"use client";

import React from "react";
import Link from "next/link";
import { events } from "../../lib/mockData";

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

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 800,
  color: "#12233f",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#62748d",
  fontSize: "15px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "#eef4fb",
  border: "1px solid #d9e3f1",
  color: "#173d70",
  fontWeight: 800,
  fontSize: "14px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
  marginBottom: "16px",
};

const sectionStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9e3f1",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 10px 26px rgba(20, 40, 90, 0.08)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#6c7d94",
  marginBottom: "8px",
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "19px",
  color: "#12233f",
  fontWeight: 700,
};

const notesStyle: React.CSSProperties = {
  ...sectionStyle,
  lineHeight: 1.7,
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "18px",
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#173d70",
  color: "#ffffff",
  fontWeight: 800,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#ffffff",
  border: "1px solid #d0dae8",
  color: "#173d70",
  fontWeight: 800,
};

type EventDetailPageProps = {
  params: { id: string };
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = events.find((item) => item.id === params.id);

  if (!event) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={sectionStyle}>
            <h1 style={titleStyle}>Event Not Found</h1>
            <div style={subtitleStyle}>
              This event id does not match the current dataset.
            </div>

            <div style={{ marginTop: "16px", color: "#334155" }}>
              <strong>Requested ID:</strong> {params.id}
            </div>

            <div style={actionRowStyle}>
              <Link href="/events" style={primaryLinkStyle}>
                Back to Events
              </Link>
              <Link href="/" style={secondaryLinkStyle}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={topRowStyle}>
          <div>
            <h1 style={titleStyle}>{event.name}</h1>
            <div style={subtitleStyle}>Event detail page</div>
          </div>

          <div style={badgeStyle}>{event.status}</div>
        </div>

        <div style={gridStyle}>
          <div style={sectionStyle}>
            <div style={labelStyle}>Dates</div>
            <p style={valueStyle}>{event.dateText}</p>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>Location</div>
            <p style={valueStyle}>{event.location}</p>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>Visibility</div>
            <p style={valueStyle}>{event.visibility}</p>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>SP Needed</div>
            <p style={valueStyle}>{event.spNeeded}</p>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>SP Assigned</div>
            <p style={valueStyle}>{event.spAssigned}</p>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>Shortage</div>
            <p style={valueStyle}>
              {Math.max(event.spNeeded - event.spAssigned, 0)}
            </p>
          </div>
        </div>

        <div style={notesStyle}>
          <div style={labelStyle}>Notes</div>
          <p style={{ margin: 0, color: "#334155" }}>{event.notes}</p>
        </div>

        <div style={actionRowStyle}>
          <Link href="/events" style={primaryLinkStyle}>
            ← Back to Events
          </Link>
          <Link href="/events/new" style={secondaryLinkStyle}>
            Create Another Event
          </Link>
          <Link href="/" style={secondaryLinkStyle}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import SiteShell from "../components/SiteShell";
import { events, sps } from "../lib/mockData";
import { clearSession, DemoUser, getSession } from "../lib/demoAuth";

const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d8e0ec",
  borderRadius: "16px",
  padding: "18px",
  background: "#f8fbff",
};

const quickGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px",
  marginTop: "18px",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "12px",
  color: "#16213e",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "18px",
};

const actionLinkStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  background: "#ffffff",
  color: "#16213e",
  fontWeight: 700,
};

const eventListStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const eventRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  border: "1px solid #dde5f0",
  borderRadius: "12px",
  padding: "12px 14px",
  background: "#ffffff",
};

function shortage(spNeeded: number, spAssigned: number) {
  return Math.max(spNeeded - spAssigned, 0);
}

export default function DashboardPage() {
  const totalNeeded = events.reduce((sum, e) => sum + e.spNeeded, 0);
  const totalAssigned = events.reduce((sum, e) => sum + e.spAssigned, 0);
  const totalShort = Math.max(totalNeeded - totalAssigned, 0);
  const needsAttention = events.filter((e) => e.spAssigned < e.spNeeded);

  return (
    <SiteShell title="Dashboard" subtitle="Primary admin landing page after login.">
      <div style={actionRowStyle}>
        <Link href="/events/new" style={actionLinkStyle}>
          + Create New Event
        </Link>
        <Link href="/events" style={actionLinkStyle}>
          Open Event Board
        </Link>
        <Link href="/sps" style={actionLinkStyle}>
          Open SP Database
        </Link>
        <Link href="/admin" style={actionLinkStyle}>
          Open Admin Hub
        </Link>
        <Link
  href="/upload-schedule"
  style={{
    textDecoration: "none",
    background: "#fff",
    border: "1px solid #d8e0ec",
    borderRadius: "18px",
    padding: "20px",
    color: "#183153",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  }}
>
  <h2 style={{ fontSize: "22px", fontWeight: 800 }}>
    Upload Schedule
  </h2>
  <p>Import Excel schedule and auto-generate events</p>
</Link>
      </div>

      <div style={statGrid}>
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Total Events</h3>
          <p style={{ fontSize: "34px", margin: 0, fontWeight: 800 }}>{events.length}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>SP Needed</h3>
          <p style={{ fontSize: "34px", margin: 0, fontWeight: 800 }}>{totalNeeded}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>SP Assigned</h3>
          <p style={{ fontSize: "34px", margin: 0, fontWeight: 800 }}>{totalAssigned}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Total Short</h3>
          <p style={{ fontSize: "34px", margin: 0, fontWeight: 800 }}>{totalShort}</p>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Roster Size</h3>
          <p style={{ fontSize: "34px", margin: 0, fontWeight: 800 }}>{sps.length}</p>
        </div>
      </div>

      <div style={quickGridStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Needs SP Coverage</h3>
          <div style={eventListStyle}>
            {needsAttention.length === 0 ? (
              <p style={{ margin: 0 }}>No open shortages right now.</p>
            ) : (
              needsAttention.map((event) => (
                <div key={event.id} style={eventRowStyle}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{event.name}</div>
                    <div style={{ color: "#64748b", fontSize: "14px" }}>{event.dateText}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>Short {shortage(event.spNeeded, event.spAssigned)}</div>
                    <Link href={`/events/${event.id}`}>View</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Tonight’s Build Focus</h3>
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.8 }}>
            <li>Stable dashboard route</li>
            <li>Working event list and detail pages</li>
            <li>Searchable SP database shell</li>
            <li>Clean navigation across all pages</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
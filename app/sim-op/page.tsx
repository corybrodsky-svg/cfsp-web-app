import Link from "next/link";
import SiteShell from "../components/SiteShell";
import { events } from "../lib/mockData";

const cardStyle: React.CSSProperties = {
  border: "1px solid #d8e0ec",
  borderRadius: "16px",
  padding: "18px",
  background: "#f8fbff",
  marginBottom: "16px",
};

const actionGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

export default function SimOpPage() {
  return (
    <SiteShell title="Sim Op" subtitle="Simulation operations tools hub.">
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>My Sim Op Snapshot</h3>
        <p style={{ marginBottom: 0 }}>
          Placeholder for sim-op-specific assignments, event ownership, and daily workflow tools.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Current Event Count</h3>
        <p style={{ marginBottom: 0 }}>{events.length} events in mock data.</p>
      </div>

      <div style={actionGridStyle}>
        <Link href="/events">Open Event Board</Link>
        <Link href="/events/new">Create New Event</Link>
        <Link href="/sps">Open SP Database</Link>
        <Link href="/admin">Open Admin</Link>
      </div>
    </SiteShell>
  );
}
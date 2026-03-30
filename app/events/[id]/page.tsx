import type { CSSProperties } from "react";
import SiteShell from "../../components/SiteShell";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const eventId = decodeURIComponent(params.id);

  return (
    <SiteShell
      title="Event Detail"
      subtitle="This page is where event-specific staffing, logistics, assignments, blueprinting, and communication will converge."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "12px" }}>
            Event Overview
          </div>
          <div style={{ color: "#597391", lineHeight: 1.8 }}>
            <strong style={{ color: "#173d70" }}>Event ID:</strong> {eventId}
            <br />
            <strong style={{ color: "#173d70" }}>Status:</strong> Needs full data binding
            <br />
            <strong style={{ color: "#173d70" }}>Purpose:</strong> unified event operations screen
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "12px" }}>
            Planned sections
          </div>
          <div style={{ color: "#597391", lineHeight: 1.8 }}>
            • assignment management
            <br />
            • SP roster and confirmations
            <br />
            • timing and blueprint linkage
            <br />
            • sim flow output
            <br />
            • event prep email generation
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
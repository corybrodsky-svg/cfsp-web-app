import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

export default function UploadPage() {
  return (
    <SiteShell
      title="Upload"
      subtitle="Bring in schedules and session documents so they can become structured CFSP event data."
    >
      <div style={cardStyle}>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "12px" }}>
          Schedule and document intake
        </div>
        <div style={{ color: "#597391", lineHeight: 1.8 }}>
          This page is where you’ll connect:
          <br />
          <br />
          • Excel schedule imports
          <br />
          • session details Word documents
          <br />
          • future parser logic for event creation
          <br />
          • assignment imports and staffing cleanup
          <br />
          <br />
          For now, it is a real route and stable placeholder ready for file upload wiring.
        </div>
      </div>
    </SiteShell>
  );
}
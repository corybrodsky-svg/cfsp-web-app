import Link from "next/link";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const summaryCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "22px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "20px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

const largeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.15fr 0.85fr",
  gap: "18px",
};

const panelStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

const listRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  padding: "14px 0",
  borderBottom: "1px solid rgba(23,61,112,0.08)",
};

const quickGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const quickCardStyle: CSSProperties = {
  background: "linear-gradient(135deg, rgba(23,61,112,0.98) 0%, rgba(29,138,106,0.90) 100%)",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "22px",
  textDecoration: "none",
  boxShadow: "0 18px 36px rgba(23,61,112,0.18)",
};

export default function DashboardPage() {
  return (
    <SiteShell
      title="Admin Dashboard"
      subtitle="Operational control center for scheduling, staffing, event design, automation, and simulation flow."
    >
      <div style={summaryGridStyle}>
        {[
          ["Active Events", "18"],
          ["Needs SPs", "7"],
          ["Blueprints", "6"],
          ["Draft Emails", "14"],
        ].map(([label, value]) => (
          <div key={label} style={summaryCardStyle}>
            <div style={{ color: "#5b7593", fontWeight: 700, marginBottom: "10px" }}>{label}</div>
            <div style={{ fontSize: "34px", fontWeight: 800, color: "#173d70" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={largeGridStyle}>
        <div style={panelStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "10px" }}>
            Immediate priorities
          </div>

          {[
            ["PA / SLP IPE Virtual", "Needs final SP event prep emails"],
            ["Spring OSCE Upload", "Needs schedule import cleanup"],
            ["Clinic Skills Rotation", "Blueprint timing needs review"],
            ["New Intake Request", "Pending room and staffing assumptions"],
          ].map(([title, text]) => (
            <div key={title} style={listRowStyle}>
              <div>
                <div style={{ fontWeight: 800, color: "#173d70" }}>{title}</div>
                <div style={{ color: "#5b7593", marginTop: "6px" }}>{text}</div>
              </div>
              <div style={{ color: "#1d8a6a", fontWeight: 800, whiteSpace: "nowrap" }}>
                Review
              </div>
            </div>
          ))}
        </div>

        <div style={panelStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "12px" }}>
            Today’s focus
          </div>
          <div style={{ color: "#5b7593", lineHeight: 1.7 }}>
            The app is now organized around the real workflow:
            intake → structure → timing → assignment → email automation.
            <br />
            <br />
            This is where you’ll eventually surface shortages, pending confirmations,
            imported schedules, blueprints that need review, and event-prep drafts waiting
            to send.
          </div>
        </div>
      </div>

      <div style={quickGridStyle}>
        {[
          ["/intake", "New Session Intake", "Create a new event request from operational details."],
          ["/blueprints", "Open Blueprint Builder", "Define the structure of a simulation session."],
          ["/sim-flow", "Run Sim Flow", "Calculate rounds, timing, and room usage."],
          ["/emails", "Build Event Emails", "Generate event prep, assignment, and training drafts."],
        ].map(([href, title, text]) => (
          <Link key={href} href={href} style={quickCardStyle}>
            <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "10px" }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,0.92)", lineHeight: 1.6 }}>{text}</div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
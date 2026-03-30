"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
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
  outline: "none",
};

const labelStyle: CSSProperties = {
  fontWeight: 700,
  color: "#173d70",
  marginBottom: "8px",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "14px",
  padding: "14px 18px",
  background: "linear-gradient(135deg, #173d70 0%, #1d8a6a 100%)",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid rgba(23,61,112,0.12)",
  borderRadius: "14px",
  padding: "14px 18px",
  background: "#ffffff",
  color: "#173d70",
  fontWeight: 800,
  cursor: "pointer",
};

const pillStyle: CSSProperties = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(23,61,112,0.08)",
  color: "#173d70",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export default function LoginPage() {
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SiteShell
      title="Login"
      subtitle="Use this as the stable entry point for Admin, Sim Op, and SP access while auth wiring continues."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={pillStyle}>Access Control</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#173d70" }}>
              Welcome back to CFSP
            </div>
            <div style={{ color: "#597391", lineHeight: 1.6 }}>
              This page is now a true route and real UI layer. You can wire Supabase auth into
              this next, but the app routing and page structure no longer depends on a broken
              fake landing page.
            </div>

            <div>
              <div style={labelStyle}>Role</div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={inputStyle}
              >
                <option>Admin</option>
                <option>Sim Op</option>
                <option>SP</option>
              </select>
            </div>

            <div>
              <div style={labelStyle}>Username / Email</div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                style={inputStyle}
              />
            </div>

            <div>
              <div style={labelStyle}>Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter password"
                style={inputStyle}
              />
            </div>

            <div style={buttonRowStyle}>
              <button style={primaryButtonStyle} type="button">
                Sign In
              </button>
              <button style={secondaryButtonStyle} type="button">
                Use Test Login
              </button>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#173d70", marginBottom: "12px" }}>
            Role behavior
          </div>
          <div style={{ color: "#597391", lineHeight: 1.7 }}>
            <strong>Admin:</strong> full visibility across intake, events, assignments, SP directory,
            blueprints, emails, and future reporting.
            <br />
            <br />
            <strong>Sim Op:</strong> sees assigned and relevant event operations, staffing, timing,
            and prep tools.
            <br />
            <br />
            <strong>SP:</strong> sees profile, assignments, event prep, and future self-service
            updates.
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
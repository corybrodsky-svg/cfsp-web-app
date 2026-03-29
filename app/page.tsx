"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./lib/auth";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eff5fc 0%, #dfeaf7 100%)",
  padding: "32px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #12233f 0%, #173d70 100%)",
  color: "#ffffff",
  borderRadius: "28px",
  padding: "34px",
  boxShadow: "0 18px 40px rgba(18, 35, 63, 0.24)",
  marginBottom: "22px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "42px",
  fontWeight: 900,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "10px",
  color: "rgba(255,255,255,0.85)",
  fontSize: "17px",
  lineHeight: 1.6,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: "22px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #d8e3f1",
  boxShadow: "0 12px 28px rgba(20, 40, 90, 0.08)",
  color: "#12233f",
  textDecoration: "none",
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "21px",
  fontWeight: 900,
};

const cardTextStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#5f728c",
  lineHeight: 1.6,
};

export default function HomePage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    setUserName(user?.fullName || "");
  }, []);

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <h1 style={titleStyle}>CFSP</h1>
          <div style={subtitleStyle}>
            Conflict-Free SP scheduling, profiles, staffing, and event prep in one place.
            {userName ? ` Logged in as ${userName}.` : ""}
          </div>
        </div>

        <div style={gridStyle}>
          <Link href="/login" style={cardStyle}>
            <h2 style={cardTitleStyle}>Login</h2>
            <div style={cardTextStyle}>
              Sign in as an SP or Sim Op and get routed to the correct view.
            </div>
          </Link>

          <Link href="/admin" style={cardStyle}>
            <h2 style={cardTitleStyle}>Admin Dashboard</h2>
            <div style={cardTextStyle}>
              Launch point for sim ops, staffing, events, uploads, and control.
            </div>
          </Link>

          <Link href="/events" style={cardStyle}>
            <h2 style={cardTitleStyle}>Events</h2>
            <div style={cardTextStyle}>
              Review events, staffing, assignments, and edit event details.
            </div>
          </Link>

          <Link href="/sp-directory" style={cardStyle}>
            <h2 style={cardTitleStyle}>SP Directory</h2>
            <div style={cardTextStyle}>
              Search SPs, filter CICSP vs Elkins Park, and assign them to events.
            </div>
          </Link>

          <Link href="/me" style={cardStyle}>
            <h2 style={cardTitleStyle}>My Profile</h2>
            <div style={cardTextStyle}>
              SP profile or personal dashboard view based on who is signed in.
            </div>
          </Link>

          <Link href="/upload" style={cardStyle}>
            <h2 style={cardTitleStyle}>Upload Session Details</h2>
            <div style={cardTextStyle}>
              Next step: upload Word docs and turn them into events automatically.
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "../lib/auth";
import { events, getStoredAssignments, resolveSimOpName } from "../lib/mockData";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef4fb 0%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #12233f 0%, #173d70 100%)",
  color: "#ffffff",
  borderRadius: "24px",
  padding: "28px",
  boxShadow: "0 18px 40px rgba(18, 35, 63, 0.22)",
  marginBottom: "18px",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "34px",
  fontWeight: 900,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "rgba(255,255,255,0.84)",
  fontSize: "15px",
};

const navRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const lightButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  background: "#ffffff",
  color: "#173d70",
  fontWeight: 800,
};

const darkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.15)",
  color: "#ffffff",
  fontWeight: 800,
  border: "1px solid rgba(255,255,255,0.22)",
  cursor: "pointer",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginBottom: "18px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "20px",
  border: "1px solid #d8e3f1",
  boxShadow: "0 12px 28px rgba(20, 40, 90, 0.08)",
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  color: "#12233f",
  fontSize: "22px",
  fontWeight: 900,
};

const cardTextStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#61748d",
  lineHeight: 1.6,
};

const eventCardStyle: React.CSSProperties = {
  ...cardStyle,
  marginTop: "16px",
};

export default function AdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "sim_op") {
      router.replace("/me");
      return;
    }
    setUserName(user.fullName);
  }, [router]);

  const myEvents = useMemo(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "sim_op") return [];

    const assignments = getStoredAssignments();

    return events.filter((event) => {
      const lead = resolveSimOpName(event.leadSimOp || "");
      const assigned = (event.assignedStaff || []).map(resolveSimOpName);
      const associated = (event.associatedStaff || []).map(resolveSimOpName);

      const mine =
        lead === user.fullName ||
        assigned.includes(user.fullName) ||
        associated.includes(user.fullName);

      return mine;
    }).map((event) => {
      const eventAssignments = assignments.filter(
        (item) => item.eventMode === "existing" && item.eventId === event.id
      );
      return {
        ...event,
        liveAssignedCount: (event.assignedSPIds?.length || 0) + eventAssignments.length,
      };
    });
  }, [userName]);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={topRowStyle}>
            <div>
              <h1 style={titleStyle}>Admin Dashboard</h1>
              <div style={subtitleStyle}>
                Welcome {userName || "Sim Op"}. Launch events, staffing, directory, and upload flows from here.
              </div>
            </div>

            <div style={navRowStyle}>
              <Link href="/" style={lightButtonStyle}>Home</Link>
              <Link href="/events" style={lightButtonStyle}>Events</Link>
              <Link href="/sp-directory" style={lightButtonStyle}>SP Directory</Link>
              <Link href="/upload" style={lightButtonStyle}>Upload</Link>
              <button type="button" onClick={handleLogout} style={darkButtonStyle}>Log Out</button>
            </div>
          </div>
        </div>

        <div style={gridStyle}>
          <Link href="/events" style={{ ...cardStyle, textDecoration: "none" }}>
            <h2 style={cardTitleStyle}>Events</h2>
            <div style={cardTextStyle}>Edit events, staffing, and SP counts.</div>
          </Link>

          <Link href="/sp-directory" style={{ ...cardStyle, textDecoration: "none" }}>
            <h2 style={cardTitleStyle}>SP Directory</h2>
            <div style={cardTextStyle}>Search SPs, filter pools, and assign them to events.</div>
          </Link>

          <Link href="/upload" style={{ ...cardStyle, textDecoration: "none" }}>
            <h2 style={cardTitleStyle}>Upload Session Details</h2>
            <div style={cardTextStyle}>Next: turn Word docs into event drafts.</div>
          </Link>

          <Link href="/me" style={{ ...cardStyle, textDecoration: "none" }}>
            <h2 style={cardTitleStyle}>My Profile</h2>
            <div style={cardTextStyle}>Personal dashboard and profile view.</div>
          </Link>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>My Events</h2>
          <div style={cardTextStyle}>
            Events where you are lead, assigned, or associated.
          </div>

          {myEvents.length === 0 ? (
            <div style={{ marginTop: "14px", color: "#61748d" }}>No matching events yet.</div>
          ) : (
            myEvents.map((event) => (
              <div key={event.id} style={eventCardStyle}>
                <h3 style={{ margin: 0, color: "#12233f" }}>{event.name}</h3>
                <div style={{ marginTop: "8px", color: "#61748d" }}>
                  {event.dateText} · {event.location} · {event.status}
                </div>
                <div style={{ marginTop: "8px", color: "#24364d" }}>
                  Lead: {resolveSimOpName(event.leadSimOp || "—")}
                </div>
                <div style={{ marginTop: "6px", color: "#24364d" }}>
                  Live assigned SPs: {event.liveAssignedCount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
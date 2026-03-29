"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "../lib/auth";
import { events, getStoredAssignments, getSPById } from "../lib/mockData";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef4fb 0%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1080px",
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

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "20px",
  border: "1px solid #d8e3f1",
  boxShadow: "0 12px 28px rgba(20, 40, 90, 0.08)",
  marginBottom: "16px",
};

export default function MePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"sp" | "sim_op" | "">("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserName(user.fullName);
    setUserRole(user.role);
  }, [router]);

  const spProfile = useMemo(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "sp") return null;
    return getSPById(user.id) || null;
  }, [userName]);

  const myAssignments = useMemo(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "sp") return [];

    const stored = getStoredAssignments().filter((item) => item.spId === user.id);

    const baseAssignedEvents = events.filter((event) =>
      (event.assignedSPIds || []).includes(user.id)
    );

    const combined = [
      ...baseAssignedEvents.map((event) => ({
        kind: "base" as const,
        label: event.name,
        dateText: event.dateText,
        notes: event.notes,
      })),
      ...stored.map((item) => ({
        kind: "draft" as const,
        label: item.eventName,
        dateText: item.dateText || "",
        notes: item.notes || "",
      })),
    ];

    return combined;
  }, [userName]);

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  if (userRole === "sim_op") {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={heroStyle}>
            <div style={topRowStyle}>
              <div>
                <h1 style={titleStyle}>My Dashboard</h1>
                <div style={subtitleStyle}>
                  You are logged in as a Sim Op. Use the admin dashboard for your full control view.
                </div>
              </div>

              <div style={navRowStyle}>
                <Link href="/admin" style={lightButtonStyle}>Admin</Link>
                <Link href="/" style={lightButtonStyle}>Home</Link>
                <button type="button" onClick={handleLogout} style={darkButtonStyle}>Log Out</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={topRowStyle}>
            <div>
              <h1 style={titleStyle}>My Profile</h1>
              <div style={subtitleStyle}>
                Logged in as {userName || "SP"}. This page is your SP-only view.
              </div>
            </div>

            <div style={navRowStyle}>
              <Link href="/" style={lightButtonStyle}>Home</Link>
              <button type="button" onClick={handleLogout} style={darkButtonStyle}>Log Out</button>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: "#12233f" }}>Profile Details</h2>
          <div style={{ color: "#24364d", lineHeight: 1.8 }}>
            <div><strong>Name:</strong> {spProfile?.fullName || userName}</div>
            <div><strong>Email:</strong> {spProfile?.email || "—"}</div>
            <div><strong>Phone:</strong> {spProfile?.phone || "—"}</div>
            <div><strong>Pool:</strong> {spProfile?.pool || "—"}</div>
            <div><strong>Username:</strong> {spProfile?.username || "—"}</div>
            <div><strong>Photo Upload:</strong> next step</div>
            <div><strong>Editable Profile Fields:</strong> next step</div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: "#12233f" }}>My Assigned Events</h2>
          {myAssignments.length === 0 ? (
            <div style={{ color: "#61748d" }}>No assignments yet.</div>
          ) : (
            myAssignments.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                style={{
                  padding: "14px 0",
                  borderTop: index === 0 ? "none" : "1px solid #e3ebf5",
                }}
              >
                <div style={{ fontWeight: 800, color: "#12233f" }}>{item.label}</div>
                <div style={{ marginTop: "4px", color: "#61748d" }}>
                  {item.dateText || "Date TBD"}
                </div>
                <div style={{ marginTop: "6px", color: "#24364d" }}>
                  {item.notes || "No notes"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
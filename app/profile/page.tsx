"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, DemoUser, getSession } from "../../lib/demoAuth";

export default function ProfilePage() {
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  function handleLogout() {
    clearSession();
    window.location.href = "/login";
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>No active session</h1>
          <Link href="/login" style={styles.linkButton}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>My Profile</h1>
        <p style={styles.subtitle}>SP profile view</p>

        <div style={styles.infoRow}><strong>Name:</strong> {user.firstName} {user.lastName}</div>
        <div style={styles.infoRow}><strong>Email:</strong> {user.email}</div>
        <div style={styles.infoRow}><strong>Username:</strong> {user.username}</div>
        <div style={styles.infoRow}><strong>Role:</strong> {user.role}</div>

        <div style={styles.actions}>
          <Link href="/events" style={styles.linkButton}>
            View Events
          </Link>
          <button style={styles.primaryButton} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "640px",
    background: "#fff",
    border: "1px solid #d8e0ec",
    borderRadius: "20px",
    padding: "28px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 800,
    color: "#183153",
  },
  subtitle: {
    margin: "8px 0 18px",
    color: "#5f7183",
  },
  infoRow: {
    marginBottom: "12px",
    fontSize: "15px",
    color: "#334155",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    background: "#fff",
    color: "#183153",
    border: "1px solid #d8e0ec",
    fontWeight: 700,
  },
};
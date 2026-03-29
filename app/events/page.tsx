"use client";

import Link from "next/link";
import { useState } from "react";

type Event = {
  id: string;
  name: string;
  status: string;
  date_text: string;
  sp_needed: number;
  sp_assigned: number;
};

const initialEvents: Event[] = [
  {
    id: "1",
    name: "N651 Virtual",
    status: "Needs SPs",
    date_text: "3/10, 3/11",
    sp_needed: 6,
    sp_assigned: 2,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [message, setMessage] = useState("");

  function handleSave() {
    setMessage("✅ Draft saved successfully");
    setTimeout(() => setMessage(""), 2500);
  }

  function handleDelete(id: string) {
    setEvents(events.filter((e) => e.id !== id));
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Events</h1>

        <Link href="/events/new">
          <button style={styles.primaryBtn}>+ New Event</button>
        </Link>
      </div>

      {/* SAVE MESSAGE */}
      {message && <div style={styles.message}>{message}</div>}

      {/* EVENT LIST */}
      <div style={styles.grid}>
        {events.map((event) => (
          <div key={event.id} style={styles.card}>
            <h2 style={styles.eventTitle}>{event.name}</h2>

            <p>
              <strong>Status:</strong> {event.status}
            </p>
            <p>
              <strong>Dates:</strong> {event.date_text}
            </p>
            <p>
              <strong>SPs:</strong>{" "}
              {event.sp_assigned} / {event.sp_needed}
            </p>

            {/* ACTIONS */}
            <div style={styles.actions}>
              <Link href={`/events/${event.id}`}>
                <button style={styles.secondaryBtn}>View</button>
              </Link>

              <Link href={`/events/${event.id}/edit`}>
                <button style={styles.secondaryBtn}>Edit</button>
              </Link>

              <button
                style={styles.dangerBtn}
                onClick={() => handleDelete(event.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SAVE BUTTON */}
      <div style={styles.footer}>
        <button style={styles.primaryBtn} onClick={handleSave}>
          Save Assignment Draft
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },

  card: {
    border: "1px solid #d8e0ec",
    borderRadius: "16px",
    padding: "16px",
    background: "#f8fbff",
  },

  eventTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "8px",
  },

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "#e2e8f0",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  dangerBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  footer: {
    marginTop: "24px",
    textAlign: "center",
  },

  message: {
    marginBottom: "16px",
    padding: "10px",
    background: "#dcfce7",
    borderRadius: "8px",
    color: "#166534",
  },
};
"use client";

import Link from "next/link";
import * as XLSX from "xlsx";
import { useMemo, useState } from "react";
import {
  ensureSimOpUsers,
  groupSessionsIntoEvents,
  ImportedEvent,
  ImportedSession,
  mergeImportedEvents,
  parseScheduleRows,
} from "../lib/schedule-Import";

export default function UploadSchedulePage() {
  const [fileName, setFileName] = useState("");
  const [sessions, setSessions] = useState<ImportedSession[]>([]);
  const [events, setEvents] = useState<ImportedEvent[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => {
    const simOps = new Set<string>();
    for (const event of events) {
      for (const person of event.assignedSimOps) simOps.add(person);
    }

    return {
      sessionCount: sessions.length,
      eventCount: events.length,
      simOpCount: simOps.size,
    };
  }, [sessions, events]);

  async function handleFileUpload(file: File) {
    setBusy(true);
    setError("");
    setMessage("");
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const preferredSheet =
        workbook.SheetNames.find((name) => /spring\s*2026/i.test(name)) ??
        workbook.SheetNames[0];

      if (!preferredSheet) {
        throw new Error("No worksheet found in that file.");
      }

      const sheet = workbook.Sheets[preferredSheet];
      const rows = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(sheet, {
        header: 1,
        blankrows: false,
        defval: "",
      });

      const parsedSessions = parseScheduleRows(rows);
      const groupedEvents = groupSessionsIntoEvents(parsedSessions);

      if (parsedSessions.length === 0) {
        throw new Error("I could not find any schedule rows to import.");
      }

      setSessions(parsedSessions);
      setEvents(groupedEvents);
      setMessage(`Parsed ${groupedEvents.length} events from ${file.name}.`);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Schedule import failed.";
      setError(text);
      setSessions([]);
      setEvents([]);
    } finally {
      setBusy(false);
    }
  }

  function handleImport() {
    if (events.length === 0) {
      setError("Nothing is parsed yet.");
      return;
    }

    ensureSimOpUsers(events);
    mergeImportedEvents(events);
    setMessage(
      `Imported ${events.length} events and synced Sim Op accounts.`
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Upload Schedule</h1>
            <p style={styles.subtitle}>
              Import a full Excel semester schedule and turn it into events, sessions, and Sim Op assignments.
            </p>
          </div>

          <div style={styles.headerLinks}>
            <Link href="/dashboard" style={styles.linkButton}>
              Dashboard
            </Link>
            <Link href="/events" style={styles.linkButton}>
              Events
            </Link>
          </div>
        </div>

        {message ? <div style={styles.success}>{message}</div> : null}
        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>1. Upload Excel Schedule</h2>

          <label style={styles.uploadBox}>
            <input
              type="file"
              accept=".xlsx,.xls,.xlsm"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div style={styles.uploadText}>
              {busy
                ? "Parsing schedule..."
                : fileName
                ? `Loaded: ${fileName}`
                : "Choose Spring schedule Excel file"}
            </div>
          </label>

          <div style={styles.helperText}>
            This importer follows your scanner logic: date headers in column A, Sim Ops in B, rooms in C, times in D.
          </div>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Sessions Parsed</div>
            <div style={styles.summaryValue}>{summary.sessionCount}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Events Found</div>
            <div style={styles.summaryValue}>{summary.eventCount}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Sim Ops Found</div>
            <div style={styles.summaryValue}>{summary.simOpCount}</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionRow}>
            <h2 style={styles.sectionTitle}>2. Preview Events</h2>
            <button style={styles.primaryButton} onClick={handleImport}>
              Generate Events
            </button>
          </div>

          {events.length === 0 ? (
            <div style={styles.emptyState}>
              Upload a schedule file to preview imported events here.
            </div>
          ) : (
            <div style={styles.eventList}>
              {events.map((event) => (
                <div key={event.id} style={styles.eventCard}>
                  <div style={styles.eventTop}>
                    <div>
                      <h3 style={styles.eventName}>{event.name}</h3>
                      <div style={styles.eventMeta}>Dates: {event.date_text || "TBD"}</div>
                      <div style={styles.eventMeta}>
                        Sim Ops: {event.assignedSimOps.join(", ") || "None"}
                      </div>
                      <div style={styles.eventMeta}>
                        Leads: {event.leadSimOps.join(", ") || "None"}
                      </div>
                    </div>
                    <div style={styles.badge}>{event.sessions.length} sessions</div>
                  </div>

                  <div style={styles.sessionTableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Room</th>
                          <th style={styles.th}>Start</th>
                          <th style={styles.th}>End</th>
                          <th style={styles.th}>Lead</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.sessions.slice(0, 6).map((session) => (
                          <tr key={session.id}>
                            <td style={styles.td}>{session.date}</td>
                            <td style={styles.td}>{session.room || session.roomRaw}</td>
                            <td style={styles.td}>{session.startTime}</td>
                            <td style={styles.td}>{session.endTime}</td>
                            <td style={styles.td}>{session.lead || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {event.sessions.length > 6 ? (
                    <div style={styles.moreText}>
                      + {event.sessions.length - 6} more sessions
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "32px 20px 60px",
  },
  shell: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 800,
    color: "#183153",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#5f7183",
  },
  headerLinks: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "11px 15px",
    borderRadius: "10px",
    border: "1px solid #d8e0ec",
    background: "#fff",
    color: "#183153",
    fontWeight: 700,
  },
  success: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    fontWeight: 700,
  },
  error: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    fontWeight: 700,
  },
  card: {
    background: "#fff",
    border: "1px solid #d8e0ec",
    borderRadius: "18px",
    padding: "22px",
    marginBottom: "18px",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#183153",
  },
  sectionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  uploadBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #cfd8e3",
    borderRadius: "16px",
    minHeight: "110px",
    cursor: "pointer",
    background: "#f8fbff",
  },
  uploadText: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#183153",
  },
  helperText: {
    marginTop: "12px",
    color: "#64748b",
    fontSize: "14px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #d8e0ec",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 16px rgba(19, 40, 72, 0.05)",
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontWeight: 800,
    marginBottom: "8px",
  },
  summaryValue: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#183153",
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
  emptyState: {
    border: "1px dashed #cfd8e3",
    borderRadius: "16px",
    padding: "28px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
  },
  eventList: {
    display: "grid",
    gap: "16px",
  },
  eventCard: {
    border: "1px solid #d8e0ec",
    borderRadius: "16px",
    padding: "18px",
    background: "#fdfefe",
  },
  eventTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  eventName: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: 800,
    color: "#183153",
  },
  eventMeta: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "4px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    fontWeight: 800,
    fontSize: "12px",
  },
  sessionTableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: "13px",
    color: "#475569",
    padding: "10px 8px",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    color: "#1e293b",
  },
  moreText: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 700,
  },
};
<h1 style={{ color: "red" }}>NEW BUILD LIVE</h1>
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";

type Visibility = "team" | "personal";
type ViewFilter = "all" | Visibility;

type EventRow = {
  id: string;
  name: string | null;
  status: string | null;
  date_text: string | null;
  sp_needed: number | null;
  sp_assigned: number | null;
  visibility: string | null;
  created_at: string | null;
};

const STATUSES = ["Needs SPs", "Scheduled", "In Progress", "Complete"];
const VISIBILITIES: Visibility[] = ["team", "personal"];
<h1 style={{ color: "red" }}>TEST UPDATE LIVE</h1>
function parseNumber(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function shortage(event: EventRow) {
  const needed = event.sp_needed ?? 0;
  const assigned = event.sp_assigned ?? 0;
  return Math.max(needed - assigned, 0);
}

function normalizedVisibility(value: string | null): Visibility {
  return value?.toLowerCase() === "personal" ? "personal" : "team";
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function duplicateKey(event: EventRow) {
  return [
    normalizeText(event.name),
    normalizeText(event.date_text),
    normalizedVisibility(event.visibility),
  ].join("|");
}

function statusRank(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "needs sps":
      return 0;
    case "scheduled":
      return 1;
    case "in progress":
      return 2;
    case "complete":
      return 3;
    default:
      return 4;
  }
}

function compareEvents(a: EventRow, b: EventRow) {
  const shortDiff = shortage(b) - shortage(a);
  if (shortDiff !== 0) return shortDiff;

  const statusDiff = statusRank(a.status) - statusRank(b.status);
  if (statusDiff !== 0) return statusDiff;

  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
  return dateB - dateA;
}

function getStatusBadgeStyle(status: string | null): React.CSSProperties {
  const s = (status ?? "").toLowerCase();

  if (s === "needs sps") {
    return {
      ...statusBadgeBaseStyle,
      border: "1px solid #7a3a3a",
      color: "#ffb3b3",
      background: "rgba(140, 40, 40, 0.18)",
    };
  }

  if (s === "scheduled") {
    return {
      ...statusBadgeBaseStyle,
      border: "1px solid #5f547a",
      color: "#d5c6ff",
      background: "rgba(84, 60, 140, 0.18)",
    };
  }

  if (s === "in progress") {
    return {
      ...statusBadgeBaseStyle,
      border: "1px solid #7a6b3a",
      color: "#ffe7a3",
      background: "rgba(140, 120, 40, 0.18)",
    };
  }

  if (s === "complete") {
    return {
      ...statusBadgeBaseStyle,
      border: "1px solid #2f6a4d",
      color: "#aef0c6",
      background: "rgba(30, 110, 70, 0.18)",
    };
  }

  return statusBadgeBaseStyle;
}

export default function Page() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Needs SPs");
  const [dateText, setDateText] = useState("");
  const [spNeeded, setSpNeeded] = useState("");
  const [spAssigned, setSpAssigned] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("team");

  const [view, setView] = useState<ViewFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select("id, name, status, date_text, sp_needed, sp_assigned, visibility, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading events:", error);
      alert("Could not load events.");
      setLoading(false);
      return;
    }

    setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function clearForm() {
    setName("");
    setStatus("Needs SPs");
    setDateText("");
    setSpNeeded("");
    setSpAssigned("");
    setVisibility("team");
    setEditingId(null);
  }

  async function handleSaveEvent() {
    if (saving) return;

    const cleanName = name.trim();
    const cleanDateText = dateText.trim();
    const needed = parseNumber(spNeeded);
    const assigned = parseNumber(spAssigned);

    if (!cleanName) {
      alert("Please enter an event name.");
      return;
    }

    if (assigned > needed) {
      alert("SP Assigned cannot be greater than SP Needed.");
      return;
    }

    const payload = {
      name: cleanName,
      status,
      date_text: cleanDateText,
      sp_needed: needed,
      sp_assigned: assigned,
      visibility,
    };

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error("Error updating event:", error);
        alert("Could not update event: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("events").insert([payload]);

      if (error) {
        console.error("Error creating event:", error);
        alert("Could not save event.");
        setSaving(false);
        return;
      }
    }

    clearForm();
    await loadEvents();
    setSaving(false);
  }

  async function handleAdjustAssigned(event: EventRow, change: number) {
    const currentAssigned = event.sp_assigned ?? 0;
    const needed = event.sp_needed ?? 0;
    const nextAssigned = currentAssigned + change;

    if (nextAssigned < 0) return;
    if (nextAssigned > needed) return;

    const { error } = await supabase
      .from("events")
      .update({
        sp_assigned: nextAssigned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    if (error) {
      console.error("Adjust assigned error:", error);
      alert("Could not update SP Assigned: " + error.message);
      return;
    }

    await loadEvents();
  }

  function handleEdit(event: EventRow) {
    setEditingId(event.id);
    setName(event.name ?? "");
    setStatus(event.status ?? "Needs SPs");
    setDateText(event.date_text ?? "");
    setSpNeeded(String(event.sp_needed ?? 0));
    setSpAssigned(String(event.sp_assigned ?? 0));
    setVisibility(normalizedVisibility(event.visibility));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (deletingId) return;

    const ok = window.confirm("Delete this event?");
    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      alert("Could not delete event.");
      setDeletingId(null);
      return;
    }

    if (editingId === id) clearForm();
    await loadEvents();
    setDeletingId(null);
  }

  const filteredEvents = useMemo(() => {
    const visible =
      view === "all"
        ? events
        : events.filter((e) => normalizedVisibility(e.visibility) === view);

    const seen = new Set<string>();
    const deduped: EventRow[] = [];

    for (const event of visible) {
      const key = duplicateKey(event);
      if (!key || key === "||team") {
        deduped.push(event);
        continue;
      }

      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(event);
      }
    }

    return [...deduped].sort(compareEvents);
  }, [events, view]);

  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const needsSps = filteredEvents.filter(
      (e) => (e.status ?? "").toLowerCase() === "needs sps"
    ).length;
    const totalNeeded = filteredEvents.reduce((sum, e) => sum + (e.sp_needed ?? 0), 0);
    const totalAssigned = filteredEvents.reduce((sum, e) => sum + (e.sp_assigned ?? 0), 0);
    const totalShort = filteredEvents.reduce((sum, e) => sum + shortage(e), 0);

    return { total, needsSps, totalNeeded, totalAssigned, totalShort };
  }, [filteredEvents]);

  const liveNeeded = parseNumber(spNeeded);
  const liveAssigned = parseNumber(spAssigned);
  const liveShortage = Math.max(liveNeeded - liveAssigned, 0);
  const assignedTooHigh = liveAssigned > liveNeeded;

  return (
    <main style={pageStyle}>
      <div style={backgroundGlowStyle} />
      <div style={appShellStyle}>
        <div style={headerWrapStyle}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={eyebrowStyle}>Conflict Free SP</div>
            <h1 style={titleStyle}>CFSP Ops Board</h1>
            <p style={subtitleStyle}>Simulation Operations dashboard for events, shortages, and SP coverage.</p>
          </div>

          <div style={headerControlsStyle}>
            <div style={fieldWrapCompactStyle}>
              <label style={labelStyle}>View</label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as ViewFilter)}
                style={inputStyle}
              >
                <option value="all">All</option>
                <option value="team">Team</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <Link href="/sps" style={buttonLinkStyle}>
              SP Database
            </Link>

            <button style={{ ...buttonStyle, opacity: 0.55, cursor: "default" }}>
              Sign out
            </button>
          </div>
        </div>

        <section style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Visible Events</div>
            <div style={statValueStyle}>{stats.total}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Needs SPs</div>
            <div style={statValueStyle}>{stats.needsSps}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>SP Needed</div>
            <div style={statValueStyle}>{stats.totalNeeded}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>SP Assigned</div>
            <div style={statValueStyle}>{stats.totalAssigned}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Short</div>
            <div
              style={{
                ...statValueStyle,
                color: stats.totalShort > 0 ? "#ffb3b3" : "#ffffff",
              }}
            >
              {stats.totalShort}
            </div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={panelTitleStyle}>{editingId ? "Edit Event" : "Create Event"}</h2>
              <p style={panelSubtitleStyle}>
                {editingId
                  ? "Update the selected event and save your changes."
                  : "Add a new event to the live operations board."}
              </p>
            </div>

            <div style={helperBadgeRowStyle}>
              <span style={helperPillStyle}>Live shortage: {liveShortage}</span>
              <span
                style={{
                  ...helperPillStyle,
                  ...(assignedTooHigh
                    ? {
                        border: "1px solid #7a3a3a",
                        color: "#ffb3b3",
                        background: "rgba(140, 40, 40, 0.18)",
                      }
                    : {}),
                }}
              >
                {assignedTooHigh ? "Assigned exceeds needed" : "Counts look valid"}
              </span>
            </div>
          </div>

          <div style={gridStyle}>
            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="N651 Virtual"
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={inputStyle}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Date (text)</label>
              <input
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                style={inputStyle}
                placeholder="3/10, 3/11"
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>SP Needed</label>
              <input
                value={spNeeded}
                onChange={(e) => setSpNeeded(e.target.value)}
                style={inputStyle}
                placeholder="6"
                type="number"
                min="0"
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>SP Assigned</label>
              <input
                value={spAssigned}
                onChange={(e) => setSpAssigned(e.target.value)}
                style={inputStyle}
                placeholder="2"
                type="number"
                min="0"
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                style={inputStyle}
              >
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={buttonRowStyle}>
            <button onClick={handleSaveEvent} style={primaryButtonStyle} disabled={saving}>
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                  ? "Update Event"
                  : "Add Event"}
            </button>

            <button onClick={loadEvents} style={buttonStyle} disabled={loading || saving}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button onClick={clearForm} style={buttonStyle} disabled={saving}>
              {editingId ? "Cancel Edit" : "Clear"}
            </button>
          </div>

          {editingId && (
            <p style={editingHintStyle}>
              Editing existing event. Click “Cancel Edit” to stop.
            </p>
          )}
        </section>

        {loading ? (
          <section style={emptyStateStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Loading events...</h2>
            <p style={{ margin: 0, color: "#a9a9b3" }}>
              Pulling the latest data from Supabase.
            </p>
          </section>
        ) : filteredEvents.length === 0 ? (
          <section style={emptyStateStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>No events to show</h2>
            <p style={{ margin: 0, color: "#a9a9b3" }}>
              Add your first event above, or change the current view filter.
            </p>
          </section>
        ) : (
          <section style={cardsGridStyle}>
            {filteredEvents.map((event) => {
              const short = shortage(event);
              const statusStyle = getStatusBadgeStyle(event.status);

              return (
                <article
                  key={event.id}
                  style={{
                    ...cardStyle,
                    ...(short > 0 ? urgentCardStyle : {}),
                  }}
                >
                  <div style={cardTopRowStyle}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={cardTitleStyle}>{event.name || "Untitled Event"}</h2>

                      <div style={badgeRowStyle}>
                        <span
                          style={
                            normalizedVisibility(event.visibility) === "personal"
                              ? personalPillStyle
                              : teamPillStyle
                          }
                        >
                          {normalizedVisibility(event.visibility) === "personal" ? "Personal" : "Team"}
                        </span>

                        <span style={statusStyle}>{event.status || "Unknown"}</span>

                        {short > 0 && <span style={shortagePillStyle}>Short {short}</span>}
                      </div>
                    </div>

                    <div style={actionRowStyle}>
                      <Link href={`/events/${event.id}`} style={miniLinkStyle}>
                        Details
                      </Link>

                      <button
                        onClick={() => handleEdit(event)}
                        style={iconButtonStyle}
                        title="Edit"
                        disabled={saving || !!deletingId}
                      >
                        ✎
                      </button>

                      <button
                        onClick={() => handleDelete(event.id)}
                        style={iconButtonStyle}
                        title="Delete"
                        disabled={saving || !!deletingId}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  <div style={cardBodyStyle}>
                    <div style={infoRowStyle}>
                      <span style={infoLabelStyle}>Date</span>
                      <span style={infoValueStyle}>{event.date_text || "-"}</span>
                    </div>

                    <div style={infoRowStyle}>
                      <span style={infoLabelStyle}>Coverage</span>
                      <span style={infoValueStyle}>
                        {event.sp_assigned ?? 0} / {event.sp_needed ?? 0}
                      </span>
                    </div>

                    <div style={adjustRowStyle}>
                      <div style={coverageMeterWrapStyle}>
                        <div style={coverageTrackStyle}>
                          <div
                            style={{
                              ...coverageFillStyle,
                              width: `${
                                Math.min(
                                  100,
                                  Math.round(
                                    ((event.sp_assigned ?? 0) / Math.max(event.sp_needed ?? 0, 1)) * 100
                                  )
                                )
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div style={adjustButtonsStyle}>
                        <button
                          onClick={() => handleAdjustAssigned(event, -1)}
                          style={iconButtonStyle}
                          title="Remove one SP"
                          disabled={(event.sp_assigned ?? 0) <= 0}
                        >
                          −
                        </button>

                        <button
                          onClick={() => handleAdjustAssigned(event, 1)}
                          style={iconButtonStyle}
                          title="Add one SP"
                          disabled={(event.sp_assigned ?? 0) >= (event.sp_needed ?? 0)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(36,36,46,0.55) 0%, rgba(10,10,12,1) 34%, rgba(0,0,0,1) 100%)",
  color: "#fff",
  padding: "24px 16px 48px",
  fontFamily:
    'Inter, Arial, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  position: "relative",
};

const backgroundGlowStyle: React.CSSProperties = {
  position: "fixed",
  top: -120,
  left: "50%",
  transform: "translateX(-50%)",
  width: "70vw",
  height: 280,
  borderRadius: "50%",
  background: "rgba(122, 98, 255, 0.08)",
  filter: "blur(90px)",
  pointerEvents: "none",
  zIndex: 0,
};

const appShellStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
  position: "relative",
  zIndex: 1,
};

const headerWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginBottom: 24,
  flexWrap: "wrap",
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 12,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #2a2a35",
  background: "rgba(255,255,255,0.03)",
  color: "#b8b8c7",
  fontSize: 12,
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(40px, 8vw, 72px)",
  lineHeight: 1,
  fontWeight: 500,
  margin: 0,
  letterSpacing: -1.8,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 14,
  marginBottom: 0,
  fontSize: "clamp(16px, 2vw, 19px)",
  color: "#b7b7c2",
  maxWidth: 720,
  lineHeight: 1.5,
};

const headerControlsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "end",
  gap: 12,
  flexWrap: "wrap",
};

const fieldWrapStyle: React.CSSProperties = {
  minWidth: 0,
};

const fieldWrapCompactStyle: React.CSSProperties = {
  minWidth: 140,
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 14,
  marginBottom: 22,
};

const statCardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: "18px 18px 16px",
  background: "linear-gradient(180deg, rgba(18,18,22,0.95), rgba(10,10,12,0.92))",
  boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
};

const statLabelStyle: React.CSSProperties = {
  color: "#b8b8c7",
  fontSize: 13,
  marginBottom: 10,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 38,
  fontWeight: 700,
  letterSpacing: -1,
};

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 20,
  marginBottom: 22,
  background: "linear-gradient(180deg, rgba(12,12,16,0.96), rgba(8,8,10,0.96))",
  boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
  marginBottom: 18,
  flexWrap: "wrap",
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: -0.5,
};

const panelSubtitleStyle: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#9ea0ad",
  fontSize: 14,
};

const helperBadgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const helperPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 34,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #31313d",
  background: "rgba(255,255,255,0.03)",
  color: "#d7d7df",
  fontSize: 13,
};

const emptyStateStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 24,
  background: "linear-gradient(180deg, rgba(12,12,16,0.96), rgba(8,8,10,0.96))",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#cfcfe0",
  fontSize: 14,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 54,
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid #2f3038",
  background: "#08090c",
  color: "#fff",
  fontSize: 16,
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 18,
  flexWrap: "wrap",
};

const buttonStyle: React.CSSProperties = {
  minHeight: 50,
  padding: "14px 18px",
  borderRadius: 18,
  border: "1px solid #343643",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "linear-gradient(180deg, #2a2b35 0%, #1b1c23 100%)",
  border: "1px solid #4a4c59",
};

const buttonLinkStyle: React.CSSProperties = {
  ...buttonStyle,
};

const editingHintStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#b7b7c2",
  fontSize: 14,
};

const cardsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 26,
  padding: 18,
  background: "linear-gradient(180deg, rgba(15,15,19,0.96), rgba(10,10,13,0.96))",
  boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
};

const urgentCardStyle: React.CSSProperties = {
  boxShadow: "0 0 0 1px rgba(180,60,60,0.18), 0 18px 36px rgba(0,0,0,0.24)",
};

const cardTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 26,
  lineHeight: 1.1,
  letterSpacing: -0.8,
  wordBreak: "break-word",
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 14,
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const miniLinkStyle: React.CSSProperties = {
  minHeight: 42,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid #363846",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 15,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const iconButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  border: "1px solid #363846",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const cardBodyStyle: React.CSSProperties = {
  marginTop: 18,
};

const infoRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const infoLabelStyle: React.CSSProperties = {
  color: "#9fa2b2",
  fontSize: 14,
};

const infoValueStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 500,
  textAlign: "right",
};

const adjustRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 16,
  flexWrap: "wrap",
};

const coverageMeterWrapStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 160,
};

const coverageTrackStyle: React.CSSProperties = {
  width: "100%",
  height: 10,
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const coverageFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #7c6cff 0%, #9b8dff 100%)",
};

const adjustButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const teamPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #474a57",
  color: "#d7d9e5",
  background: "rgba(255,255,255,0.03)",
  fontSize: 13,
};

const personalPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #4a4065",
  color: "#d8cfff",
  background: "rgba(92, 72, 140, 0.18)",
  fontSize: 13,
};

const statusBadgeBaseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #474747",
  color: "#d7d7d7",
  background: "rgba(255,255,255,0.03)",
  fontSize: 13,
};

const shortagePillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #7a3a3a",
  color: "#ffb3b3",
  background: "rgba(140, 40, 40, 0.18)",
  fontSize: 13,
};
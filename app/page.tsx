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

export default function Page() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
      .select(
        "id, name, status, date_text, sp_needed, sp_assigned, visibility, created_at"
      )
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

    if (!cleanDateText) {
      alert("Please enter a date.");
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
        alert("Could not save event: " + error.message);
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
      alert("Could not delete event: " + error.message);
      setDeletingId(null);
      return;
    }

    if (editingId === id) clearForm();
    await loadEvents();
    setDeletingId(null);
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      alert("Could not sign out: " + error.message);
      setSigningOut(false);
      return;
    }

    window.location.href = "/login";
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
    const totalNeeded = filteredEvents.reduce(
      (sum, e) => sum + (e.sp_needed ?? 0),
      0
    );
    const totalAssigned = filteredEvents.reduce(
      (sum, e) => sum + (e.sp_assigned ?? 0),
      0
    );
    const totalShort = filteredEvents.reduce((sum, e) => sum + shortage(e), 0);

    return { total, needsSps, totalNeeded, totalAssigned, totalShort };
  }, [filteredEvents]);

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={topBarStyle}>
          <div style={brandWrapStyle}>
            <img
              src="/cfsp-logo.png"
              alt="CFSP Logo"
              style={logoStyle}
            />

            <div>
              <h1 style={titleStyle}>CFSP Ops Board</h1>
              <p style={subtitleStyle}>
                Conflict Free SP · Simulation Operations
              </p>
            </div>
          </div>

          <div style={toolbarStyle}>
            <div style={fieldBlockStyle}>
              <label style={labelStyle}>View</label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value as ViewFilter)}
                style={toolbarSelectStyle}
              >
                <option value="all">All</option>
                <option value="team">Team</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <Link href="/events/new" style={toolbarButtonLinkStyle}>
              + New Event
            </Link>

            <Link href="/sps" style={toolbarButtonLinkStyle}>
              SP Database
            </Link>

            <button
              style={toolbarButtonStyle}
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </section>

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
                color: stats.totalShort > 0 ? "#b42318" : "#101828",
              }}
            >
              {stats.totalShort}
            </div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>
              {editingId ? "Edit Event" : "Event Intake"}
            </div>
            {editingId && <div style={editBadgeStyle}>Editing</div>}
          </div>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="N651 Virtual"
              />
            </div>

            <div>
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

            <div>
              <label style={labelStyle}>Date (text)</label>
              <input
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                style={inputStyle}
                placeholder="3/10, 3/11"
              />
            </div>

            <div>
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

            <div>
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

            <div>
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

          <div style={formActionsStyle}>
            <button onClick={handleSaveEvent} style={buttonStyle} disabled={saving}>
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
            <p style={editingNoteStyle}>
              Editing existing event. Click “Cancel Edit” to stop.
            </p>
          )}
        </section>

        {loading ? (
          <p style={infoTextStyle}>Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <section style={emptyStateStyle}>
            <h2 style={emptyTitleStyle}>No events to show</h2>
            <p style={emptyTextStyle}>
              Add your first event above, or change the current view filter.
            </p>
          </section>
        ) : (
          <section style={cardsGridStyle}>
            {filteredEvents.map((event) => {
              const short = shortage(event);

              return (
                <article key={event.id} style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    <div>
                      <h2 style={cardTitleStyle}>{event.name || "Untitled Event"}</h2>

                      <div style={pillStyle}>
                        {normalizedVisibility(event.visibility) === "personal"
                          ? "Personal"
                          : "Team"}
                      </div>
                    </div>

                    <div style={cardActionsStyle}>
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
                        style={dangerIconButtonStyle}
                        title="Delete"
                        disabled={saving || !!deletingId}
                      >
                        {deletingId === event.id ? "…" : "🗑"}
                      </button>
                    </div>
                  </div>

                  <div style={cardBodyStyle}>
                    <div>
                      <strong>Status:</strong> {event.status || "-"}
                    </div>

                    <div>
                      <strong>Date:</strong> {event.date_text || "-"}
                    </div>

                    <div style={spRowStyle}>
                      <div>
                        <strong>SPs:</strong> {event.sp_assigned ?? 0} /{" "}
                        {event.sp_needed ?? 0}
                      </div>

                      <button
                        onClick={() => handleAdjustAssigned(event, -1)}
                        style={iconButtonStyle}
                        title="Remove one SP"
                        disabled={(event.sp_assigned ?? 0) <= 0}
                      >
                        -
                      </button>

                      <button
                        onClick={() => handleAdjustAssigned(event, 1)}
                        style={iconButtonStyle}
                        title="Add one SP"
                        disabled={(event.sp_assigned ?? 0) >= (event.sp_needed ?? 0)}
                      >
                        +
                      </button>

                      {short > 0 && <span style={shortagePillStyle}>Short {short}</span>}
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
  background: "linear-gradient(180deg, #f8fafc 0%, #eef4fb 50%, #e9f0f8 100%)",
  color: "#101828",
  padding: "24px 24px 40px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1320,
  margin: "0 auto",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
  flexWrap: "wrap",
  padding: "10px 4px 2px",
};

const brandWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  minWidth: 0,
};

const logoStyle: React.CSSProperties = {
  height: 92,
  width: "auto",
  objectFit: "contain",
  borderRadius: 12,
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: 46,
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.05,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "8px 0 0 0",
  fontSize: 16,
  color: "#475467",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 12,
  flexWrap: "wrap",
};

const fieldBlockStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const toolbarSelectStyle: React.CSSProperties = {
  minWidth: 124,
  height: 52,
  padding: "0 14px",
  borderRadius: 16,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  fontSize: 16,
  outline: "none",
};

const toolbarButtonStyle: React.CSSProperties = {
  height: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const toolbarButtonLinkStyle: React.CSSProperties = {
  height: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  fontSize: 16,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginBottom: 22,
};

const statCardStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 20,
  padding: "16px 18px",
  background: "rgba(255, 255, 255, 0.85)",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
};

const statLabelStyle: React.CSSProperties = {
  color: "#667085",
  fontSize: 13,
  marginBottom: 8,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  color: "#101828",
};

const panelStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 24,
  padding: 18,
  marginBottom: 22,
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#101828",
};

const editBadgeStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  color: "#175cd3",
  background: "#eff8ff",
  border: "1px solid #b2ddff",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#475467",
  fontSize: 14,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 16,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const formActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginTop: 18,
  flexWrap: "wrap",
};

const editingNoteStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#475467",
  fontSize: 14,
};

const infoTextStyle: React.CSSProperties = {
  color: "#475467",
};

const emptyStateStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 24,
  padding: 24,
  background: "rgba(255, 255, 255, 0.88)",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
};

const emptyTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 8,
  color: "#101828",
};

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#667085",
};

const cardsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 24,
  padding: 18,
  background: "rgba(255, 255, 255, 0.92)",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  color: "#101828",
};

const cardActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const cardBodyStyle: React.CSSProperties = {
  marginTop: 18,
  lineHeight: 1.8,
  fontSize: 18,
  color: "#101828",
};

const miniLinkStyle: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
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
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  cursor: "pointer",
  fontSize: 18,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const dangerIconButtonStyle: React.CSSProperties = {
  ...iconButtonStyle,
  color: "#b42318",
};

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #d0d5dd",
  color: "#475467",
  fontSize: 14,
  background: "#f8fafc",
};

const spRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 8,
  flexWrap: "wrap",
};

const shortagePillStyle: React.CSSProperties = {
  display: "inline-block",
  marginLeft: 4,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #f0c5c1",
  color: "#b42318",
  background: "#fef3f2",
  fontSize: 14,
};
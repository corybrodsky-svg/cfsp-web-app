"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";
<Link
  href="/events/new"
  style={{
    display: "inline-block",
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#111",
    marginBottom: "16px",
  }}
>
  + New Event
</Link>
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

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "32px 24px 48px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 56, fontWeight: 400, margin: 0 }}>CFSP Ops Board</h1>
            <p style={{ marginTop: 8, fontSize: 18, color: "#cfcfcf" }}>
              Conflict Free SP · Simulation Operations
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
            <div>
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

            <button style={{ ...buttonStyle, opacity: 0.6, cursor: "default" }}>
              Sign out
            </button>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 22,
          }}
        >
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
            <div style={{ ...statValueStyle, color: stats.totalShort > 0 ? "#ffb3b3" : "#fff" }}>
              {stats.totalShort}
            </div>
          </div>
        </section>

        <section style={panelStyle}>
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

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
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
            <p style={{ marginTop: 14, color: "#cfcfcf", fontSize: 14 }}>
              Editing existing event. Click “Cancel Edit” to stop.
            </p>
          )}
        </section>

        {loading ? (
          <p style={{ color: "#cfcfcf" }}>Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <section style={emptyStateStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>No events to show</h2>
            <p style={{ margin: 0, color: "#cfcfcf" }}>
              Add your first event above, or change the current view filter.
            </p>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
              gap: 16,
            }}
          >
            {filteredEvents.map((event) => {
              const short = shortage(event);
              const isDeleting = deletingId === event.id;

              return (
                <article key={event.id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 22 }}>
                        {event.name || "Untitled Event"}
                      </h2>

                      <div style={pillStyle}>
                        {normalizedVisibility(event.visibility) === "personal" ? "Personal" : "Team"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
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

                  <div style={{ marginTop: 18, lineHeight: 1.8, fontSize: 18 }}>
                    <div>
                      <strong>Status:</strong> {event.status || "-"}
                    </div>

                    <div>
                      <strong>Date:</strong> {event.date_text || "-"}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div>
                        <strong>SPs:</strong> {event.sp_assigned ?? 0} / {event.sp_needed ?? 0}
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

                      {short > 0 && (
                        <span style={shortagePillStyle}>Short {short}</span>
                      )}
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

const panelStyle: React.CSSProperties = {
  border: "1px solid #2e2e2e",
  borderRadius: 24,
  padding: 18,
  marginBottom: 22,
  background: "#0b0b0b",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #2e2e2e",
  borderRadius: 24,
  padding: 18,
  background: "#0f0f0f",
};

const statCardStyle: React.CSSProperties = {
  border: "1px solid #2e2e2e",
  borderRadius: 20,
  padding: "16px 18px",
  background: "#0d0d0d",
};

const statLabelStyle: React.CSSProperties = {
  color: "#cfcfcf",
  fontSize: 13,
  marginBottom: 8,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 600,
};

const emptyStateStyle: React.CSSProperties = {
  border: "1px solid #2e2e2e",
  borderRadius: 24,
  padding: 24,
  background: "#0b0b0b",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#cfcfcf",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #333",
  background: "#050505",
  color: "#fff",
  fontSize: 16,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 16,
  border: "1px solid #3a3a3a",
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
};

const buttonLinkStyle: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: 16,
  border: "1px solid #3a3a3a",
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 16,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const miniLinkStyle: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid #3a3a3a",
  background: "#1a1a1a",
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
  border: "1px solid #3a3a3a",
  background: "#1a1a1a",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 12,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #474747",
  color: "#d7d7d7",
  fontSize: 14,
};

const shortagePillStyle: React.CSSProperties = {
  display: "inline-block",
  marginLeft: 12,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #7a3a3a",
  color: "#ffb3b3",
  background: "rgba(140, 40, 40, 0.18)",
  fontSize: 14,
};
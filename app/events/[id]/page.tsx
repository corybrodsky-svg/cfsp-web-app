"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Visibility = "team" | "personal";

type EventDetailRow = {
  id: string;
  name: string | null;
  status: string | null;
  date_text: string | null;
  sp_needed: number | null;
  sp_assigned: number | null;
  visibility: string | null;
  created_at: string | null;

  location: string | null;
  zoom_link: string | null;
  training_info: string | null;
  faculty_contact: string | null;
  notes: string | null;
};

const STATUSES = ["Needs SPs", "Scheduled", "In Progress", "Complete"];
const VISIBILITIES: Visibility[] = ["team", "personal"];

function parseNumber(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function normalizedVisibility(value: string | null): Visibility {
  return value?.toLowerCase() === "personal" ? "personal" : "team";
}

function shortage(event: {
  sp_needed: number | null;
  sp_assigned: number | null;
}) {
  const needed = event.sp_needed ?? 0;
  const assigned = event.sp_assigned ?? 0;
  return Math.max(needed - assigned, 0);
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Needs SPs");
  const [dateText, setDateText] = useState("");
  const [spNeeded, setSpNeeded] = useState("");
  const [spAssigned, setSpAssigned] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("team");

  const [location, setLocation] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [trainingInfo, setTrainingInfo] = useState("");
  const [facultyContact, setFacultyContact] = useState("");
  const [notes, setNotes] = useState("");

  async function loadEvent() {
    if (!eventId || typeof eventId !== "string") {
      alert("Missing event ID.");
      router.push("/");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select(
        `
          id,
          name,
          status,
          date_text,
          sp_needed,
          sp_assigned,
          visibility,
          created_at,
          location,
          zoom_link,
          training_info,
          faculty_contact,
          notes
        `
      )
      .eq("id", eventId)
      .single();

    if (error || !data) {
      console.error("Error loading event:", error);
      alert("Could not load event details.");
      setLoading(false);
      router.push("/");
      return;
    }

    const event = data as EventDetailRow;

    setName(event.name ?? "");
    setStatus(event.status ?? "Needs SPs");
    setDateText(event.date_text ?? "");
    setSpNeeded(String(event.sp_needed ?? 0));
    setSpAssigned(String(event.sp_assigned ?? 0));
    setVisibility(normalizedVisibility(event.visibility));

    setLocation(event.location ?? "");
    setZoomLink(event.zoom_link ?? "");
    setTrainingInfo(event.training_info ?? "");
    setFacultyContact(event.faculty_contact ?? "");
    setNotes(event.notes ?? "");

    setLoading(false);
  }

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  async function handleSave() {
    if (!eventId || typeof eventId !== "string") return;
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

    setSaving(true);

    const payload = {
      name: cleanName,
      status,
      date_text: cleanDateText,
      sp_needed: needed,
      sp_assigned: assigned,
      visibility,
      location: location.trim(),
      zoom_link: zoomLink.trim(),
      training_info: trainingInfo.trim(),
      faculty_contact: facultyContact.trim(),
      notes: notes.trim(),
    };

    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", eventId);

    if (error) {
      console.error("Save error:", error);
      alert("Could not save event: " + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    alert("Event updated.");
    await loadEvent();
  }

  async function handleDelete() {
    if (!eventId || typeof eventId !== "string") return;
    if (deleting) return;

    const ok = window.confirm("Delete this event?");
    if (!ok) return;

    setDeleting(true);

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Delete error:", error);
      alert("Could not delete event: " + error.message);
      setDeleting(false);
      return;
    }

    router.push("/");
  }

  const liveShortage = useMemo(() => {
    return Math.max(parseNumber(spNeeded) - parseNumber(spAssigned), 0);
  }, [spNeeded, spAssigned]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={shellStyle}>
          <div style={loadingCardStyle}>Loading event details...</div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={topBarStyle}>
          <div style={brandWrapStyle}>
            <img src="/cfsp-logo.png" alt="CFSP Logo" style={logoStyle} />
           <Link href="/" style={toolbarGhostLinkStyle}>
  ← Back to Board
</Link>
          </div>

          <div style={toolbarStyle}>
            <Link href="/" style={toolbarGhostLinkStyle}>
              ← Back to Board
            </Link>

            <button
              onClick={handleSave}
              style={toolbarPrimaryButtonStyle}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleDelete}
              style={toolbarDangerButtonStyle}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </button>
          </div>
        </section>

        <section style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Status</div>
            <div style={statValueStyle}>{status}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>SP Needed</div>
            <div style={statValueStyle}>{parseNumber(spNeeded)}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>SP Assigned</div>
            <div style={statValueStyle}>{parseNumber(spAssigned)}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Shortage</div>
            <div
              style={{
                ...statValueStyle,
                color: liveShortage > 0 ? "#b42318" : "#027a48",
              }}
            >
              {liveShortage}
            </div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>Core Event Info</div>
          </div>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Event Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Event name"
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

            <div>
              <label style={labelStyle}>SP Needed</label>
              <input
                value={spNeeded}
                onChange={(e) => setSpNeeded(e.target.value)}
                style={inputStyle}
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
                type="number"
                min="0"
              />
            </div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>Operations Details</div>
          </div>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Location / Room</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={inputStyle}
                placeholder="Room, lab, building, etc."
              />
            </div>

            <div>
              <label style={labelStyle}>Zoom Link</label>
              <input
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Training Info</label>
              <textarea
                value={trainingInfo}
                onChange={(e) => setTrainingInfo(e.target.value)}
                style={textareaStyle}
                placeholder="Training date, time, prep notes, expectations..."
              />
            </div>

            <div>
              <label style={labelStyle}>Faculty / Contact</label>
              <input
                value={facultyContact}
                onChange={(e) => setFacultyContact(e.target.value)}
                style={inputStyle}
                placeholder="Faculty lead or contact info"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={largeTextareaStyle}
                placeholder="Instructions, case notes, reminders, operational comments..."
              />
            </div>
          </div>
        </section>
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

const loadingCardStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 24,
  padding: 24,
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
  fontSize: 18,
  fontWeight: 600,
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
  fontSize: 42,
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
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const toolbarPrimaryButtonStyle: React.CSSProperties = {
  height: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "1px solid #175cd3",
  background: "#175cd3",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(23, 92, 211, 0.25)",
};

const toolbarGhostLinkStyle: React.CSSProperties = {
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
};

const toolbarDangerButtonStyle: React.CSSProperties = {
  height: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "1px solid #f04438",
  background: "#ffffff",
  color: "#b42318",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
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
  background: "rgba(255,255,255,0.85)",
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
  background: "rgba(255,255,255,0.9)",
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

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 110,
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#101828",
  fontSize: 16,
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
};

const largeTextareaStyle: React.CSSProperties = {
  ...textareaStyle,
  minHeight: 160,
};
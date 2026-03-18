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

type SPRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  notes: string | null;
  age_range: string | null;
  gender: string | null;
  ethnicity: string | null;
  skills: string | null;
  availability: string | null;
  actor_notes: string | null;
  created_at: string | null;
};

type EventSPRow = {
  id: string;
  event_id: string;
  sp_id: string;
  role_name: string | null;
  assignment_status: string | null;
  notes: string | null;
  created_at: string | null;
};

type AvailabilityRow = {
  id: string;
  sp_id: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  availability_type: string | null;
  notes: string | null;
  created_at: string | null;
};

const STATUSES = ["Needs SPs", "Scheduled", "In Progress", "Complete"];
const VISIBILITIES: Visibility[] = ["team", "personal"];
const ASSIGNMENT_STATUSES = ["Assigned", "Confirmed", "Tentative", "Declined", "Cancelled"];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseNumber(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function normalizedVisibility(value: string | null): Visibility {
  return value?.toLowerCase() === "personal" ? "personal" : "team";
}

function textOrDash(value: string | null | undefined) {
  return value && value.trim() ? value : "—";
}

function formatAvailabilityRow(row: AvailabilityRow) {
  const day = DAY_NAMES[row.day_of_week] ?? `Day ${row.day_of_week}`;
  const type = row.availability_type?.trim() || "Available";
  const time =
    row.start_time || row.end_time
      ? ` (${row.start_time || "?"}–${row.end_time || "?"})`
      : "";
  const note = row.notes?.trim() ? ` — ${row.notes.trim()}` : "";
  return `${day}: ${type}${time}${note}`;
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [refreshingAssignments, setRefreshingAssignments] = useState(false);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Needs SPs");
  const [dateText, setDateText] = useState("");
  const [spNeeded, setSpNeeded] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("team");

  const [location, setLocation] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [trainingInfo, setTrainingInfo] = useState("");
  const [facultyContact, setFacultyContact] = useState("");
  const [notes, setNotes] = useState("");

  const [allSPs, setAllSPs] = useState<SPRow[]>([]);
  const [eventAssignments, setEventAssignments] = useState<EventSPRow[]>([]);
  const [availabilityRows, setAvailabilityRows] = useState<AvailabilityRow[]>([]);

  const [selectedSpId, setSelectedSpId] = useState("");
  const [assignmentRoleName, setAssignmentRoleName] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("Assigned");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  async function syncAssignedCount(nextCount: number) {
    if (!eventId || typeof eventId !== "string") return;

    const { error } = await supabase
      .from("events")
      .update({ sp_assigned: nextCount })
      .eq("id", eventId);

    if (error) {
      console.error("Could not sync assigned count:", error);
    }
  }

  async function loadEvent() {
    if (!eventId || typeof eventId !== "string") {
      alert("Missing event ID.");
      router.push("/");
      return;
    }

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
      router.push("/");
      return;
    }

    const event = data as EventDetailRow;

    setName(event.name ?? "");
    setStatus(event.status ?? "Needs SPs");
    setDateText(event.date_text ?? "");
    setSpNeeded(String(event.sp_needed ?? 0));
    setVisibility(normalizedVisibility(event.visibility));
    setLocation(event.location ?? "");
    setZoomLink(event.zoom_link ?? "");
    setTrainingInfo(event.training_info ?? "");
    setFacultyContact(event.faculty_contact ?? "");
    setNotes(event.notes ?? "");
  }

  async function loadSPs() {
    const { data, error } = await supabase
      .from("sps")
      .select(
        `
          id,
          full_name,
          email,
          phone,
          status,
          notes,
          age_range,
          gender,
          ethnicity,
          skills,
          availability,
          actor_notes,
          created_at
        `
      )
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error loading SPs:", error);
      alert("Could not load SP database.");
      return;
    }

    setAllSPs((data as SPRow[]) ?? []);
  }

  async function loadAssignments() {
    if (!eventId || typeof eventId !== "string") return;

    setRefreshingAssignments(true);

    const { data, error } = await supabase
      .from("event_sps")
      .select(
        `
          id,
          event_id,
          sp_id,
          role_name,
          assignment_status,
          notes,
          created_at
        `
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    setRefreshingAssignments(false);

    if (error) {
      console.error("Error loading assignments:", error);
      alert("Could not load assigned SPs.");
      return;
    }

    const rows = (data as EventSPRow[]) ?? [];
    setEventAssignments(rows);
    await syncAssignedCount(rows.length);
  }

  async function loadAvailability(spIds?: string[]) {
    const ids = (spIds ?? []).filter(Boolean);
    if (ids.length === 0) {
      setAvailabilityRows([]);
      return;
    }

    const { data, error } = await supabase
      .from("sp_availability")
      .select(
        `
          id,
          sp_id,
          day_of_week,
          start_time,
          end_time,
          availability_type,
          notes,
          created_at
        `
      )
      .in("sp_id", ids)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading availability:", error);
      return;
    }

    setAvailabilityRows((data as AvailabilityRow[]) ?? []);
  }

  async function fullLoad() {
    if (!eventId || typeof eventId !== "string") return;

    setLoading(true);
    await loadEvent();
    await loadSPs();

    const { data: assignmentData, error: assignmentError } = await supabase
      .from("event_sps")
      .select(
        `
          id,
          event_id,
          sp_id,
          role_name,
          assignment_status,
          notes,
          created_at
        `
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (assignmentError) {
      console.error("Error loading assignments:", assignmentError);
      alert("Could not load assigned SPs.");
      setLoading(false);
      return;
    }

    const assignments = (assignmentData as EventSPRow[]) ?? [];
    setEventAssignments(assignments);
    await syncAssignedCount(assignments.length);

    const assignedSpIds = uniqueById(
      assignments.map((a) => ({ id: a.sp_id }))
    ).map((x) => x.id);

    if (assignedSpIds.length > 0) {
      await loadAvailability(assignedSpIds);
    } else {
      setAvailabilityRows([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fullLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const assignedCount = eventAssignments.length;

  const assignedSpIdSet = useMemo(() => {
    return new Set(eventAssignments.map((a) => a.sp_id));
  }, [eventAssignments]);

  const availableSPOptions = useMemo(() => {
    return allSPs.filter((sp) => !assignedSpIdSet.has(sp.id));
  }, [allSPs, assignedSpIdSet]);

  const assignmentCards = useMemo(() => {
    return eventAssignments.map((assignment) => {
      const sp = allSPs.find((item) => item.id === assignment.sp_id) ?? null;
      const spAvailability = availabilityRows.filter((row) => row.sp_id === assignment.sp_id);
      return {
        assignment,
        sp,
        spAvailability,
      };
    });
  }, [eventAssignments, allSPs, availabilityRows]);

  const liveShortage = useMemo(() => {
    return Math.max(parseNumber(spNeeded) - assignedCount, 0);
  }, [spNeeded, assignedCount]);
  async function handleSave() {
    if (!eventId || typeof eventId !== "string") return;
    if (saving) return;

    const cleanName = name.trim();
    const cleanDateText = dateText.trim();
    const needed = parseNumber(spNeeded);

    if (!cleanName) {
      alert("Please enter an event name.");
      return;
    }

    if (!cleanDateText) {
      alert("Please enter a date.");
      return;
    }

    setSaving(true);

    const payload = {
      name: cleanName,
      status,
      date_text: cleanDateText,
      sp_needed: needed,
      sp_assigned: assignedCount,
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

    setSaving(false);

    if (error) {
      console.error("Save error:", error);
      alert("Could not save event: " + error.message);
      return;
    }

    alert("Event updated.");
    window.location.href = "/";
    return;
  }

    setSaving(true);

    const payload = {
      name: cleanName,
      status,
      date_text: cleanDateText,
      sp_needed: needed,
      sp_assigned: assignedCount,
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

    setSaving(false);

    if (error) {
      console.error("Save error:", error);
      alert("Could not save event: " + error.message);
      return;
    }

alert("Event updated.");
window.location.href = "/";
return;

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

  async function handleAssignSP() {
    if (!eventId || typeof eventId !== "string") return;
    if (!selectedSpId) {
      alert("Please select an SP.");
      return;
    }
    if (assigning) return;

    setAssigning(true);

    const payload = {
      event_id: eventId,
      sp_id: selectedSpId,
      role_name: assignmentRoleName.trim() || null,
      assignment_status: assignmentStatus || "Assigned",
      notes: assignmentNotes.trim() || null,
    };

    const { error } = await supabase.from("event_sps").insert([payload]);

    setAssigning(false);

    if (error) {
      console.error("Assign error:", error);
      alert("Could not assign SP: " + error.message);
      return;
    }

    setSelectedSpId("");
    setAssignmentRoleName("");
    setAssignmentStatus("Assigned");
    setAssignmentNotes("");

    await loadAssignments();

    const nextAssignedIds = uniqueById(
      [...eventAssignments.map((a) => ({ id: a.sp_id })), { id: payload.sp_id }]
    ).map((x) => x.id);

    await loadAvailability(nextAssignedIds);
  }

  async function handleRemoveAssignment(assignmentId: string) {
    const ok = window.confirm("Remove this SP from the event?");
    if (!ok) return;

    const { error } = await supabase
      .from("event_sps")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("Remove assignment error:", error);
      alert("Could not remove assignment: " + error.message);
      return;
    }

    const nextAssignments = eventAssignments.filter((a) => a.id !== assignmentId);
    setEventAssignments(nextAssignments);
    await syncAssignedCount(nextAssignments.length);

    const nextIds = uniqueById(
      nextAssignments.map((a) => ({ id: a.sp_id }))
    ).map((x) => x.id);

    await loadAvailability(nextIds);
  }

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
            <div>
              <h1 style={titleStyle}>{name || "Event Details"}</h1>
              <p style={subtitleStyle}>Event operations, SP assignments, and availability view</p>
            </div>
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
            <div style={statValueStyle}>{assignedCount}</div>
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
                value={String(assignedCount)}
                style={{ ...inputStyle, background: "#f8fafc", color: "#667085" }}
                readOnly
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

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>Assign SPs to This Event</div>
            <div style={panelHeaderMetaStyle}>
              {refreshingAssignments ? "Refreshing..." : `${assignedCount} assigned`}
            </div>
          </div>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Choose SP</label>
              <select
                value={selectedSpId}
                onChange={(e) => setSelectedSpId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select an SP</option>
                {availableSPOptions.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {(sp.full_name ?? "Unnamed SP") +
                      (sp.status ? ` — ${sp.status}` : "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Role Name</label>
              <input
                value={assignmentRoleName}
                onChange={(e) => setAssignmentRoleName(e.target.value)}
                style={inputStyle}
                placeholder="Chest pain case, parent role, etc."
              />
            </div>

            <div>
              <label style={labelStyle}>Assignment Status</label>
              <select
                value={assignmentStatus}
                onChange={(e) => setAssignmentStatus(e.target.value)}
                style={inputStyle}
              >
                {ASSIGNMENT_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <button
                onClick={handleAssignSP}
                style={{ ...toolbarPrimaryButtonStyle, width: "100%" }}
                disabled={assigning}
              >
                {assigning ? "Assigning..." : "Assign SP"}
              </button>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Assignment Notes</label>
              <textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                style={textareaStyle}
                placeholder="Special fit, tentative hold, callback notes..."
              />
            </div>
          </div>

          {assignmentCards.length === 0 ? (
            <div style={emptyStateStyle}>No SPs assigned to this event yet.</div>
          ) : (
            <div style={assignmentListStyle}>
              {assignmentCards.map(({ assignment, sp, spAvailability }) => (
                <div key={assignment.id} style={assignmentCardStyle}>
                  <div style={assignmentTopRowStyle}>
                    <div>
                      <div style={assignmentNameStyle}>
                        {sp?.full_name?.trim() || "Unnamed SP"}
                      </div>
                      <div style={assignmentMetaStyle}>
                        {assignment.role_name?.trim() || "No role name"} ·{" "}
                        {assignment.assignment_status?.trim() || "Assigned"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      style={smallDangerButtonStyle}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={assignmentInfoGridStyle}>
                    <div style={infoCardStyle}>
                      <div style={infoLabelStyle}>Email</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.email)}</div>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={infoLabelStyle}>Phone</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.phone)}</div>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={infoLabelStyle}>Age Range</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.age_range)}</div>
                    </div>

                    <div style={infoCardStyle}>
                      <div style={infoLabelStyle}>Gender</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.gender)}</div>
                    </div>

                    <div style={fullWidthInfoCardStyle}>
                      <div style={infoLabelStyle}>Skills</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.skills)}</div>
                    </div>

                    <div style={fullWidthInfoCardStyle}>
                      <div style={infoLabelStyle}>Assignment Notes</div>
                      <div style={infoValueStyle}>{textOrDash(assignment.notes)}</div>
                    </div>

                    <div style={fullWidthInfoCardStyle}>
                      <div style={infoLabelStyle}>Structured Availability</div>
                      <div style={infoValueStyle}>
                        {spAvailability.length > 0
                          ? spAvailability.map((row) => formatAvailabilityRow(row)).join("\n")
                          : "—"}
                      </div>
                    </div>

                    <div style={fullWidthInfoCardStyle}>
                      <div style={infoLabelStyle}>Availability Notes</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.availability)}</div>
                    </div>

                    <div style={fullWidthInfoCardStyle}>
                      <div style={infoLabelStyle}>Actor Notes</div>
                      <div style={infoValueStyle}>{textOrDash(sp?.actor_notes)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

const panelHeaderMetaStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#667085",
  fontWeight: 600,
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

const emptyStateStyle: React.CSSProperties = {
  marginTop: 16,
  border: "1px dashed #cbd5e1",
  borderRadius: 18,
  padding: 18,
  color: "#667085",
  background: "#f8fafc",
  fontWeight: 600,
};

const assignmentListStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 18,
};

const assignmentCardStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 20,
  padding: 16,
  background: "#fdfefe",
};

const assignmentTopRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
  flexWrap: "wrap",
};

const assignmentNameStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#101828",
};

const assignmentMetaStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#667085",
  marginTop: 6,
};

const smallDangerButtonStyle: React.CSSProperties = {
  border: "1px solid #f04438",
  background: "#ffffff",
  color: "#b42318",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const assignmentInfoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const infoCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
  background: "#f8fafc",
};

const fullWidthInfoCardStyle: React.CSSProperties = {
  ...infoCardStyle,
  gridColumn: "1 / -1",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#667085",
  marginBottom: 8,
};

const infoValueStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#101828",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
};
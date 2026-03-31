"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import SiteShell from "../components/SiteShell";
import * as planningData from "../lib/planningData";

type AnyRecord = Record<string, any>;

type ProfileRecord = {
  displayName: string;
  role: string;
  campus: string;
  phone: string;
  bio: string;
  photoUrl: string;
};

type EventRecord = {
  id: string;
  name: string;
  status: string;
  dateText: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  simOp?: string;
  faculty?: string;
  notes?: string;
  spNeeded: number;
  raw: AnyRecord;
};

type AssignmentRecord = {
  id: string;
  eventId: string;
  eventName: string;
  spName: string;
  roleName?: string;
  status?: string;
  notes?: string;
  email?: string;
  raw: AnyRecord;
};

const defaultProfile: ProfileRecord = {
  displayName: "",
  role: "Sim Op",
  campus: "Elkins Park",
  phone: "",
  bio: "",
  photoUrl: "",
};

const pageWrap: React.CSSProperties = {
  maxWidth: "1240px",
  margin: "0 auto",
  padding: "24px",
};

const heroCard: React.CSSProperties = {
  borderRadius: "28px",
  padding: "28px 30px",
  marginBottom: "20px",
  background: "linear-gradient(135deg, #1f4f82 0%, #2d8aa6 55%, #95c85b 100%)",
  color: "#ffffff",
  boxShadow: "0 14px 36px rgba(15, 23, 42, 0.12)",
};

const gridWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dbe4ee",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: "22px",
  color: "#1e3a5f",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 700,
  color: "#1e3a5f",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cfd8e3",
  outline: "none",
  fontSize: "15px",
  color: "#0f172a",
  background: "#f8fafc",
  marginBottom: "16px",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
};

const buttonPrimary: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  padding: "13px 16px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "linear-gradient(135deg, #1f4f82 0%, #0f766e 100%)",
  color: "#ffffff",
};

const buttonSecondary: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "13px 16px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  background: "#ffffff",
  color: "#1e3a5f",
};

const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "12px",
  marginBottom: "18px",
};

const statCard: React.CSSProperties = {
  border: "1px solid #dbe4ee",
  borderRadius: "18px",
  padding: "14px",
  background: "#f8fbff",
};

const tableWrap: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "760px",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#64748b",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#0f172a",
  verticalAlign: "top",
  fontSize: "14px",
};

const pillBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "6px 10px",
  fontSize: "12px",
  fontWeight: 700,
};

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function safeString(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function slugify(value: string): string {
  return safeString(value)
    .toLowerCase()
    .replace(/%20/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractPlanningArrays(moduleLike: AnyRecord): AnyRecord[] {
  const rows: AnyRecord[] = [];

  Object.values(moduleLike).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((row) => {
        if (row && typeof row === "object") rows.push(row);
      });
    }
  });

  return rows;
}

function safeParseArray(raw: string | null): AnyRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.items)) return parsed.items.filter(Boolean);
      if (Array.isArray(parsed.rows)) return parsed.rows.filter(Boolean);
      if (Array.isArray(parsed.assignments)) return parsed.assignments.filter(Boolean);
      if (Array.isArray(parsed.data)) return parsed.data.filter(Boolean);
    }
  } catch {
    return [];
  }
  return [];
}

function getLocalRows(): AnyRecord[] {
  if (typeof window === "undefined") return [];
  const rows: AnyRecord[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const lower = key.toLowerCase();
    if (
      lower.includes("event") ||
      lower.includes("assign") ||
      lower.includes("sp") ||
      lower.includes("planning") ||
      lower.includes("schedule")
    ) {
      rows.push(...safeParseArray(window.localStorage.getItem(key)));
    }
  }

  return rows;
}

function normalizeEvent(source: AnyRecord): EventRecord {
  return {
    id:
      safeString(source.id) ||
      safeString(source.event_id) ||
      safeString(source.eventId) ||
      slugify(
        safeString(source.name) ||
          safeString(source.title) ||
          safeString(source.event_name) ||
          safeString(source.eventName)
      ),
    name:
      safeString(source.name) ||
      safeString(source.title) ||
      safeString(source.event_name) ||
      safeString(source.eventName) ||
      "Untitled Event",
    status:
      safeString(source.status) ||
      safeString(source.event_status) ||
      safeString(source.eventStatus) ||
      "Needs SPs",
    dateText:
      safeString(source.date_text) ||
      safeString(source.dateText) ||
      safeString(source.event_date) ||
      safeString(source.eventDate) ||
      safeString(source.date) ||
      "",
    startTime:
      safeString(source.start_time) ||
      safeString(source.startTime) ||
      safeString(source.time_start),
    endTime:
      safeString(source.end_time) ||
      safeString(source.endTime) ||
      safeString(source.time_end),
    location:
      safeString(source.location) ||
      safeString(source.room) ||
      safeString(source.site),
    simOp:
      safeString(source.sim_op) ||
      safeString(source.simOp) ||
      safeString(source.staff) ||
      safeString(source.assigned_staff),
    faculty:
      safeString(source.faculty) ||
      safeString(source.faculty_contact) ||
      safeString(source.faculty_name),
    notes: safeString(source.notes) || safeString(source.description),
    spNeeded:
      toNumber(source.sp_needed) ||
      toNumber(source.spNeeded) ||
      toNumber(source.needed),
    raw: source,
  };
}

function normalizeAssignment(source: AnyRecord): AssignmentRecord {
  return {
    id:
      safeString(source.id) ||
      safeString(source.assignment_id) ||
      `${safeString(source.event_id || source.eventId || source.event_name || source.eventName)}-${safeString(source.sp_name || source.spName || source.name)}`,
    eventId:
      safeString(source.event_id) ||
      safeString(source.eventId) ||
      safeString(source.eventSlug),
    eventName:
      safeString(source.event_name) ||
      safeString(source.eventName) ||
      safeString(source.event),
    spName:
      safeString(source.sp_name) ||
      safeString(source.spName) ||
      safeString(source.full_name) ||
      safeString(source.fullName) ||
      safeString(source.name),
    roleName:
      safeString(source.role_name) ||
      safeString(source.roleName) ||
      safeString(source.role),
    status:
      safeString(source.assignment_status) ||
      safeString(source.assignmentStatus) ||
      safeString(source.status),
    notes: safeString(source.notes) || safeString(source.assignment_notes),
    email: safeString(source.email),
    raw: source,
  };
}

function profileStorageKey(email: string) {
  return `cfsp-profile:${email.toLowerCase()}`;
}

function getStatusStyle(status: string): React.CSSProperties {
  const s = status.toLowerCase();

  if (s.includes("complete")) return { ...pillBase, background: "#dcfce7", color: "#166534" };
  if (s.includes("progress")) return { ...pillBase, background: "#dbeafe", color: "#1d4ed8" };
  if (s.includes("scheduled")) return { ...pillBase, background: "#ede9fe", color: "#6d28d9" };
  if (s.includes("tentative")) return { ...pillBase, background: "#fef3c7", color: "#92400e" };
  if (s.includes("declined") || s.includes("cancel")) {
    return { ...pillBase, background: "#fee2e2", color: "#991b1b" };
  }

  return { ...pillBase, background: "#e0f2fe", color: "#0c4a6e" };
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

export default function MyProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [profile, setProfile] = useState<ProfileRecord>(defaultProfile);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      setLoadingUser(true);
      setErrorText("");

      try {
        if (!supabase) {
          setErrorText(
            "Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
          );
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;
        setUser(user ?? null);

        if (user?.email && typeof window !== "undefined") {
          const saved = window.localStorage.getItem(profileStorageKey(user.email));
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setProfile({
                ...defaultProfile,
                ...parsed,
                displayName:
                  parsed?.displayName ||
                  user.user_metadata?.full_name ||
                  user.email.split("@")[0],
              });
            } catch {
              setProfile({
                ...defaultProfile,
                displayName:
                  user.user_metadata?.full_name || user.email.split("@")[0],
              });
            }
          } else {
            setProfile({
              ...defaultProfile,
              displayName:
                user.user_metadata?.full_name || user.email.split("@")[0],
            });
          }
        }
      } catch (err) {
        setErrorText(err instanceof Error ? err.message : "Failed to load user.");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const allData = useMemo(() => {
    const planningRows = extractPlanningArrays(planningData as AnyRecord);
    const localRows = getLocalRows();

    const events = [...planningRows, ...localRows]
      .filter((row) => {
        const nameText = `${safeString(row.name)} ${safeString(row.title)} ${safeString(
          row.event_name
        )} ${safeString(row.eventName)}`.trim();
        return Boolean(nameText);
      })
      .map(normalizeEvent)
      .filter(
        (event, index, arr) =>
          arr.findIndex(
            (x) =>
              slugify(x.id) === slugify(event.id) ||
              (slugify(x.name) === slugify(event.name) && x.dateText === event.dateText)
          ) === index
      );

    const assignments = [...planningRows, ...localRows]
      .filter((row) => {
        const hasAssignmentShape =
          safeString(row.sp_name) ||
          safeString(row.spName) ||
          safeString(row.role_name) ||
          safeString(row.roleName) ||
          safeString(row.assignment_status) ||
          safeString(row.assignmentStatus);

        return Boolean(hasAssignmentShape);
      })
      .map(normalizeAssignment);

    return { events, assignments };
  }, []);

  const myEvents = useMemo(() => {
    if (!user?.email) return [];

    const email = user.email.toLowerCase();
    const displayName = profile.displayName.trim().toLowerCase();

    return allData.events.filter((event) => {
      const eventSimOp = safeString(event.simOp).toLowerCase();
      const eventFaculty = safeString(event.faculty).toLowerCase();

      const directMatch =
        eventSimOp.includes(email) ||
        eventFaculty.includes(email) ||
        (displayName && eventSimOp.includes(displayName)) ||
        (displayName && eventFaculty.includes(displayName));

      const assignmentMatch = allData.assignments.some((assignment) => {
        const sameEvent =
          slugify(assignment.eventId) === slugify(event.id) ||
          slugify(assignment.eventName) === slugify(event.name);

        if (!sameEvent) return false;

        const assignmentEmail = safeString(assignment.email).toLowerCase();
        const assignmentName = safeString(assignment.spName).toLowerCase();

        return (
          assignmentEmail === email ||
          (displayName && assignmentName.includes(displayName))
        );
      });

      return directMatch || assignmentMatch;
    });
  }, [allData.assignments, allData.events, profile.displayName, user?.email]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSaveProfile() {
    if (!user?.email || typeof window === "undefined") return;
    window.localStorage.setItem(profileStorageKey(user.email), JSON.stringify(profile));
    setSaveMessage("Profile saved.");
    setTimeout(() => setSaveMessage(""), 2500);
  }

  if (loadingUser) {
    return (
      <SiteShell>
        <div style={pageWrap}>
          <div style={cardStyle}>Loading your profile...</div>
        </div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <div style={pageWrap}>
          <div style={heroCard}>
            <h1 style={{ margin: 0, fontSize: "46px", lineHeight: 1.05 }}>My Profile</h1>
            <p style={{ margin: "12px 0 0 0", fontSize: "20px", opacity: 0.96 }}>
              Sign in first to see your own events and save your profile.
            </p>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>You are not signed in</h2>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              Once you sign in, this page becomes your personal dashboard with your profile,
              your event list, and later your role-based tools.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "14px" }}>
              <Link
                href="/login"
                style={{
                  ...buttonPrimary,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Go to Login
              </Link>

              <Link
                href="/events"
                style={{
                  ...buttonSecondary,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Browse Events
              </Link>
            </div>

            {errorText ? (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                {errorText}
              </div>
            ) : null}
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div style={pageWrap}>
        <div style={heroCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "46px", lineHeight: 1.05 }}>My Profile</h1>
              <p style={{ margin: "12px 0 0 0", fontSize: "20px", opacity: 0.96 }}>
                Personal profile, personal event view, and the base for role-based access.
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Signed in as</div>
              <div style={{ fontWeight: 800, fontSize: "18px" }}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={statGrid}>
          <StatBox label="My Events" value={myEvents.length} />
          <StatBox label="Role" value={profile.role || "—"} />
          <StatBox label="Campus" value={profile.campus || "—"} />
          <StatBox label="Profile Saved" value={saveMessage ? "Yes" : "Ready"} />
        </div>

        <div
          style={{
            ...gridWrap,
            gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.1fr)",
          }}
        >
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Profile details</h2>

            <label style={labelStyle}>Display Name</label>
            <input
              value={profile.displayName}
              onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Cory Brodsky"
              style={inputStyle}
            />

            <label style={labelStyle}>Role</label>
            <select
              value={profile.role}
              onChange={(e) => setProfile((prev) => ({ ...prev, role: e.target.value }))}
              style={inputStyle}
            >
              <option value="Admin">Admin</option>
              <option value="Sim Op">Sim Op</option>
              <option value="SP">SP</option>
              <option value="Faculty">Faculty</option>
            </select>

            <label style={labelStyle}>Campus</label>
            <select
              value={profile.campus}
              onChange={(e) => setProfile((prev) => ({ ...prev, campus: e.target.value }))}
              style={inputStyle}
            >
              <option value="Elkins Park">Elkins Park</option>
              <option value="CICSP">CICSP</option>
              <option value="Both">Both</option>
            </select>

            <label style={labelStyle}>Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 555-5555"
              style={inputStyle}
            />

            <label style={labelStyle}>Photo URL</label>
            <input
              value={profile.photoUrl}
              onChange={(e) => setProfile((prev) => ({ ...prev, photoUrl: e.target.value }))}
              placeholder="https://..."
              style={inputStyle}
            />

            <label style={labelStyle}>Bio / Notes</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Add a quick description, scheduling notes, or role context."
              style={textareaStyle}
            />

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" onClick={handleSaveProfile} style={buttonPrimary}>
                Save Profile
              </button>

              <button type="button" onClick={handleSignOut} style={buttonSecondary}>
                Sign Out
              </button>
            </div>

            {saveMessage ? (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                }}
              >
                {saveMessage}
              </div>
            ) : null}
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitle}>Profile preview</h2>

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                marginBottom: "18px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "82px",
                  height: "82px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  border: "3px solid #ffffff",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1e3a5f",
                  fontWeight: 800,
                  fontSize: "28px",
                }}
              >
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  (profile.displayName || user.email || "?").slice(0, 1).toUpperCase()
                )}
              </div>

              <div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
                  {profile.displayName || user.email?.split("@")[0]}
                </div>
                <div style={{ marginTop: "4px", color: "#475569" }}>{user.email}</div>
                <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ ...pillBase, background: "#dbeafe", color: "#1d4ed8" }}>
                    {profile.role}
                  </span>
                  <span style={{ ...pillBase, background: "#ecfccb", color: "#3f6212" }}>
                    {profile.campus}
                  </span>
                </div>
              </div>
            </div>

            {profile.phone ? (
              <div style={{ marginBottom: "10px", color: "#334155" }}>
                <strong>Phone:</strong> {profile.phone}
              </div>
            ) : null}

            <div style={{ color: "#334155", lineHeight: 1.6 }}>
              {profile.bio || "No bio saved yet."}
            </div>
          </div>
        </div>

        <div style={{ height: "18px" }} />

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", color: "#1e3a5f" }}>My Events</h2>
              <p style={{ margin: "6px 0 0 0", color: "#475569" }}>
                Events are matched to your signed-in email and saved display name.
              </p>
            </div>

            <Link
              href="/events"
              style={{
                ...buttonSecondary,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              View All Events
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                lineHeight: 1.6,
              }}
            >
              No personal event matches yet.
              <br />
              Try saving your profile with the display name you use in event assignments or make
              sure your event/assignment rows include your email.
            </div>
          ) : (
            <div style={tableWrap}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Event</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>My Match</th>
                    <th style={thStyle}>Open</th>
                  </tr>
                </thead>
                <tbody>
                  {myEvents.map((event) => {
                    const directSimMatch =
                      safeString(event.simOp).toLowerCase().includes((user.email || "").toLowerCase()) ||
                      safeString(event.simOp).toLowerCase().includes(profile.displayName.toLowerCase());

                    return (
                      <tr key={event.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 700 }}>{event.name}</div>
                          {event.notes ? (
                            <div style={{ marginTop: "4px", color: "#64748b" }}>{event.notes}</div>
                          ) : null}
                        </td>
                        <td style={tdStyle}>{event.dateText || "—"}</td>
                        <td style={tdStyle}>
                          <span style={getStatusStyle(event.status)}>{event.status}</span>
                        </td>
                        <td style={tdStyle}>
                          {event.startTime || event.endTime
                            ? `${event.startTime || "?"}${event.endTime ? ` – ${event.endTime}` : ""}`
                            : "—"}
                        </td>
                        <td style={tdStyle}>{event.location || "—"}</td>
                        <td style={tdStyle}>{directSimMatch ? "Sim Op / Staff" : "Assignment / Name"}</td>
                        <td style={tdStyle}>
                          <Link
                            href={`/events/${event.id}`}
                            style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
                          >
                            Open Event
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
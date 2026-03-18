"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

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

type SPForm = {
  full_name: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  age_range: string;
  gender: string;
  ethnicity: string;
  skills: string;
  availability: string;
  actor_notes: string;
};

const STATUS_OPTIONS = ["Active", "Inactive"];
const AGE_RANGE_OPTIONS = [
  "",
  "18-25",
  "26-35",
  "36-45",
  "46-55",
  "56-65",
  "65+",
];
const GENDER_OPTIONS = [
  "",
  "Female",
  "Male",
  "Nonbinary",
  "Transgender",
  "Prefer not to say",
  "Other",
];

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f3f6fb",
  padding: "24px",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#1f2937",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1240px",
  margin: "0 auto",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d8e0ee",
  borderRadius: "24px",
  boxShadow: "0 10px 30px rgba(30, 41, 59, 0.06)",
};

const heroStyle: React.CSSProperties = {
  ...cardStyle,
  padding: "26px 28px",
  marginBottom: "20px",
};

const titleRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "54px",
  lineHeight: 1,
  fontWeight: 800,
  color: "#0f172a",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "18px",
  color: "#475569",
};

const buttonBase: React.CSSProperties = {
  borderRadius: "14px",
  padding: "12px 18px",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1f2937",
};

const primaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#1d4ed8",
  color: "#fff",
  border: "1px solid #1d4ed8",
};

const secondaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#fff",
  color: "#1f2937",
};

const dangerButton: React.CSSProperties = {
  ...buttonBase,
  background: "#fff5f5",
  color: "#b91c1c",
  border: "1px solid #fecaca",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const statCardStyle: React.CSSProperties = {
  ...cardStyle,
  padding: "22px 24px",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#64748b",
  marginBottom: "10px",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 800,
};

const sectionCardStyle: React.CSSProperties = {
  ...cardStyle,
  padding: "20px",
  marginBottom: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  margin: "0 0 16px 0",
  color: "#0f172a",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "16px",
  background: "#fff",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 800,
  color: "#64748b",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const formActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const searchStyle: React.CSSProperties = {
  ...inputStyle,
  marginBottom: "16px",
};

const directoryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: "16px",
};

const spCardStyle: React.CSSProperties = {
  border: "1px solid #d8e0ee",
  borderRadius: "24px",
  padding: "18px",
  background: "#fff",
};

const spTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
};

const spNameStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 800,
  color: "#111827",
};

const badgeStyle = (status: string | null): React.CSSProperties => ({
  display: "inline-block",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "14px",
  fontWeight: 800,
  marginTop: "10px",
  border:
    (status ?? "Active").toLowerCase() === "inactive"
      ? "1px solid #fecaca"
      : "1px solid #86efac",
  background:
    (status ?? "Active").toLowerCase() === "inactive" ? "#fff1f2" : "#ecfdf3",
  color:
    (status ?? "Active").toLowerCase() === "inactive" ? "#b91c1c" : "#15803d",
});

const iconButtonStyle: React.CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  cursor: "pointer",
  fontSize: "18px",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const infoBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #dbe4f0",
  borderRadius: "18px",
  padding: "14px 16px",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

const infoValueStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#111827",
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
};

const fullRowStyle: React.CSSProperties = {
  ...infoBoxStyle,
  gridColumn: "1 / -1",
};

function blankForm(): SPForm {
  return {
    full_name: "",
    email: "",
    phone: "",
    status: "Active",
    notes: "",
    age_range: "",
    gender: "",
    ethnicity: "",
    skills: "",
    availability: "",
    actor_notes: "",
  };
}

function textOrDash(value: string | null | undefined) {
  return value && value.trim() ? value : "—";
}

export default function SPDatabasePage() {
  const [sps, setSps] = useState<SPRow[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<SPForm>(blankForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadSPs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sps")
      .select(
        "id, full_name, email, phone, status, notes, age_range, gender, ethnicity, skills, availability, actor_notes, created_at"
      )
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      alert("Could not load SP database.");
      console.error(error);
      return;
    }

    setSps((data as SPRow[]) ?? []);
  }

  useEffect(() => {
    loadSPs();
  }, []);

  const filteredSPs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sps;

    return sps.filter((sp) => {
      const haystack = [
        sp.full_name,
        sp.email,
        sp.phone,
        sp.notes,
        sp.age_range,
        sp.gender,
        sp.ethnicity,
        sp.skills,
        sp.availability,
        sp.actor_notes,
        sp.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [search, sps]);

  const totalSPs = sps.length;
  const activeSPs = sps.filter(
    (sp) => (sp.status ?? "Active").toLowerCase() === "active"
  ).length;
  const inactiveSPs = sps.filter(
    (sp) => (sp.status ?? "").toLowerCase() === "inactive"
  ).length;

  function updateForm<K extends keyof SPForm>(key: K, value: SPForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(sp: SPRow) {
    setEditingId(sp.id);
    setForm({
      full_name: sp.full_name ?? "",
      email: sp.email ?? "",
      phone: sp.phone ?? "",
      status: sp.status ?? "Active",
      notes: sp.notes ?? "",
      age_range: sp.age_range ?? "",
      gender: sp.gender ?? "",
      ethnicity: sp.ethnicity ?? "",
      skills: sp.skills ?? "",
      availability: sp.availability ?? "",
      actor_notes: sp.actor_notes ?? "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setEditingId(null);
    setForm(blankForm());
  }

  async function handleSave() {
    if (!form.full_name.trim()) {
      alert("Please enter a full name.");
      return;
    }

    setSaving(true);

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      status: form.status.trim() || "Active",
      notes: form.notes.trim() || null,
      age_range: form.age_range.trim() || null,
      gender: form.gender.trim() || null,
      ethnicity: form.ethnicity.trim() || null,
      skills: form.skills.trim() || null,
      availability: form.availability.trim() || null,
      actor_notes: form.actor_notes.trim() || null,
    };

    let error = null;

    if (editingId) {
      const result = await supabase.from("sps").update(payload).eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase.from("sps").insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      alert(`Could not save SP: ${error.message}`);
      console.error(error);
      return;
    }

    clearForm();
    await loadSPs();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this SP?");
    if (!confirmed) return;

    const { error } = await supabase.from("sps").delete().eq("id", id);

    if (error) {
      alert(`Could not delete SP: ${error.message}`);
      console.error(error);
      return;
    }

    if (editingId === id) {
      clearForm();
    }

    await loadSPs();
  }

  return (
    <div style={pageWrap}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={titleRowStyle}>
            <div>
              <h1 style={titleStyle}>SP Database</h1>
              <div style={subtitleStyle}>
                Conflict Free SP · Standardized Patient Directory
              </div>
            </div>

            <Link href="/" style={{ ...secondaryButton, textDecoration: "none" }}>
              ← Back to Board
            </Link>
          </div>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total SPs</div>
            <div style={statValueStyle}>{totalSPs}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Active</div>
            <div style={{ ...statValueStyle, color: "#15803d" }}>{activeSPs}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Inactive</div>
            <div style={{ ...statValueStyle, color: "#b91c1c" }}>{inactiveSPs}</div>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>{editingId ? "Edit SP" : "Add SP"}</h2>

          <div style={formGridStyle}>
            <div>
              <label style={fieldLabelStyle}>Full Name</label>
              <input
                style={inputStyle}
                value={form.full_name}
                onChange={(e) => updateForm("full_name", e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Email</label>
              <input
                style={inputStyle}
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Phone</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Status</label>
              <select
                style={inputStyle}
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={fieldLabelStyle}>Age Range</label>
              <select
                style={inputStyle}
                value={form.age_range}
                onChange={(e) => updateForm("age_range", e.target.value)}
              >
                {AGE_RANGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option || "Select age range"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={fieldLabelStyle}>Gender</label>
              <select
                style={inputStyle}
                value={form.gender}
                onChange={(e) => updateForm("gender", e.target.value)}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option || "Select gender"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={fieldLabelStyle}>Ethnicity</label>
              <input
                style={inputStyle}
                value={form.ethnicity}
                onChange={(e) => updateForm("ethnicity", e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Skills</label>
              <input
                style={inputStyle}
                value={form.skills}
                onChange={(e) => updateForm("skills", e.target.value)}
                placeholder="Pediatrics, psych, physical exam..."
              />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={fieldLabelStyle}>Availability</label>
            <textarea
              style={textareaStyle}
              value={form.availability}
              onChange={(e) => updateForm("availability", e.target.value)}
              placeholder="Weekdays, evenings, virtual only, limited Fridays..."
            />
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={fieldLabelStyle}>General Notes</label>
            <textarea
              style={textareaStyle}
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              placeholder="Casting notes, experience, reminders..."
            />
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={fieldLabelStyle}>Actor Notes / Demographic Notes</label>
            <textarea
              style={textareaStyle}
              value={form.actor_notes}
              onChange={(e) => updateForm("actor_notes", e.target.value)}
              placeholder="Accent, look range, prior roles, wardrobe notes, other useful details..."
            />
          </div>

          <div style={formActionsStyle}>
            <button
              style={primaryButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update SP" : "Save SP"}
            </button>

            <button style={secondaryButton} onClick={loadSPs} disabled={loading}>
              Refresh
            </button>

            <button style={secondaryButton} onClick={clearForm}>
              {editingId ? "Cancel Edit" : "Clear"}
            </button>
          </div>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={sectionTitleStyle}>Directory</h2>

          <input
            style={searchStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, notes, skills, demographics..."
          />

          <div style={directoryGridStyle}>
            {filteredSPs.map((sp) => (
              <div key={sp.id} style={spCardStyle}>
                <div style={spTopRowStyle}>
                  <div>
                    <div style={spNameStyle}>{textOrDash(sp.full_name)}</div>
                    <div style={badgeStyle(sp.status)}>{sp.status ?? "Active"}</div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      style={iconButtonStyle}
                      onClick={() => startEdit(sp)}
                      title="Edit SP"
                    >
                      ✎
                    </button>
                    <button
                      style={iconButtonStyle}
                      onClick={() => handleDelete(sp.id)}
                      title="Delete SP"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div style={infoGridStyle}>
                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Email</div>
                    <div style={infoValueStyle}>{textOrDash(sp.email)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Phone</div>
                    <div style={infoValueStyle}>{textOrDash(sp.phone)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Age Range</div>
                    <div style={infoValueStyle}>{textOrDash(sp.age_range)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Gender</div>
                    <div style={infoValueStyle}>{textOrDash(sp.gender)}</div>
                  </div>

                  <div style={fullRowStyle}>
                    <div style={infoLabelStyle}>Ethnicity</div>
                    <div style={infoValueStyle}>{textOrDash(sp.ethnicity)}</div>
                  </div>

                  <div style={fullRowStyle}>
                    <div style={infoLabelStyle}>Skills</div>
                    <div style={infoValueStyle}>{textOrDash(sp.skills)}</div>
                  </div>

                  <div style={fullRowStyle}>
                    <div style={infoLabelStyle}>Availability</div>
                    <div style={infoValueStyle}>{textOrDash(sp.availability)}</div>
                  </div>

                  <div style={fullRowStyle}>
                    <div style={infoLabelStyle}>Notes</div>
                    <div style={infoValueStyle}>{textOrDash(sp.notes)}</div>
                  </div>

                  <div style={fullRowStyle}>
                    <div style={infoLabelStyle}>Actor Notes / Demographic Notes</div>
                    <div style={infoValueStyle}>{textOrDash(sp.actor_notes)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && filteredSPs.length === 0 && (
            <div style={{ marginTop: "18px", color: "#64748b", fontWeight: 600 }}>
              No SPs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
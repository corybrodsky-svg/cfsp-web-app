"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type SPRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  working_email: string | null;
  secondary_email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  status: string | null;
  last_name: string | null;
  first_name: string | null;
  portrayal_age: string | null;
  race: string | null;
  sex: string | null;
  do_not_hire_for: string | null;
  telehealth: string | null;
  pt_preferred: string | null;
  other_roles: string | null;
  birth_year: number | null;
  speaks_spanish: string | null;
  created_at: string | null;
};

type SPForm = {
  first_name: string;
  last_name: string;
  working_email: string;
  secondary_email: string;
  phone: string;
  secondary_phone: string;
  status: string;
  portrayal_age: string;
  race: string;
  sex: string;
  do_not_hire_for: string;
  telehealth: string;
  pt_preferred: string;
  other_roles: string;
  birth_year: string;
  speaks_spanish: string;
};

const STATUS_OPTIONS = ["Active", "Inactive"];

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
    first_name: "",
    last_name: "",
    working_email: "",
    secondary_email: "",
    phone: "",
    secondary_phone: "",
    status: "Active",
    portrayal_age: "",
    race: "",
    sex: "",
    do_not_hire_for: "",
    telehealth: "",
    pt_preferred: "",
    other_roles: "",
    birth_year: "",
    speaks_spanish: "",
  };
}

function textOrDash(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—";
  const s = String(value).trim();
  return s ? s : "—";
}

function buildFullName(first: string, last: string) {
  return `${first}`.trim() || `${last}`.trim()
    ? `${first}`.trim() + (`${first}`.trim() && `${last}`.trim() ? " " : "") + `${last}`.trim()
    : "";
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
        `
          id,
          full_name,
          email,
          working_email,
          secondary_email,
          phone,
          secondary_phone,
          status,
          last_name,
          first_name,
          portrayal_age,
          race,
          sex,
          do_not_hire_for,
          telehealth,
          pt_preferred,
          other_roles,
          birth_year,
          speaks_spanish,
          created_at
        `
      )
      .order("full_name", { ascending: true });

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
        sp.first_name,
        sp.last_name,
        sp.email,
        sp.working_email,
        sp.secondary_email,
        sp.phone,
        sp.secondary_phone,
        sp.status,
        sp.portrayal_age,
        sp.race,
        sp.sex,
        sp.do_not_hire_for,
        sp.telehealth,
        sp.pt_preferred,
        sp.other_roles,
        sp.birth_year?.toString(),
        sp.speaks_spanish,
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
      first_name: sp.first_name ?? "",
      last_name: sp.last_name ?? "",
      working_email: sp.working_email ?? sp.email ?? "",
      secondary_email: sp.secondary_email ?? "",
      phone: sp.phone ?? "",
      secondary_phone: sp.secondary_phone ?? "",
      status: sp.status ?? "Active",
      portrayal_age: sp.portrayal_age ?? "",
      race: sp.race ?? "",
      sex: sp.sex ?? "",
      do_not_hire_for: sp.do_not_hire_for ?? "",
      telehealth: sp.telehealth ?? "",
      pt_preferred: sp.pt_preferred ?? "",
      other_roles: sp.other_roles ?? "",
      birth_year: sp.birth_year ? String(sp.birth_year) : "",
      speaks_spanish: sp.speaks_spanish ?? "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setEditingId(null);
    setForm(blankForm());
  }

  async function handleSave() {
    if (!form.first_name.trim() && !form.last_name.trim()) {
      alert("Please enter a first name or last name.");
      return;
    }

    setSaving(true);

    const fullName = buildFullName(form.first_name, form.last_name);

    const payload = {
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      full_name: fullName || null,
      working_email: form.working_email.trim() || null,
      email: form.working_email.trim() || null,
      secondary_email: form.secondary_email.trim() || null,
      phone: form.phone.trim() || null,
      secondary_phone: form.secondary_phone.trim() || null,
      status: form.status.trim() || "Active",
      portrayal_age: form.portrayal_age.trim() || null,
      race: form.race.trim() || null,
      sex: form.sex.trim() || null,
      do_not_hire_for: form.do_not_hire_for.trim() || null,
      telehealth: form.telehealth.trim() || null,
      pt_preferred: form.pt_preferred.trim() || null,
      other_roles: form.other_roles.trim() || null,
      birth_year: form.birth_year.trim() ? Number(form.birth_year.trim()) : null,
      speaks_spanish: form.speaks_spanish.trim() || null,
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
              <label style={fieldLabelStyle}>First Name</label>
              <input
                style={inputStyle}
                value={form.first_name}
                onChange={(e) => updateForm("first_name", e.target.value)}
                placeholder="Jane"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Last Name</label>
              <input
                style={inputStyle}
                value={form.last_name}
                onChange={(e) => updateForm("last_name", e.target.value)}
                placeholder="Doe"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Working Email</label>
              <input
                style={inputStyle}
                value={form.working_email}
                onChange={(e) => updateForm("working_email", e.target.value)}
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Secondary Email</label>
              <input
                style={inputStyle}
                value={form.secondary_email}
                onChange={(e) => updateForm("secondary_email", e.target.value)}
                placeholder="Optional"
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
              <label style={fieldLabelStyle}>Secondary Phone</label>
              <input
                style={inputStyle}
                value={form.secondary_phone}
                onChange={(e) => updateForm("secondary_phone", e.target.value)}
                placeholder="Optional"
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
              <label style={fieldLabelStyle}>Portrayal Age</label>
              <input
                style={inputStyle}
                value={form.portrayal_age}
                onChange={(e) => updateForm("portrayal_age", e.target.value)}
                placeholder="20's, 30-50, 55+..."
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Race</label>
              <input
                style={inputStyle}
                value={form.race}
                onChange={(e) => updateForm("race", e.target.value)}
                placeholder="W, B, A, H..."
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Sex</label>
              <input
                style={inputStyle}
                value={form.sex}
                onChange={(e) => updateForm("sex", e.target.value)}
                placeholder="F, M, they/them..."
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Birth Year</label>
              <input
                style={inputStyle}
                value={form.birth_year}
                onChange={(e) => updateForm("birth_year", e.target.value)}
                placeholder="1985"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Speaks Spanish</label>
              <input
                style={inputStyle}
                value={form.speaks_spanish}
                onChange={(e) => updateForm("speaks_spanish", e.target.value)}
                placeholder="Yes / No / blank"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Telehealth</label>
              <input
                style={inputStyle}
                value={form.telehealth}
                onChange={(e) => updateForm("telehealth", e.target.value)}
                placeholder="Zoom, SimIQ"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>PT Preferred</label>
              <input
                style={inputStyle}
                value={form.pt_preferred}
                onChange={(e) => updateForm("pt_preferred", e.target.value)}
                placeholder="Primary, Secondary, no"
              />
            </div>

            <div>
              <label style={fieldLabelStyle}>Other Roles</label>
              <input
                style={inputStyle}
                value={form.other_roles}
                onChange={(e) => updateForm("other_roles", e.target.value)}
                placeholder="On Campus, Virtual"
              />
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={fieldLabelStyle}>Do Not Hire For</label>
            <textarea
              style={textareaStyle}
              value={form.do_not_hire_for}
              onChange={(e) => updateForm("do_not_hire_for", e.target.value)}
              placeholder="Restrictions, non-casting notes, limitations..."
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
            placeholder="Search name, email, phone, race, sex, portrayal age, telehealth, restrictions..."
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
                    <div style={infoLabelStyle}>Working Email</div>
                    <div style={infoValueStyle}>
                      {textOrDash(sp.working_email ?? sp.email)}
                    </div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Phone</div>
                    <div style={infoValueStyle}>{textOrDash(sp.phone)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Secondary Email</div>
                    <div style={infoValueStyle}>{textOrDash(sp.secondary_email)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Secondary Phone</div>
                    <div style={infoValueStyle}>{textOrDash(sp.secondary_phone)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Portrayal Age</div>
                    <div style={infoValueStyle}>{textOrDash(sp.portrayal_age)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Birth Year</div>
                    <div style={infoValueStyle}>{textOrDash(sp.birth_year)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Race</div>
                    <div style={infoValueStyle}>{textOrDash(sp.race)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Sex</div>
                    <div style={infoValueStyle}>{textOrDash(sp.sex)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Speaks Spanish</div>
                    <div style={infoValueStyle}>{textOrDash(sp.speaks_spanish)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Telehealth</div>
                    <div style={infoValueStyle}>{textOrDash(sp.telehealth)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>PT Preferred</div>
                    <div style={infoValueStyle}>{textOrDash(sp.pt_preferred)}</div>
                  </div>

                  <div style={infoBoxStyle}>
                    <div style={infoLabelStyle}>Other Roles</div>
                    <div style={infoValueStyle}>{textOrDash(sp.other_roles)}</div>
                  </div>

                  <div style={fullRowStyle}>
                    <div style={infoLabelStyle}>Do Not Hire For</div>
                    <div style={infoValueStyle}>{textOrDash(sp.do_not_hire_for)}</div>
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
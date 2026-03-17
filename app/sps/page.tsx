"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type SpStatus = "active" | "inactive";

type SpRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: string | null;
  created_at: string | null;
};

function normalizeStatus(value: string | null): SpStatus {
  return value?.toLowerCase() === "inactive" ? "inactive" : "active";
}

function sortSps(a: SpRow, b: SpRow) {
  const aActive = normalizeStatus(a.status) === "active" ? 0 : 1;
  const bActive = normalizeStatus(b.status) === "active" ? 0 : 1;
  if (aActive !== bActive) return aActive - bActive;

  const nameA = (a.full_name ?? "").toLowerCase();
  const nameB = (b.full_name ?? "").toLowerCase();
  return nameA.localeCompare(nameB);
}

export default function SpDatabasePage() {
  const [sps, setSps] = useState<SpRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SpStatus>("active");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function loadSps() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sps")
      .select("id, full_name, email, phone, notes, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading SPs:", error);
      alert("Could not load SP database.");
      setLoading(false);
      return;
    }

    setSps((data ?? []) as SpRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadSps();
  }, []);

  function clearForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setStatus("active");
    setEditingId(null);
  }

  function handleEdit(sp: SpRow) {
    setEditingId(sp.id);
    setFullName(sp.full_name ?? "");
    setEmail(sp.email ?? "");
    setPhone(sp.phone ?? "");
    setNotes(sp.notes ?? "");
    setStatus(normalizeStatus(sp.status));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (saving) return;

    const cleanName = fullName.trim();
    if (!cleanName) {
      alert("Please enter a full name.");
      return;
    }

    setSaving(true);

    const payload = {
      full_name: cleanName,
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      status,
    };

    if (editingId) {
      const { error } = await supabase
        .from("sps")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error("Update SP error:", error);
        alert("Could not update SP: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("sps").insert([payload]);

      if (error) {
        console.error("Create SP error:", error);
        alert("Could not save SP: " + error.message);
        setSaving(false);
        return;
      }
    }

    clearForm();
    await loadSps();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (deletingId) return;

    const ok = window.confirm("Delete this SP?");
    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase.from("sps").delete().eq("id", id);

    if (error) {
      console.error("Delete SP error:", error);
      alert("Could not delete SP: " + error.message);
      setDeletingId(null);
      return;
    }

    if (editingId === id) clearForm();
    await loadSps();
    setDeletingId(null);
  }

  const filteredSps = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = [...sps].sort(sortSps);

    if (!q) return base;

    return base.filter((sp) => {
      return (
        (sp.full_name ?? "").toLowerCase().includes(q) ||
        (sp.email ?? "").toLowerCase().includes(q) ||
        (sp.phone ?? "").toLowerCase().includes(q) ||
        (sp.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [sps, search]);

  const stats = useMemo(() => {
    const total = sps.length;
    const active = sps.filter((sp) => normalizeStatus(sp.status) === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [sps]);

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={topBarStyle}>
          <div style={brandWrapStyle}>
            <img src="/cfsp-logo.png" alt="CFSP Logo" style={logoStyle} />
            <div>
              <h1 style={titleStyle}>SP Database</h1>
              <p style={subtitleStyle}>Conflict Free SP · Standardized Patient Directory</p>
            </div>
          </div>

          <div style={toolbarStyle}>
            <Link href="/" style={toolbarGhostLinkStyle}>
              ← Back to Board
            </Link>
          </div>
        </section>

        <section style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total SPs</div>
            <div style={statValueStyle}>{stats.total}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Active</div>
            <div style={{ ...statValueStyle, color: "#027a48" }}>{stats.active}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Inactive</div>
            <div style={{ ...statValueStyle, color: "#b42318" }}>{stats.inactive}</div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>
              {editingId ? "Edit SP" : "Add SP"}
            </div>
            {editingId && <div style={editBadgeStyle}>Editing</div>}
          </div>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                placeholder="(555) 555-5555"
              />
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SpStatus)}
                style={inputStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={textareaStyle}
                placeholder="Casting notes, experience, reminders, availability notes..."
              />
            </div>
          </div>

          <div style={formActionsStyle}>
            <button onClick={handleSave} style={primaryButtonStyle} disabled={saving}>
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                  ? "Update SP"
                  : "Add SP"}
            </button>

            <button onClick={loadSps} style={secondaryButtonStyle} disabled={loading || saving}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button onClick={clearForm} style={secondaryButtonStyle} disabled={saving}>
              {editingId ? "Cancel Edit" : "Clear"}
            </button>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>Directory</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
              placeholder="Search name, email, phone, notes..."
            />
          </div>

          {loading ? (
            <p style={infoTextStyle}>Loading SP database...</p>
          ) : filteredSps.length === 0 ? (
            <div style={emptyStateStyle}>
              <h2 style={emptyTitleStyle}>No SPs found</h2>
              <p style={emptyTextStyle}>Add your first SP above, or change the search.</p>
            </div>
          ) : (
            <section style={cardsGridStyle}>
              {filteredSps.map((sp) => {
                const isInactive = normalizeStatus(sp.status) === "inactive";

                return (
                  <article
                    key={sp.id}
                    style={{
                      ...cardStyle,
                      opacity: isInactive ? 0.8 : 1,
                    }}
                  >
                    <div style={cardHeaderStyle}>
                      <div style={{ minWidth: 0 }}>
                        <h2 style={cardTitleStyle}>{sp.full_name || "Unnamed SP"}</h2>

                        <div style={cardMetaRowStyle}>
                          <span
                            style={{
                              ...statusPillBaseStyle,
                              ...(isInactive ? inactivePillStyle : activePillStyle),
                            }}
                          >
                            {isInactive ? "Inactive" : "Active"}
                          </span>
                        </div>
                      </div>

                      <div style={cardActionsStyle}>
                        <button
                          onClick={() => handleEdit(sp)}
                          style={iconButtonStyle}
                          title="Edit"
                          disabled={saving || !!deletingId}
                        >
                          ✎
                        </button>

                        <button
                          onClick={() => handleDelete(sp.id)}
                          style={dangerIconButtonStyle}
                          title="Delete"
                          disabled={saving || !!deletingId}
                        >
                          {deletingId === sp.id ? "…" : "🗑"}
                        </button>
                      </div>
                    </div>

                    <div style={cardBodyStyle}>
                      <div style={infoGridStyle}>
                        <div style={infoCellStyle}>
                          <div style={infoLabelStyle}>Email</div>
                          <div style={infoValueStyleSmall}>{sp.email || "-"}</div>
                        </div>

                        <div style={infoCellStyle}>
                          <div style={infoLabelStyle}>Phone</div>
                          <div style={infoValueStyleSmall}>{sp.phone || "-"}</div>
                        </div>

                        <div style={{ ...infoCellStyle, gridColumn: "1 / -1" }}>
                          <div style={infoLabelStyle}>Notes</div>
                          <div style={infoValueStyleSmall}>{sp.notes || "-"}</div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
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

const primaryButtonStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: 16,
  border: "none",
  background: "linear-gradient(135deg, #175cd3, #1849a9)",
  color: "#ffffff",
  fontSize: 16,
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 6px 16px rgba(23, 92, 211, 0.35)",
};

const secondaryButtonStyle: React.CSSProperties = {
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

const infoTextStyle: React.CSSProperties = {
  color: "#475467",
};

const emptyStateStyle: React.CSSProperties = {
  border: "1px solid #d8e1ec",
  borderRadius: 24,
  padding: 24,
  background: "rgba(255,255,255,0.88)",
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
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.06)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  color: "#101828",
  lineHeight: 1.2,
};

const cardMetaRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 12,
};

const cardActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const cardBodyStyle: React.CSSProperties = {
  marginTop: 18,
  color: "#101828",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const infoCellStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #e4e7ec",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  color: "#667085",
  marginBottom: 6,
};

const infoValueStyleSmall: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: "#101828",
  wordBreak: "break-word",
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

const statusPillBaseStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
};

const activePillStyle: React.CSSProperties = {
  background: "#ecfdf3",
  color: "#027a48",
  border: "1px solid #75e0a7",
};

const inactivePillStyle: React.CSSProperties = {
  background: "#fef3f2",
  color: "#b42318",
  border: "1px solid #fda29b",
};
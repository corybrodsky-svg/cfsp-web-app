"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type SPRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  active: boolean | null;
  created_at: string | null;
};

type StatusFilter = "all" | "active" | "inactive";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatPhone(value: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "-";

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return raw;
}

function displayValue(value: string | null) {
  const clean = (value ?? "").trim();
  return clean || "-";
}

export default function SPDatabasePage() {
  const [sps, setSps] = useState<SPRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadSps() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sps")
      .select("id, full_name, email, phone, notes, active, created_at")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error loading SPs:", error);
      alert("Could not load SPs.");
      setLoading(false);
      return;
    }

    setSps((data ?? []) as SPRow[]);
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
    setActive(true);
    setEditingId(null);
  }

  async function handleSave() {
    if (saving) return;

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanNotes = notes.trim();

    if (!cleanName) {
      alert("Please enter the SP name.");
      return;
    }

    const payload = {
      full_name: cleanName,
      email: cleanEmail || null,
      phone: cleanPhone || null,
      notes: cleanNotes || null,
      active,
    };

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("sps")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error("Error updating SP:", error);
        alert("Could not update SP.");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("sps")
        .insert([payload]);

      if (error) {
        console.error("Error creating SP:", error);
        alert("Could not save SP.");
        setSaving(false);
        return;
      }
    }

    clearForm();
    await loadSps();
    setSaving(false);
  }

  function handleEdit(sp: SPRow) {
    setEditingId(sp.id);
    setFullName(sp.full_name ?? "");
    setEmail(sp.email ?? "");
    setPhone(sp.phone ?? "");
    setNotes(sp.notes ?? "");
    setActive(sp.active ?? true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (deletingId) return;

    const ok = window.confirm("Delete this SP?");
    if (!ok) return;

    setDeletingId(id);

    const { error } = await supabase
      .from("sps")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting SP:", error);
      alert("Could not delete SP.");
      setDeletingId(null);
      return;
    }

    if (editingId === id) clearForm();
    await loadSps();
    setDeletingId(null);
  }

  const filteredSps = useMemo(() => {
    const q = normalizeText(search);

    return sps.filter((sp) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? sp.active === true
          : sp.active === false;

      if (!matchesStatus) return false;

      if (!q) return true;

      const name = normalizeText(sp.full_name);
      const emailVal = normalizeText(sp.email);
      const phoneVal = normalizeText(sp.phone);
      const notesVal = normalizeText(sp.notes);

      return (
        name.includes(q) ||
        emailVal.includes(q) ||
        phoneVal.includes(q) ||
        notesVal.includes(q)
      );
    });
  }, [sps, search, statusFilter]);

  const stats = useMemo(() => {
    const total = sps.length;
    const activeCount = sps.filter((sp) => sp.active === true).length;
    const inactiveCount = sps.filter((sp) => sp.active === false).length;
    const visibleCount = filteredSps.length;

    return {
      total,
      activeCount,
      inactiveCount,
      visibleCount,
    };
  }, [sps, filteredSps]);

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
            <h1 style={{ fontSize: 48, fontWeight: 400, margin: 0 }}>SP Database</h1>
            <p style={{ marginTop: 8, fontSize: 18, color: "#cfcfcf" }}>
              Standardized patient roster and contact management
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" style={buttonLinkStyle}>
              Back to Ops Board
            </Link>
            <button onClick={loadSps} style={buttonStyle} disabled={loading || saving}>
              {loading ? "Refreshing..." : "Refresh"}
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
            <div style={statLabelStyle}>Total SPs</div>
            <div style={statValueStyle}>{stats.total}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Active</div>
            <div style={statValueStyle}>{stats.activeCount}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Inactive</div>
            <div style={statValueStyle}>{stats.inactiveCount}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>Showing</div>
            <div style={statValueStyle}>{stats.visibleCount}</div>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
                placeholder="Deborah Crane"
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="name@email.com"
                type="email"
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                placeholder="555-555-5555"
              />
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={active ? "active" : "inactive"}
                onChange={(e) => setActive(e.target.value === "active")}
                style={inputStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              placeholder="Accent, special skills, restrictions, reminders..."
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <button onClick={handleSave} style={buttonStyle} disabled={saving}>
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update SP"
                : "Add SP"}
            </button>

            <button onClick={clearForm} style={buttonStyle} disabled={saving}>
              {editingId ? "Cancel Edit" : "Clear"}
            </button>
          </div>

          {editingId && (
            <p style={{ marginTop: 14, color: "#cfcfcf", fontSize: 14 }}>
              Editing existing SP. Click “Cancel Edit” to stop.
            </p>
          )}
        </section>

        <section style={panelStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 1fr) minmax(220px, 260px)",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={labelStyle}>Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
                placeholder="Search by name, email, phone, or notes"
              />
            </div>

            <div>
              <label style={labelStyle}>Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                style={inputStyle}
              >
                <option value="all">All SPs</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#cfcfcf" }}>Loading SPs...</p>
          ) : filteredSps.length === 0 ? (
            <section style={emptyStateStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 8 }}>No SPs found</h2>
              <p style={{ margin: 0, color: "#cfcfcf" }}>
                Add a new SP above, or change your search/filter settings.
              </p>
            </section>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 16,
              }}
            >
              {filteredSps.map((sp) => {
                const isDeleting = deletingId === sp.id;

                return (
                  <article key={sp.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 22 }}>
                          {displayValue(sp.full_name)}
                        </h2>
                        <div style={pillStyle}>
                          {sp.active ? "Active" : "Inactive"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
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
                          style={iconButtonStyle}
                          title="Delete"
                          disabled={saving || !!deletingId}
                        >
                          {isDeleting ? "…" : "🗑"}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 18, lineHeight: 1.8, fontSize: 16 }}>
                      <div>
                        <strong>Email:</strong> {displayValue(sp.email)}
                      </div>
                      <div>
                        <strong>Phone:</strong> {formatPhone(sp.phone)}
                      </div>
                      <div>
                        <strong>Notes:</strong> {displayValue(sp.notes)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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
  boxSizing: "border-box",
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

const iconButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  border: "1px solid #3a3a3a",
  background: "#1a1a1a",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
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
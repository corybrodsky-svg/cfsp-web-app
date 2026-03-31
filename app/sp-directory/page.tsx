"use client";

import { useEffect, useState } from "react";
import SiteShell from "../components/SiteShell";
import {
  SPRecord,
  loadSPDirectory,
  saveSPDirectory,
} from "../lib/cfspData";

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dbe4ee",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
  marginBottom: "18px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #cfd8e3",
  background: "#f8fafc",
  fontSize: "15px",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 700,
  color: "#1f3f67",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
};

const buttonPrimary: React.CSSProperties = {
  border: "none",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 700,
  background: "#1f5fbf",
  color: "#ffffff",
  cursor: "pointer",
};

const buttonSecondary: React.CSSProperties = {
  border: "1px solid #cfd8e3",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 700,
  background: "#ffffff",
  color: "#173b6c",
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #dbe4ee",
  color: "#64748b",
  fontSize: "12px",
  textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #e7edf3",
  verticalAlign: "top",
};

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  campus: "Elkins Park",
  status: "Active",
  notes: "",
};

export default function SPDirectoryPage() {
  const [sps, setSps] = useState<SPRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setSps(loadSPDirectory());
  }, []);

  function persist(next: SPRecord[]) {
    setSps(next);
    saveSPDirectory(next);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function handleSave() {
    if (!form.fullName.trim() || !form.email.trim()) {
      window.alert("SP name and email are required.");
      return;
    }

    if (editingId) {
      const next = sps.map((sp) =>
        sp.id === editingId
          ? {
              ...sp,
              fullName: form.fullName.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              campus: form.campus,
              status: form.status,
              notes: form.notes.trim(),
            }
          : sp
      );
      persist(next);
      setSaveMessage("SP updated.");
    } else {
      const next: SPRecord[] = [
        {
          id: `sp-${Date.now()}`,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          campus: form.campus,
          status: form.status,
          notes: form.notes.trim(),
          createdAt: new Date().toISOString(),
        },
        ...sps,
      ];
      persist(next);
      setSaveMessage("SP added.");
    }

    resetForm();
    window.setTimeout(() => setSaveMessage(""), 2200);
  }

  function handleEdit(sp: SPRecord) {
    setEditingId(sp.id);
    setForm({
      fullName: sp.fullName,
      email: sp.email,
      phone: sp.phone,
      campus: sp.campus,
      status: sp.status,
      notes: sp.notes,
    });
  }

  function handleDelete(id: string) {
    const ok = window.confirm("Remove this SP from the directory?");
    if (!ok) return;
    persist(sps.filter((sp) => sp.id !== id));
  }

  return (
    <SiteShell
      title="SP Directory"
      subtitle="Your source of truth for SP contact information and event assignment pull-through."
    >
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Add or edit SP</h2>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Campus</label>
            <select
              value={form.campus}
              onChange={(e) => setForm((p) => ({ ...p, campus: e.target.value }))}
              style={inputStyle}
            >
              <option>Elkins Park</option>
              <option>CICSP</option>
              <option>Both</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              style={inputStyle}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button type="button" onClick={handleSave} style={buttonPrimary}>
            {editingId ? "Update SP" : "Add SP"}
          </button>

          <button type="button" onClick={resetForm} style={buttonSecondary}>
            Clear
          </button>

          {saveMessage ? <div style={{ alignSelf: "center", color: "#166534", fontWeight: 700 }}>{saveMessage}</div> : null}
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>SP directory</h2>

        {sps.length === 0 ? (
          <p>No SPs saved yet. Add your first SP above.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Campus</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Notes</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sps.map((sp) => (
                  <tr key={sp.id}>
                    <td style={tdStyle}><strong>{sp.fullName}</strong></td>
                    <td style={tdStyle}>{sp.email}</td>
                    <td style={tdStyle}>{sp.phone || "—"}</td>
                    <td style={tdStyle}>{sp.campus}</td>
                    <td style={tdStyle}>{sp.status}</td>
                    <td style={tdStyle}>{sp.notes || "—"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => handleEdit(sp)} style={buttonSecondary}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(sp.id)} style={buttonSecondary}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type SPRow = {
  id: string;
  full_name: string | null;
  working_email: string | null;
  email: string | null;
  phone: string | null;
  portrayal_age: string | null;
  race: string | null;
  sex: string | null;
  status: string | null;
};

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f3f6fb",
  padding: "24px",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#1f2937",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1180px",
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

const buttonStyle: React.CSSProperties = {
  borderRadius: "14px",
  padding: "12px 18px",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1f2937",
  textDecoration: "none",
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

const searchStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "16px",
  background: "#fff",
  boxSizing: "border-box",
  marginBottom: "16px",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const rowStyle: React.CSSProperties = {
  border: "1px solid #d8e0ee",
  borderRadius: "18px",
  padding: "16px 18px",
  background: "#fff",
};

const rowTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const nameLinkStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 800,
  color: "#0f172a",
  textDecoration: "none",
};

const badgeStyle = (status: string | null): React.CSSProperties => ({
  display: "inline-block",
  borderRadius: "999px",
  padding: "7px 12px",
  fontSize: "13px",
  fontWeight: 800,
  border:
    (status ?? "Active").toLowerCase() === "inactive"
      ? "1px solid #fecaca"
      : "1px solid #86efac",
  background:
    (status ?? "Active").toLowerCase() === "inactive" ? "#fff1f2" : "#ecfdf3",
  color:
    (status ?? "Active").toLowerCase() === "inactive" ? "#b91c1c" : "#15803d",
});

const rowMetaStyle: React.CSSProperties = {
  marginTop: "12px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
};

const metaBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #dbe4f0",
  borderRadius: "14px",
  padding: "12px 14px",
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  color: "#64748b",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const metaValueStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#111827",
};

function textOrDash(value: string | null | undefined) {
  return value && value.trim() ? value : "—";
}

export default function SPDirectoryPage() {
  const [sps, setSps] = useState<SPRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function loadSPs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sps")
      .select("id, full_name, working_email, email, phone, portrayal_age, race, sex, status")
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

    return sps.filter((sp) =>
      [
        sp.full_name,
        sp.working_email,
        sp.email,
        sp.phone,
        sp.portrayal_age,
        sp.race,
        sp.sex,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, sps]);

  const totalSPs = sps.length;
  const activeSPs = sps.filter(
    (sp) => (sp.status ?? "Active").toLowerCase() === "active"
  ).length;
  const inactiveSPs = sps.filter(
    (sp) => (sp.status ?? "").toLowerCase() === "inactive"
  ).length;

  return (
    <div style={pageWrap}>
      <div style={shellStyle}>
        <div style={heroStyle}>
          <div style={titleRowStyle}>
            <div>
              <h1 style={titleStyle}>SP Directory</h1>
              <div style={subtitleStyle}>
                Search quickly, then click a name for full details
              </div>
            </div>

            <Link href="/" style={buttonStyle}>
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
          <input
            style={searchStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, portrayal age, race, sex..."
          />

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div style={listStyle}>
              {filteredSPs.map((sp) => (
                <div key={sp.id} style={rowStyle}>
                  <div style={rowTopStyle}>
                    <Link href={`/sps/${sp.id}`} style={nameLinkStyle}>
                      {textOrDash(sp.full_name)}
                    </Link>

                    <div style={badgeStyle(sp.status)}>{sp.status ?? "Active"}</div>
                  </div>

                  <div style={rowMetaStyle}>
                    <div style={metaBoxStyle}>
                      <div style={metaLabelStyle}>Working Email</div>
                      <div style={metaValueStyle}>
                        {textOrDash(sp.working_email ?? sp.email)}
                      </div>
                    </div>

                    <div style={metaBoxStyle}>
                      <div style={metaLabelStyle}>Phone</div>
                      <div style={metaValueStyle}>{textOrDash(sp.phone)}</div>
                    </div>

                    <div style={metaBoxStyle}>
                      <div style={metaLabelStyle}>Portrayal Age</div>
                      <div style={metaValueStyle}>{textOrDash(sp.portrayal_age)}</div>
                    </div>

                    <div style={metaBoxStyle}>
                      <div style={metaLabelStyle}>Race / Sex</div>
                      <div style={metaValueStyle}>
                        {`${textOrDash(sp.race)} / ${textOrDash(sp.sex)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && filteredSPs.length === 0 && (
                <div style={{ color: "#64748b", fontWeight: 600 }}>No SPs found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
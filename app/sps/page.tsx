"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  portrayal_age: string | null;
  race: string | null;
  sex: string | null;
  created_at: string | null;
};

function safeText(value: string | null | undefined) {
  return value?.trim() || "—";
}

function matchesSearch(sp: SPRow, q: string) {
  if (!q.trim()) return true;
  const text = [
    sp.full_name,
    sp.email,
    sp.phone,
    sp.status,
    sp.notes,
    sp.age_range,
    sp.gender,
    sp.ethnicity,
    sp.skills,
    sp.portrayal_age,
    sp.race,
    sp.sex,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(q.toLowerCase());
}

export default function SPsPage() {
  const [sps, setSps] = useState<SPRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSPs() {
      setLoading(true);
      setError("");

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
          portrayal_age,
          race,
          sex,
          created_at
        `
        )
        .order("full_name", { ascending: true });

      if (error) {
        console.error(error);
        setError(error.message || "Could not load SP database.");
        setSps([]);
      } else {
        setSps((data || []) as SPRow[]);
      }

      setLoading(false);
    }

    loadSPs();
  }, []);

  const filtered = useMemo(() => {
    return sps.filter((sp) => matchesSearch(sp, search));
  }, [sps, search]);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f7f8fc",
    padding: "32px 20px 60px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#14213d",
  };

  const shellStyle: React.CSSProperties = {
    maxWidth: "1180px",
    margin: "0 auto",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: 800,
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#5b6780",
    marginBottom: "22px",
  };

  const searchWrapStyle: React.CSSProperties = {
    marginBottom: "18px",
  };

  const searchStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid #d7ddea",
    background: "#ffffff",
    fontSize: "18px",
    outline: "none",
    boxSizing: "border-box",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #d9dfec",
    borderRadius: "24px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 2px 10px rgba(20,33,61,0.04)",
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    cursor: "pointer",
  };

  const nameButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    padding: 0,
    margin: 0,
    textAlign: "left",
    cursor: "pointer",
    color: "#14213d",
    fontSize: "24px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  };

  const statusPill = (status: string | null): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 700,
    border: "1px solid #9ad8ab",
    background: "#ebfff0",
    color: "#25834d",
    whiteSpace: "nowrap",
  });

  const summaryGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  };

  const detailBoxStyle: React.CSSProperties = {
    background: "#f6f8fc",
    border: "1px solid #dbe2ef",
    borderRadius: "16px",
    padding: "16px",
    minHeight: "88px",
  };

  const detailLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "8px",
  };

  const detailValueStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: 1.45,
    color: "#1f2a44",
    wordBreak: "break-word",
  };

  const expandedSectionStyle: React.CSSProperties = {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e3e8f2",
  };

  const expandedGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "12px",
  };

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={titleStyle}>SP Database</div>
        <div style={subtitleStyle}>
          Search the roster, then click a person to expand their full details.
        </div>

        <div style={searchWrapStyle}>
          <input
            type="text"
            placeholder="Search by name, email, phone, portrayal age, race, sex..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />
        </div>

        {loading ? (
          <div style={{ padding: "20px 4px", color: "#5b6780" }}>Loading SPs...</div>
        ) : error ? (
          <div style={{ padding: "20px 4px", color: "#b42318", fontWeight: 600 }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "20px 4px", color: "#5b6780" }}>
            No SPs found for that search.
          </div>
        ) : (
          filtered.map((sp) => {
            const isOpen = expandedId === sp.id;

            return (
              <div key={sp.id} style={cardStyle}>
                <div
                  style={cardHeaderStyle}
                  onClick={() => setExpandedId(isOpen ? null : sp.id)}
                >
                  <button
                    type="button"
                    style={nameButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isOpen ? null : sp.id);
                    }}
                  >
                    {safeText(sp.full_name)}
                  </button>

                  <div style={statusPill(sp.status)}>{safeText(sp.status)}</div>
                </div>

                <div style={summaryGridStyle}>
                  <div style={detailBoxStyle}>
                    <div style={detailLabelStyle}>Working Email</div>
                    <div style={detailValueStyle}>{safeText(sp.email)}</div>
                  </div>

                  <div style={detailBoxStyle}>
                    <div style={detailLabelStyle}>Phone</div>
                    <div style={detailValueStyle}>{safeText(sp.phone)}</div>
                  </div>

                  <div style={detailBoxStyle}>
                    <div style={detailLabelStyle}>Portrayal Age</div>
                    <div style={detailValueStyle}>
                      {safeText(sp.portrayal_age || sp.age_range)}
                    </div>
                  </div>

                  <div style={detailBoxStyle}>
                    <div style={detailLabelStyle}>Race / Sex</div>
                    <div style={detailValueStyle}>
                      {[sp.race, sp.sex].filter(Boolean).join(" / ") || "—"}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div style={expandedSectionStyle}>
                    <div style={expandedGridStyle}>
                      <div style={detailBoxStyle}>
                        <div style={detailLabelStyle}>Gender</div>
                        <div style={detailValueStyle}>{safeText(sp.gender)}</div>
                      </div>

                      <div style={detailBoxStyle}>
                        <div style={detailLabelStyle}>Ethnicity</div>
                        <div style={detailValueStyle}>{safeText(sp.ethnicity)}</div>
                      </div>

                      <div style={detailBoxStyle}>
                        <div style={detailLabelStyle}>Skills</div>
                        <div style={detailValueStyle}>{safeText(sp.skills)}</div>
                      </div>

                      <div style={detailBoxStyle}>
                        <div style={detailLabelStyle}>Notes</div>
                        <div style={detailValueStyle}>{safeText(sp.notes)}</div>
                      </div>

                      <div style={detailBoxStyle}>
                        <div style={detailLabelStyle}>Created</div>
                        <div style={detailValueStyle}>
                          {sp.created_at
                            ? new Date(sp.created_at).toLocaleString()
                            : "—"}
                        </div>
                      </div>

                      <div style={detailBoxStyle}>
                        <div style={detailLabelStyle}>Record ID</div>
                        <div style={detailValueStyle}>{safeText(sp.id)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
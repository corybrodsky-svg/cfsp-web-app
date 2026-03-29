"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ASSIGNMENT_STORAGE_KEY,
  AssignmentDraft,
  buildUsername,
  events,
  PoolType,
  sps as mockSPs,
} from "../lib/mockData";

type SPRow = {
  id: string;
  last_name: string;
  first_name: string;
  working_email: string;
  phone: string;
  secondary_phone: string;
  portrayal_age: string;
  race: string;
  sex: string;
  do_not_hire_for: string;
  telehealth: string;
  pt_preferred: string;
  other_roles: string;
  birth_year: string;
  secondary_email: string;
  speaks_spanish: string;
};

type DirectorySP = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  workingEmail: string;
  secondaryEmail: string;
  phone: string;
  secondaryPhone: string;
  portrayalAge: string;
  race: string;
  sex: string;
  doNotHireFor: string;
  telehealth: string;
  ptPreferred: string;
  otherRoles: string;
  birthYear: string;
  speaksSpanish: string;
  username: string;
  defaultPassword: string;
  pool: PoolType;
};

const DEFAULT_PASSWORD = "Drexel1$";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #f4f7fb 0%, #e8eef7 45%, #dfe8f5 100%)",
  padding: "28px",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1320px",
  margin: "0 auto",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 800,
  color: "#12233f",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#62748d",
  fontSize: "15px",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#173d70",
  color: "#ffffff",
  fontWeight: 800,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#ffffff",
  border: "1px solid #d0dae8",
  color: "#173d70",
  fontWeight: 800,
};

const toolbarStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #d9e3f1",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 10px 26px rgba(20, 40, 90, 0.08)",
  marginBottom: "18px",
};

const searchStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  fontSize: "15px",
  background: "#fbfcfe",
  boxSizing: "border-box",
};

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const pillStyle: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "#f2f6fc",
  border: "1px solid #d9e3f1",
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
  cursor: "pointer",
};

const activePillStyle: React.CSSProperties = {
  ...pillStyle,
  background: "#173d70",
  color: "#ffffff",
  border: "1px solid #173d70",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid #d9e3f1",
  boxShadow: "0 10px 26px rgba(20, 40, 90, 0.08)",
};

const cardTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const nameStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
  fontWeight: 800,
  color: "#12233f",
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#eef4fb",
  border: "1px solid #d9e3f1",
  color: "#173d70",
  fontWeight: 800,
  fontSize: "13px",
};

const infoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginTop: "14px",
};

const infoCardStyle: React.CSSProperties = {
  border: "1px solid #dde6f2",
  borderRadius: "14px",
  padding: "14px",
  background: "#f8fbff",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "#6b7c93",
  marginBottom: "6px",
};

const valueStyle: React.CSSProperties = {
  margin: 0,
  color: "#24364d",
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const noteBlockStyle: React.CSSProperties = {
  marginTop: "14px",
  border: "1px solid #dde6f2",
  borderRadius: "14px",
  padding: "14px",
  background: "#fcfdff",
};

const assignPanelStyle: React.CSSProperties = {
  marginTop: "16px",
  border: "1px solid #d9e3f1",
  borderRadius: "14px",
  padding: "16px",
  background: "#f8fbff",
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid #cdd8e8",
  background: "#ffffff",
  cursor: "pointer",
  fontWeight: 700,
  color: "#173d70",
};

const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#173d70",
  color: "#ffffff",
  border: "1px solid #173d70",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cfd7e6",
  fontSize: "14px",
  boxSizing: "border-box",
  background: "#ffffff",
};

const selectStyle: React.CSSProperties = inputStyle;

function normalizeHeader(header: string) {
  return header.replace(/^\uFEFF/, "").trim();
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function toSPRows(csvText: string): SPRow[] {
  const parsed = parseCSV(csvText);
  if (!parsed.length) return [];

  const headers = parsed[0].map(normalizeHeader);

  return parsed.slice(1).map((cells, index) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = (cells[i] || "").trim();
    });

    return {
      id: `${record.last_name || "sp"}-${record.first_name || "row"}-${index}`,
      last_name: record.last_name || "",
      first_name: record.first_name || "",
      working_email: record.working_email || "",
      phone: record.phone || "",
      secondary_phone: record.secondary_phone || "",
      portrayal_age: record.portrayal_age || "",
      race: record.race || "",
      sex: record.sex || "",
      do_not_hire_for: record.do_not_hire_for || "",
      telehealth: record.telehealth || "",
      pt_preferred: record.pt_preferred || "",
      other_roles: record.other_roles || "",
      birth_year: record.birth_year || "",
      secondary_email: record.secondary_email || "",
      speaks_spanish: record.speaks_spanish || "",
    };
  });
}

function poolForSP(fullName: string): PoolType {
  const found = mockSPs.find(
    (sp) => sp.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
  );
  return found?.pool || "CICSP";
}

function toDirectorySP(row: SPRow): DirectorySP {
  const fullName = `${row.first_name} ${row.last_name}`.trim();
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName,
    workingEmail: row.working_email,
    secondaryEmail: row.secondary_email,
    phone: row.phone,
    secondaryPhone: row.secondary_phone,
    portrayalAge: row.portrayal_age,
    race: row.race,
    sex: row.sex,
    doNotHireFor: row.do_not_hire_for,
    telehealth: row.telehealth,
    ptPreferred: row.pt_preferred,
    otherRoles: row.other_roles,
    birthYear: row.birth_year,
    speaksSpanish: row.speaks_spanish,
    username: buildUsername(fullName),
    defaultPassword: DEFAULT_PASSWORD,
    pool: poolForSP(fullName),
  };
}

export default function SPDirectoryPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<DirectorySP[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [poolFilter, setPoolFilter] = useState<"All" | PoolType>("All");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<"existing" | "placeholder">("existing");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [placeholderName, setPlaceholderName] = useState("");
  const [placeholderDate, setPlaceholderDate] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    async function loadCSV() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/cfsp_sps_import_v3.csv", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Could not load /cfsp_sps_import_v3.csv from the public folder."
          );
        }

        const text = await response.text();
        const parsedRows = toSPRows(text).map(toDirectorySP);
        setRows(parsedRows);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "SP CSV not found yet. Put cfsp_sps_import_v3.csv into your public folder."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCSV();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((sp) => {
      const matchesPool = poolFilter === "All" ? true : sp.pool === poolFilter;

      const matchesQuery =
        !q ||
        [
          sp.firstName,
          sp.lastName,
          sp.fullName,
          sp.workingEmail,
          sp.secondaryEmail,
          sp.phone,
          sp.secondaryPhone,
          sp.portrayalAge,
          sp.race,
          sp.sex,
          sp.doNotHireFor,
          sp.telehealth,
          sp.ptPreferred,
          sp.otherRoles,
          sp.birthYear,
          sp.speaksSpanish,
          sp.username,
          sp.pool,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesPool && matchesQuery;
    });
  }, [rows, query, poolFilter]);

  function saveAssignment(sp: DirectorySP) {
    const existingRaw = localStorage.getItem(ASSIGNMENT_STORAGE_KEY);
    const existing: AssignmentDraft[] = existingRaw ? JSON.parse(existingRaw) : [];

    const selectedEvent = events.find((event) => event.id === selectedEventId);

    const draft: AssignmentDraft = {
      id: `${sp.id}-${Date.now()}`,
      spId: sp.id,
      spName: sp.fullName,
      eventMode: assignMode,
      eventId: assignMode === "existing" ? selectedEvent?.id : undefined,
      eventName:
        assignMode === "existing"
          ? selectedEvent?.name || "Unknown Event"
          : placeholderName || "Untitled Placeholder Event",
      dateText:
        assignMode === "existing"
          ? selectedEvent?.dateText || ""
          : placeholderDate || "",
      notes: assignmentNote,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      ASSIGNMENT_STORAGE_KEY,
      JSON.stringify([draft, ...existing])
    );

    setSavedMessage(
      `${sp.fullName} assigned to ${
        draft.eventName
      } (${draft.eventMode === "existing" ? "existing event" : "placeholder event"})`
    );
    setAssignmentNote("");
    setPlaceholderName("");
    setPlaceholderDate("");
    setTimeout(() => setSavedMessage(""), 2500);
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={topRowStyle}>
          <div>
            <h1 style={titleStyle}>SP Directory</h1>
            <div style={subtitleStyle}>
              Search, filter, and assign standardized patients.
            </div>
          </div>

          <div style={actionRowStyle}>
            <Link href="/admin" style={secondaryLinkStyle}>
              Admin
            </Link>
            <Link href="/events" style={secondaryLinkStyle}>
              Events
            </Link>
            <Link href="/login" style={primaryLinkStyle}>
              Login
            </Link>
          </div>
        </div>

        <div style={toolbarStyle}>
          <input
            type="text"
            placeholder="Search by name, username, email, phone, portrayal age, race, sex, roles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={searchStyle}
          />

          <div style={filterRowStyle}>
            {(["All", "CICSP", "Elkins Park", "Both"] as const).map((item) => (
              <button
                key={item}
                type="button"
                style={poolFilter === item ? activePillStyle : pillStyle}
                onClick={() => setPoolFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div style={filterRowStyle}>
            <span style={pillStyle}>Loaded: {loading ? "..." : rows.length}</span>
            <span style={pillStyle}>Showing: {loading ? "..." : filtered.length}</span>
            <span style={pillStyle}>Assignments save to localStorage</span>
          </div>
        </div>

        {savedMessage ? (
          <div style={{ ...cardStyle, marginBottom: "16px" }}>{savedMessage}</div>
        ) : null}

        {loading ? (
          <div style={cardStyle}>Loading SP directory...</div>
        ) : errorMessage ? (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#12233f" }}>CSV not loaded yet</h3>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>{errorMessage}</p>
            <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 0 }}>
              Put your file in:
              <br />
              <strong>public/cfsp_sps_import_v3.csv</strong>
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: "#12233f" }}>No results</h3>
            <p style={{ color: "#475569", marginBottom: 0 }}>
              Try a broader search term.
            </p>
          </div>
        ) : (
          <div style={gridStyle}>
            {filtered.map((sp) => (
              <div key={sp.id} style={cardStyle}>
                <div style={cardTopStyle}>
                  <h2 style={nameStyle}>{sp.fullName || "Unnamed SP"}</h2>

                  <div style={badgeRowStyle}>
                    <div style={badgeStyle}>{sp.pool}</div>
                    <div style={badgeStyle}>{sp.portrayalAge || "Age N/A"}</div>
                  </div>
                </div>

                <div style={infoGridStyle}>
                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Username</div>
                    <p style={valueStyle}>{sp.username || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Default Password</div>
                    <p style={valueStyle}>{sp.defaultPassword}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Working Email</div>
                    <p style={valueStyle}>{sp.workingEmail || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Phone</div>
                    <p style={valueStyle}>{sp.phone || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Secondary Email</div>
                    <p style={valueStyle}>{sp.secondaryEmail || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Secondary Phone</div>
                    <p style={valueStyle}>{sp.secondaryPhone || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Race</div>
                    <p style={valueStyle}>{sp.race || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Sex</div>
                    <p style={valueStyle}>{sp.sex || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Telehealth</div>
                    <p style={valueStyle}>{sp.telehealth || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>PT Preferred</div>
                    <p style={valueStyle}>{sp.ptPreferred || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Other Roles</div>
                    <p style={valueStyle}>{sp.otherRoles || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Birth Year</div>
                    <p style={valueStyle}>{sp.birthYear || "—"}</p>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={labelStyle}>Speaks Spanish</div>
                    <p style={valueStyle}>{sp.speaksSpanish || "—"}</p>
                  </div>
                </div>

                <div style={noteBlockStyle}>
                  <div style={labelStyle}>Do Not Hire For</div>
                  <p style={valueStyle}>{sp.doNotHireFor || "—"}</p>
                </div>

                <div style={buttonRowStyle}>
                  <button
                    type="button"
                    style={secondaryLinkStyle}
                    onClick={() =>
                      setExpandedId(expandedId === sp.id ? null : sp.id)
                    }
                  >
                    {expandedId === sp.id ? "Hide Assignment" : "Assign to Event"}
                  </button>
                </div>

                {expandedId === sp.id ? (
                  <div style={assignPanelStyle}>
                    <div style={filterRowStyle}>
                      <button
                        type="button"
                        style={
                          assignMode === "existing"
                            ? activePillStyle
                            : pillStyle
                        }
                        onClick={() => setAssignMode("existing")}
                      >
                        Existing Event
                      </button>

                      <button
                        type="button"
                        style={
                          assignMode === "placeholder"
                            ? activePillStyle
                            : pillStyle
                        }
                        onClick={() => setAssignMode("placeholder")}
                      >
                        Placeholder Event
                      </button>
                    </div>

                    {assignMode === "existing" ? (
                      <div style={{ marginTop: "14px" }}>
                        <div style={labelStyle}>Select Event</div>
                        <select
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          style={selectStyle}
                        >
                          {events.map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.name} — {event.dateText}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginTop: "14px" }}>
                          <div style={labelStyle}>Placeholder Event Name</div>
                          <input
                            value={placeholderName}
                            onChange={(e) => setPlaceholderName(e.target.value)}
                            style={inputStyle}
                            placeholder="Example: PA Spring OSCE B"
                          />
                        </div>

                        <div style={{ marginTop: "14px" }}>
                          <div style={labelStyle}>Date / Date Text</div>
                          <input
                            value={placeholderDate}
                            onChange={(e) => setPlaceholderDate(e.target.value)}
                            style={inputStyle}
                            placeholder="Example: 4/15 and 4/21"
                          />
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: "14px" }}>
                      <div style={labelStyle}>Assignment Notes</div>
                      <input
                        value={assignmentNote}
                        onChange={(e) => setAssignmentNote(e.target.value)}
                        style={inputStyle}
                        placeholder="Optional notes"
                      />
                    </div>

                    <div style={buttonRowStyle}>
                      <button
                        type="button"
                        style={primaryButtonStyle}
                        onClick={() => saveAssignment(sp)}
                      >
                        Save Assignment Draft
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
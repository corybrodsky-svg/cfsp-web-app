"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const STATUSES = ["Needs SPs", "Scheduled", "In Progress", "Complete"];
const VISIBILITIES = ["team", "personal"];

function parseNumber(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function NewEventPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Needs SPs");
  const [dateText, setDateText] = useState("");
  const [spNeeded, setSpNeeded] = useState("0");
  const [spAssigned, setSpAssigned] = useState("0");
  const [visibility, setVisibility] = useState("team");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const payload = {
      name: name.trim(),
      status,
      date_text: dateText.trim(),
      sp_needed: parseNumber(spNeeded),
      sp_assigned: parseNumber(spAssigned),
      visibility,
    };

    const { error } = await supabase.from("events").insert([payload]);

    if (error) {
      console.error("Error creating event:", error);
      setErrorMessage("Could not create event.");
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/">← Back to Events</Link>
      </div>

      <h1 style={{ marginBottom: "20px" }}>Create New Event</h1>

      {errorMessage ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            border: "1px solid #cc0000",
            background: "#fff5f5",
            color: "#990000",
            borderRadius: "8px",
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleCreate} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label
            htmlFor="name"
            style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
          >
            Event Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event name"
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="status"
            style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dateText"
            style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
          >
            Date(s)
          </label>
          <input
            id="dateText"
            type="text"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            placeholder="Example: 4/20, 4/21"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="spNeeded"
            style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
          >
            SP Needed
          </label>
          <input
            id="spNeeded"
            type="number"
            min="0"
            value={spNeeded}
            onChange={(e) => setSpNeeded(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="spAssigned"
            style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
          >
            SP Assigned
          </label>
          <input
            id="spAssigned"
            type="number"
            min="0"
            value={spAssigned}
            onChange={(e) => setSpAssigned(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="visibility"
            style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}
          >
            Visibility
          </label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            {VISIBILITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #222",
              background: "#111",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Creating..." : "Create Event"}
          </button>

          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
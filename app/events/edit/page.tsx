"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type EventRow = {
  id: string;
  name: string | null;
  status: string | null;
  date_text: string | null;
  sp_needed: number | null;
  sp_assigned: number | null;
  visibility?: string | null;
};

const STATUSES = ["Needs SPs", "Scheduled", "In Progress", "Complete"];
const VISIBILITIES = ["team", "personal"];

function parseNumber(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Needs SPs");
  const [dateText, setDateText] = useState("");
  const [spNeeded, setSpNeeded] = useState("0");
  const [spAssigned, setSpAssigned] = useState("0");
  const [visibility, setVisibility] = useState("team");

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching event:", error);
        setErrorMessage("Could not load this event.");
        setLoading(false);
        return;
      }

      const event = data as EventRow;

      setName(event.name ?? "");
      setStatus(event.status ?? "Needs SPs");
      setDateText(event.date_text ?? "");
      setSpNeeded(String(event.sp_needed ?? 0));
      setSpAssigned(String(event.sp_assigned ?? 0));
      setVisibility(event.visibility ?? "team");

      setLoading(false);
    }

    if (id) {
      fetchEvent();
    }
  }, [id]);

  async function handleSave(e: React.FormEvent) {
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

    const { error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error updating event:", error);
      setErrorMessage("Could not save changes.");
      setSaving(false);
      return;
    }

    router.push(`/events/${id}`);
    router.refresh();
  }

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading event editor...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "700px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href={`/events/${id}`}>← Back to Event Details</Link>
      </div>

      <h1 style={{ marginBottom: "20px" }}>Edit Event</h1>

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

      <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
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

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "8px",
          }}
        >
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
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <Link
            href={`/events/${id}`}
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
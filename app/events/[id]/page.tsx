"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import SiteShell from "../../components/SiteShell";
import * as planningData from "../../lib/planningData";
import {
  buildImportedEvents,
  loadAssignments,
  saveAssignments,
  loadSPDirectory,
  EventAssignment,
  SPRecord,
} from "../../lib/cfspData";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = String(params?.id || "");

  const events = useMemo(() => buildImportedEvents(planningData), []);
  const event = events.find((e) => e.id === eventId);

  const [directory, setDirectory] = useState<SPRecord[]>([]);
  const [assignments, setAssignments] = useState<EventAssignment[]>([]);
  const [selectedSpId, setSelectedSpId] = useState("");

  useEffect(() => {
    setDirectory(loadSPDirectory());
    setAssignments(loadAssignments());
  }, []);

  if (!event) {
    return (
      <SiteShell title="Event Not Found">
        <div style={{ padding: 20 }}>Event not found</div>
      </SiteShell>
    );
  }

  const eventAssignments = assignments.filter(
    (a) => a.eventId === event.id
  );

  function addSP() {
    const sp = directory.find((s) => s.id === selectedSpId);
    if (!sp) return;

    const newAssign: EventAssignment = {
      id: crypto.randomUUID(),
      eventId: event.id,
      eventName: event.name,
      spId: sp.id,
      spName: sp.fullName,
      email: sp.email,
      phone: sp.phone,
      confirmed: false,
      notes: "",
      createdAt: new Date().toISOString(),
    };

    const next = [...assignments, newAssign];
    setAssignments(next);
    saveAssignments(next);
    setSelectedSpId("");
  }

  function toggleConfirm(id: string) {
    const next = assignments.map((a) =>
      a.id === id ? { ...a, confirmed: !a.confirmed } : a
    );
    setAssignments(next);
    saveAssignments(next);
  }

  function removeSP(id: string) {
    const next = assignments.filter((a) => a.id !== id);
    setAssignments(next);
    saveAssignments(next);
  }

  const emails = eventAssignments.map((a) => a.email).join(";");

  function sendEmail() {
    const subject = `${event.name} - Event Prep`;

    const body = `
SPs,

Event: ${event.name}
Date: ${event.dateText}

Please be prepared.

Thanks,
Cory
`;

    window.location.href =
      `mailto:?bcc=${emails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <SiteShell title={event.name}>
      <div style={{ padding: 20 }}>

        <h2>Add SP</h2>

        <select
          value={selectedSpId}
          onChange={(e) => setSelectedSpId(e.target.value)}
        >
          <option value="">Select SP</option>
          {directory.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.fullName}
            </option>
          ))}
        </select>

        <button onClick={addSP}>Add SP</button>

        <h2 style={{ marginTop: 30 }}>Assigned SPs</h2>

        {eventAssignments.map((a) => (
          <div key={a.id} style={{ marginBottom: 10 }}>
            <span
              onClick={() => toggleConfirm(a.id)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: a.confirmed ? "black" : "red",
                marginRight: 10,
              }}
            >
              {a.spName}
            </span>

            <button onClick={() => removeSP(a.id)}>Remove</button>
          </div>
        ))}

        <button
          onClick={sendEmail}
          style={{ marginTop: 30, padding: 10 }}
        >
          Generate Event Email
        </button>

      </div>
    </SiteShell>
  );
}
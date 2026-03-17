"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useParams } from "next/navigation";

type EventRow = {
  id: string;
  name: string | null;
  status: string | null;
  date_text: string | null;
  sp_needed: number | null;
  sp_assigned: number | null;
};

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventRow | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
      } else {
        setEvent(data);
      }
    }

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (!event) {
    return <p>Loading event...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Link href="/">← Back to Events</Link>

      <h1>{event.name}</h1>
      <p><strong>Status:</strong> {event.status}</p>
      <p><strong>Date(s):</strong> {event.date_text}</p>
      <p><strong>SP Needed:</strong> {event.sp_needed}</p>
      <p><strong>SP Assigned:</strong> {event.sp_assigned}</p>
      <p>
        <strong>Shortage:</strong>{" "}
        <span
          style={{
            color:
              (event.sp_needed ?? 0) - (event.sp_assigned ?? 0) > 0
                ? "red"
                : "green",
            fontWeight: "bold",
          }}
        >
          {(event.sp_needed ?? 0) - (event.sp_assigned ?? 0)}
        </span>
      </p>
    </div>
  );
}
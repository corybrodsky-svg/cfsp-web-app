"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import SiteShell from "../components/SiteShell";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.95fr 1.05fr",
  gap: "18px",
};

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  borderRadius: "24px",
  border: "1px solid rgba(23,61,112,0.10)",
  padding: "24px",
  boxShadow: "0 14px 30px rgba(23,61,112,0.08)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(23,61,112,0.16)",
  fontSize: "15px",
  boxSizing: "border-box",
};

function addMinutesToTime(baseTime: string, minutesToAdd: number) {
  const [h, m] = baseTime.split(":").map(Number);
  const total = h * 60 + m + minutesToAdd;
  const nextHours = Math.floor(total / 60);
  const nextMinutes = total % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

export default function SimFlowPage() {
  const [startTime, setStartTime] = useState("08:10");
  const [rounds, setRounds] = useState(4);
  const [encounterMinutes, setEncounterMinutes] = useState(20);
  const [transitionMinutes, setTransitionMinutes] = useState(5);
  const [rooms, setRooms] = useState(6);
  const [learnersPerRound, setLearnersPerRound] = useState(6);

  const output = useMemo(() => {
    const rows = [];
    let current = startTime;

    for (let i = 0; i < rounds; i += 1) {
      const roundStart = current;
      const encounterEnd = addMinutesToTime(roundStart, encounterMinutes);
      const transitionEnd = addMinutesToTime(encounterEnd, transitionMinutes);

      rows.push({
        round: i + 1,
        start: roundStart,
        encounterEnd,
        transitionEnd,
      });

      current = transitionEnd;
    }

    const totalMinutes = rounds * encounterMinutes + rounds * transitionMinutes;
    const roomPressure = learnersPerRound > rooms ? "Over capacity risk" : "Within stated capacity";
    const spLoad = Math.min(rooms, learnersPerRound);

    return {
      rows,
      totalMinutes,
      roomPressure,
      spLoad,
      endTime: current,
    };
  }, [startTime, rounds, encounterMinutes, transitionMinutes, rooms, learnersPerRound]);

  return (
    <SiteShell
      title="Sim Flow Calculator"
      subtitle="Use timing and room assumptions to calculate rounds, transitions, total runtime, and operational pressure before the event goes live."
    >
      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Calculator inputs
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Start Time</div>
              <input style={inputStyle} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Rounds</div>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Encounter Minutes</div>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={encounterMinutes}
                onChange={(e) => setEncounterMinutes(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Transition Minutes</div>
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={transitionMinutes}
                onChange={(e) => setTransitionMinutes(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Rooms Available</div>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#173d70", marginBottom: "8px" }}>Learners Per Round</div>
              <input
                style={inputStyle}
                type="number"
                min="1"
                value={learnersPerRound}
                onChange={(e) => setLearnersPerRound(Number(e.target.value || 0))}
              />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#173d70", marginBottom: "16px" }}>
            Sim flow output
          </div>

          <div style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
            <div style={{ color: "#597391" }}>
              <strong style={{ color: "#173d70" }}>Estimated End Time:</strong> {output.endTime}
            </div>
            <div style={{ color: "#597391" }}>
              <strong style={{ color: "#173d70" }}>Total Runtime:</strong> {output.totalMinutes} minutes
            </div>
            <div style={{ color: "#597391" }}>
              <strong style={{ color: "#173d70" }}>Room Pressure:</strong> {output.roomPressure}
            </div>
            <div style={{ color: "#597391" }}>
              <strong style={{ color: "#173d70" }}>Approx. SP Load Per Round:</strong> {output.spLoad}
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {output.rows.map((row) => (
              <div
                key={row.round}
                style={{
                  borderRadius: "18px",
                  padding: "14px 16px",
                  background: "rgba(243,248,252,0.85)",
                  border: "1px solid rgba(23,61,112,0.08)",
                }}
              >
                <div style={{ fontWeight: 800, color: "#173d70" }}>Round {row.round}</div>
                <div style={{ color: "#597391", marginTop: "6px", lineHeight: 1.6 }}>
                  Start: {row.start}
                  <br />
                  Encounter Ends: {row.encounterEnd}
                  <br />
                  Transition Ends: {row.transitionEnd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
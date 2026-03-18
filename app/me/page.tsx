"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MyProfile() {
  const [sp, setSp] = useState<any>(null);

  useEffect(() => {
    async function loadMySP() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("sps")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setSp(data);
    }

    loadMySP();
  }, []);

  if (!sp) return <div style={{ padding: 40 }}>Loading your profile...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>My Profile</h1>

      <p><b>Name:</b> {sp.full_name}</p>
      <p><b>Email:</b> {sp.email}</p>
      <p><b>Phone:</b> {sp.phone}</p>
      <p><b>Skills:</b> {sp.skills}</p>
      <p><b>Notes:</b> {sp.notes}</p>
    </div>
  );
}
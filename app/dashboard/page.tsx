"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/login");
        return;
      }

      if (profile.role === "operator") {
        router.push("/sps"); // your admin view
      } else if (profile.role === "sp") {
        router.push("/me"); // SP personal page
      }
    }

    loadUser();
  }, [router]);

  return <div style={{ padding: 40 }}>Loading dashboard...</div>;
}
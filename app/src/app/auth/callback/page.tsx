"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Finishing sign-in...");

  useEffect(() => {
    // Supabase بيكمل الجلسة تلقائيًا بعد تأكيد الإيميل
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setMsg("Error: " + error.message);
      else if (data.session) setMsg("✅ Email confirmed! You are signed in.");
      else setMsg("✅ Email confirmed! Now you can login.");
    });
  }, []);

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h1>Auth Callback</h1>
      <p>{msg}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/dashboard`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    setLoading(false);
    if (error) alert(error.message);
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      <>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="px-6 py-3 bg-white text-black rounded w-full font-semibold cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </>
    </div>
  );
}

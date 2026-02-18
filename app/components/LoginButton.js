"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-white text-black rounded-lg font-semibold"
    >
      Continue with Google
    </button>
  );
}

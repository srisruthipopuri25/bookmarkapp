"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/");
      } else {
        setUser(data.session.user);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) setUser(session.user);
        else router.push("/");
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;

    fetchBookmarks();

    const channel = supabase
      .channel("bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        fetchBookmarks
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const addBookmark = async () => {
    setErrorMessage("");

    if (!url.trim() || !title.trim()) {
      setErrorMessage("URL and title are required.");
      return;
    }

    if (!isValidUrl(url.trim())) {
      setErrorMessage("Please enter a valid URL (must start with http or https).");
      return;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        url: url.trim(),
        title: title.trim(),
        user_id: user.id,
      })
      .select();

    if (error) {
      console.error(error);
      setErrorMessage("Failed to add bookmark.");
      return;
    }

    if (data && data.length > 0) {
      setBookmarks((prev) => [data[0], ...prev]);
    }

    setUrl("");
    setTitle("");
  };

  const deleteBookmark = async (id) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 px-6 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Smart Bookmark
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {user.user_metadata?.full_name || user.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
          >
            Logout
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">
          <h2 className="text-lg font-medium mb-5">Add Bookmark</h2>

          <div className="space-y-4">
            <input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            <input
              placeholder="Bookmark title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
              onClick={addBookmark}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Add Bookmark
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-6">Your Bookmarks</h2>

          {bookmarks.length === 0 ? (
            <div className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-lg bg-white">
              No bookmarks added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
                >
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-[70%]"
                  >
                    {b.title}
                  </a>

                  <button
                    onClick={() => deleteBookmark(b.id)}
                    className="text-sm text-red-500 hover:text-red-600 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

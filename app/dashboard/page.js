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
        if (session) {
          setUser(session.user);
        } else {
          router.push("/");
        }
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
        () => {
          fetchBookmarks();
        }
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

  const addBookmark = async () => {
    if (!url || !title) return;

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        url,
        title,
        user_id: user.id,
      })
      .select();

    if (!error && data) {
      setBookmarks((prev) => [data[0], ...prev]);
    }

    setUrl("");
    setTitle("");
  };

  const deleteBookmark = async (id) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Welcome {user.user_metadata?.full_name || user.email}
        </h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="space-y-3 mb-8 bg-gray-900 p-6 rounded">
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 py-2 bg-gray-800 rounded w-full"
        />

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 bg-gray-800 rounded w-full"
        />

        <button
          onClick={addBookmark}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Add Bookmark
        </button>
      </div>

      <ul className="space-y-3">
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="bg-gray-800 p-4 rounded flex justify-between items-center"
          >
            <a href={b.url} target="_blank" rel="noreferrer">
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

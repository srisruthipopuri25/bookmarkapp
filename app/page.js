import LoginButton from "@/app/components/LoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Smart Bookmark</h1>
        <LoginButton />
      </div>
    </main>
  );
}

import "./globals.css";

export const metadata = {
  title: "Bookmark App",
  description: "Realtime private bookmark manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCT Supabase Diagnostics",
  description: "Connectivity diagnostics for Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

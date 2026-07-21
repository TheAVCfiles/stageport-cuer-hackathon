import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barre Code: Movement Cipher Lab",
  description: "A standalone embodied-computing lesson where deterministic logic validates structure and AI optionally explains the result.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

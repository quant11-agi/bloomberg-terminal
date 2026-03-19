import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloomberg Terminal",
  description: "Real-time financial markets dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

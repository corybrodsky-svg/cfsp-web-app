import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conflict-Free SP",
  description: "Simulation scheduling platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
import "./globals.css";
import AppHeader from "./components/AppHeader";

export const metadata = {
  title: "Conflict-Free SP",
  description: "Simulation Scheduling Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f4f7fb",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <AppHeader />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: 20 }}>{children}</div>
      </body>
    </html>
  );
}
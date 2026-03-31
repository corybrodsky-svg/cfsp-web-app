"use client";

type Props = {
  children: React.ReactNode;
  title?: string; // ← make OPTIONAL (THIS FIXES EVERYTHING)
};

export default function SiteShell({ children, title }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {title && (
        <h1 style={{ padding: "16px", margin: 0 }}>{title}</h1>
      )}
      <div>{children}</div>
    </div>
  );
}
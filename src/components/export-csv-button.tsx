"use client";

import { useState } from "react";

// A plain <a href> download gives no feedback until the browser's own download UI appears —
// for a large submissions table the button looked inert for however long the Lambda call
// behind it took. Fetching the same Route Handler client-side (same origin, so no CORS
// concerns) gives a real pending state and still ends in a normal browser download.
export function ExportCsvButton({ href, className }: { href: string; className?: string }) {
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    setExporting(true);
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1] ?? "export.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Export failed — please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={exporting} className={className}>
      {exporting ? "Exporting…" : "Export CSV"}
    </button>
  );
}

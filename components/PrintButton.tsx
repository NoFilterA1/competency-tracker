"use client";
export function PrintButton({ label = "Печать / сохранить в PDF" }: { label?: string }) {
  return <button className="btn" onClick={() => window.print()}>{label}</button>;
}

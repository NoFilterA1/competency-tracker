/* Integer that counts up from 0 using CSS only (@property). Real text stays available for screen readers. */
export function Num({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`count ${className}`} style={{ ["--to" as string]: Math.round(value) }} aria-label={String(Math.round(value))} />;
}

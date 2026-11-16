/** A grey placeholder block that gently pulses. Size and shape come from className. */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-gray-100 ${className}`} />;
}

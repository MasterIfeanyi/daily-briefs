export default function SkeletonCard({ heightClass = "h-32" }) {
  return (
    <div className={`w-full rounded-lg bg-surface-alt animate-pulse ${heightClass}`} />
  );
}
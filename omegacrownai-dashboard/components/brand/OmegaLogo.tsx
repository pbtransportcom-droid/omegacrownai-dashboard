export function OmegaLogo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <img
      src={compact ? "/api/brand/icon?v=2" : "/api/brand/logo?v=2"}
      alt="OmegaCrown AI"
      className={
        className ||
        (compact
          ? "h-10 w-10 object-contain"
          : "h-12 w-auto object-contain")
      }
    />
  );
}

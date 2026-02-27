export function SectionHeading({
  children,
  subtitle,
  className = "",
}: {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`mb-12 text-center ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted">{subtitle}</p>
      )}
    </div>
  );
}

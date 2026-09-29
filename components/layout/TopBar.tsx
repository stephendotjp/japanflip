interface TopBarProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}

export function TopBar({ title, subtitle, badge }: TopBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[34px] md:text-[42px] leading-none text-black min-w-0">{title}</h1>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      {subtitle && (
        <p className="font-body text-sm mt-1" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}

export function TopBar({ title, subtitle, badge }: TopBarProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-[42px] leading-none text-black">{title}</h1>
        {subtitle && (
          <p className="font-body text-sm mt-1" style={{ color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {badge && <div className="shrink-0 mt-1">{badge}</div>}
    </div>
  );
}

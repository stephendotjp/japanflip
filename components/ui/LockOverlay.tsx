interface LockOverlayProps {
  children: React.ReactNode;
  locked: boolean;
}

export function LockOverlay({ children, locked }: LockOverlayProps) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative select-none">
      <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl">🔒</span>
      </div>
    </div>
  );
}

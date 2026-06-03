interface Platform {
  name: string;
  priceMin: number;
  priceMax: number;
  fee: string;
  tip: string;
}

interface PlatformListProps {
  platforms: Platform[];
}

export default function PlatformList({ platforms }: PlatformListProps) {
  return (
    <div className="space-y-3">
      {platforms.map((platform) => (
        <div key={platform.name} className="p-4 bg-white border border-[#E8E4DE] rounded">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="font-mono-custom text-sm text-[#111111] font-medium">{platform.name}</span>
            <div className="text-right shrink-0">
              <p className="font-mono-custom text-xs text-[#1A7A4A]">
                ${platform.priceMin}–${platform.priceMax}
              </p>
              <p className="font-mono-custom text-[10px] text-[#888480]">Fee: {platform.fee}</p>
            </div>
          </div>
          <p className="font-mono-custom text-[11px] text-[#888480] leading-relaxed">{platform.tip}</p>
        </div>
      ))}
    </div>
  );
}

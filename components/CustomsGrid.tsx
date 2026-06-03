interface CustomsEntry {
  country: string;
  flag: string;
  limit: string;
  note: string;
}

interface CustomsGridProps {
  customs: CustomsEntry[];
}

export default function CustomsGrid({ customs }: CustomsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {customs.map((entry) => (
        <div key={entry.country} className="p-4 bg-[#F7F4EF] border border-[#E8E4DE] rounded">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{entry.flag}</span>
            <span className="font-mono-custom text-xs text-[#111111] font-medium">{entry.country}</span>
          </div>
          <p className="font-mono-custom text-xs text-[#D92B3A] mb-1">{entry.limit}</p>
          <p className="font-mono-custom text-[10px] text-[#888480] leading-relaxed">{entry.note}</p>
        </div>
      ))}
    </div>
  );
}

"use client";

interface QuickChipsProps {
  onSelect: (item: string, category: string, priceJPY: number, condition: string, size: string) => void;
  disabled?: boolean;
}

const chips = [
  { label: "Levi's 501 · ¥800", item: "Levi's 501", category: "Clothing", price: 800, size: "Medium" },
  { label: "Olympus mju-II · ¥3,200", item: "Olympus mju-II", category: "Electronics", price: 3200, size: "Small" },
  { label: "Nikka From The Barrel · ¥2,800", item: "Nikka From The Barrel", category: "Spirits", price: 2800, size: "Small" },
  { label: "Yamaha receiver · ¥5,000", item: "Yamaha receiver", category: "Electronics", price: 5000, size: "Large" },
  { label: "Nike JP exclusive · ¥12,000", item: "Nike JP exclusive", category: "Sneakers", price: 12000, size: "Medium" },
];

export function QuickChips({ onSelect, disabled }: QuickChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted">
        Quick examples
      </span>
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={() => !disabled && onSelect(chip.item, chip.category, chip.price, "A", chip.size)}
          disabled={disabled}
          className="px-3 py-1.5 border border-border rounded-full font-mono text-xs text-muted hover:text-text hover:border-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

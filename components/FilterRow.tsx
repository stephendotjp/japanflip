"use client";

interface FilterRowProps {
  city: string;
  setCity: (c: string) => void;
  budget: string;
  setBudget: (b: string) => void;
  sort: string;
  setSort: (s: string) => void;
}

const cities = ["All Cities", "Tokyo", "Osaka", "Kyoto"];
const budgets = ["Any", "Under ¥3,000", "Under ¥10,000"];
const sorts = ["Highest ROI", "Lowest Buy-In", "Easiest to Sell"];

export default function FilterRow({ city, setCity, budget, setBudget, sort, setSort }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1.5">
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`font-mono-custom text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
              city === c
                ? "bg-[#111111] text-white border-[#111111]"
                : "bg-white text-[#888480] border-[#E8E4DE] hover:border-[#111111] hover:text-[#111111]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[#E8E4DE]" />

      <div className="flex gap-1.5">
        {budgets.map((b) => (
          <button
            key={b}
            onClick={() => setBudget(b)}
            className={`font-mono-custom text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
              budget === b
                ? "bg-[#111111] text-white border-[#111111]"
                : "bg-white text-[#888480] border-[#E8E4DE] hover:border-[#111111] hover:text-[#111111]"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="ml-auto">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="font-mono-custom text-[11px] px-3 py-1.5 border border-[#E8E4DE] rounded bg-white text-[#2A2825] cursor-pointer focus:outline-none focus:border-[#111111]"
        >
          {sorts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

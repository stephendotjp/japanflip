"use client";

const items = [
  "Vintage Levi's 501 · Buy ¥800 · Sell $120",
  "Seiko SKX007 · Buy ¥4,500 · Sell $240",
  "Olympus mju-II · Buy ¥3,200 · Sell $195",
  "Nikka From The Barrel · Buy ¥2,800 · Sell $105",
  "Yamaha CR-820 · Buy ¥5,000 · Sell $165",
  "Casio G-Shock Japan · Buy ¥8,000 · Sell $280",
  "Wrangler 11MZ · Buy ¥1,200 · Sell $90",
  "Vivitar Ultra Wide · Buy ¥1,500 · Sell $85",
];

export function Ticker() {
  const text = items.map((i) => `▸ ${i}`).join("    ");
  const doubled = `${text}    ${text}`;

  return (
    <div
      className="overflow-hidden py-3"
      style={{ background: "var(--red)" }}
    >
      <div
        className="whitespace-nowrap animate-ticker inline-block"
        style={{ willChange: "transform" }}
      >
        <span className="font-mono text-[12px] tracking-widest text-white">
          {doubled}
        </span>
      </div>
    </div>
  );
}

const items = [
  "▸ Vintage Levi's 501 · Buy ¥800 · Sell $120",
  "▸ Seiko SKX Diver · Buy ¥12,000 · Sell $280",
  "▸ Nikka Whisky · Buy ¥3,000 · Sell $110",
  "▸ Olympus OM-1 · Buy ¥5,000 · Sell $160",
  "▸ Sashiko Jacket · Buy ¥3,500 · Sell $220",
  "▸ Nike Japan Exclusive · Buy ¥16,000 · Sell $320",
  "▸ Yamaha HiFi Amp · Buy ¥9,000 · Sell $450",
  "▸ Higonokami Knife · Buy ¥1,200 · Sell $55",
  "▸ Vintage Levi's 501 · Buy ¥800 · Sell $120",
  "▸ Seiko SKX Diver · Buy ¥12,000 · Sell $280",
  "▸ Nikka Whisky · Buy ¥3,000 · Sell $110",
  "▸ Olympus OM-1 · Buy ¥5,000 · Sell $160",
  "▸ Sashiko Jacket · Buy ¥3,500 · Sell $220",
  "▸ Nike Japan Exclusive · Buy ¥16,000 · Sell $320",
  "▸ Yamaha HiFi Amp · Buy ¥9,000 · Sell $450",
  "▸ Higonokami Knife · Buy ¥1,200 · Sell $55",
];

export default function Ticker() {
  return (
    <div className="bg-[#D92B3A] py-3 overflow-hidden">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "ticker 40s linear infinite" }}
      >
        {items.map((item, i) => (
          <span key={i} className="font-mono-custom text-xs text-white px-8">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

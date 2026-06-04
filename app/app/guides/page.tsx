import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

const categories = [
  { slug: "clothing", label: "Clothing & Denim", emoji: "👖", difficulty: "Easy", bgClass: "bg-green-light" },
  { slug: "watches", label: "Watches", emoji: "⌚", difficulty: "Medium", bgClass: "bg-surface" },
  { slug: "cameras", label: "Film Cameras", emoji: "📷", difficulty: "Medium", bgClass: "bg-surface" },
  { slug: "spirits", label: "Spirits & Whisky", emoji: "🥃", difficulty: "Easy", bgClass: "bg-gold-light" },
  { slug: "sneakers", label: "Sneakers", emoji: "👟", difficulty: "Hard", bgClass: "bg-surface" },
  { slug: "audio", label: "Vintage Audio", emoji: "🔊", difficulty: "Medium", bgClass: "bg-surface" },
  { slug: "knives", label: "Knives & Tools", emoji: "🔪", difficulty: "Medium", bgClass: "bg-surface" },
  { slug: "gaming", label: "Retro Gaming", emoji: "🎮", difficulty: "Hard", bgClass: "bg-surface", premium: true },
];

const difficultyStyle: Record<string, string> = {
  Easy: "text-green",
  Medium: "text-gold",
  Hard: "text-red",
};

export default function GuidesPage() {
  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <TopBar
        title="Category Guides"
        subtitle="What to look for, what to avoid, and where to sell."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/app/guides/${cat.slug}`}
            className={`${cat.bgClass} border border-border rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:border-red/30 relative overflow-hidden block`}
          >
            {cat.premium && (
              <span className="absolute top-3 right-3 font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded text-white bg-gold">
                PRO
              </span>
            )}
            <p className="text-3xl mb-3">{cat.emoji}</p>
            <p className="font-body text-sm font-medium text-text">{cat.label}</p>
            <p className={`font-mono text-[10px] tracking-widest uppercase mt-1 ${difficultyStyle[cat.difficulty]}`}>
              {cat.difficulty} to find
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

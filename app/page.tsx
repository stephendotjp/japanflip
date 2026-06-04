import Link from "next/link";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { Ticker } from "@/components/landing/Ticker";
import { PricingCards } from "@/components/landing/PricingCards";
import { SocialProof } from "@/components/landing/SocialProof";
import { LandingCalculator } from "@/components/landing/LandingCalculator";

const GUMROAD_BASIC = process.env.NEXT_PUBLIC_GUMROAD_BASIC_URL || "/app/upgrade";

const howItWorks = [
  {
    step: "01",
    title: "Find something",
    desc: "In any recycle shop, Hard Off, Book Off, or flea market.",
  },
  {
    step: "02",
    title: "Check JapanFlip",
    desc: "Type what you found and the price. Takes 10 seconds.",
  },
  {
    step: "03",
    title: "Buy smart",
    desc: "BUY IT, SKIP IT, or MAYBE — with the numbers to back it.",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 bg-white border-b border-border px-5 md:px-10"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-baseline gap-2">
            <Link href="/" className="flex items-baseline gap-0">
              <span className="font-display text-2xl text-black tracking-wide">Japan</span>
              <span className="font-display text-2xl tracking-wide" style={{ color: "var(--red)" }}>
                Flip
              </span>
            </Link>
            <span className="hidden md:block font-mono text-[10px] tracking-[2px] uppercase text-muted ml-2">
              The Japan Resale Tool
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="font-body text-sm text-muted hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={GUMROAD_BASIC}
              className="px-4 py-2 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "var(--red)" }}
            >
              Get Access — $9
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center px-5 md:px-10 py-16 overflow-hidden">
        {/* Decorative Japanese text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden
        >
          <span
            className="font-display text-[20vw] leading-none"
            style={{ color: "var(--text)", opacity: 0.03 }}
          >
            日本
          </span>
        </div>

        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <div className="space-y-6 animate-fadeUp">
            <h1 className="font-display leading-none">
              <span className="block text-[clamp(3rem,8vw,5rem)] text-black">You Found</span>
              <span
                className="block text-[clamp(3.5rem,10vw,6.5rem)]"
                style={{ color: "var(--red)" }}
              >
                SOMETHING
              </span>
              <span
                className="block text-[clamp(3rem,8vw,5rem)]"
                style={{
                  WebkitTextStroke: "2px var(--black)",
                  color: "transparent",
                }}
              >
                Worth $200
              </span>
            </h1>

            <p
              className="font-body text-lg max-w-md leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              You&apos;re standing in a recycle shop in Japan. Before you buy — check JapanFlip. We
              tell you exactly what it&apos;s worth back home.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={GUMROAD_BASIC}
                className="px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
                style={{ background: "var(--red)" }}
              >
                Get Basic — $9
              </Link>
              <Link
                href="#how-it-works"
                className="px-6 py-3 font-mono text-xs tracking-widest uppercase rounded-md border hover:bg-black hover:text-white transition-colors"
                style={{ borderColor: "var(--black)", color: "var(--black)" }}
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Right: live demo */}
          <div className="animate-fadeUp" style={{ animationDelay: "100ms" }}>
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* How It Works */}
      <section id="how-it-works" className="px-5 md:px-10 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted whitespace-nowrap">
              How it works
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <div
                key={step.step}
                className="animate-fadeUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p
                  className="font-display text-7xl leading-none mb-4"
                  style={{ color: "var(--red)" }}
                >
                  {step.step}
                </p>
                <p className="font-display text-2xl text-black mb-2">{step.title}</p>
                <p className="font-body text-sm" style={{ color: "var(--muted)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="px-5 md:px-10 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted whitespace-nowrap">
              Run the numbers
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="font-display text-3xl md:text-4xl text-black mb-2 text-center">
            Run the numbers before you buy.
          </p>
          <p className="font-body text-base text-muted text-center mb-8">
            Quick estimate — no account needed. Full breakdown is inside the tool.
          </p>
          <LandingCalculator />
        </div>
      </section>

      {/* Pricing */}
      <section className="px-5 md:px-10 py-20" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center gap-4 justify-center mb-4">
              <div className="flex-1 h-px bg-border max-w-[120px]" />
              <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted">
                What you get
              </span>
              <div className="flex-1 h-px bg-border max-w-[120px]" />
            </div>
            <p className="font-display text-4xl md:text-5xl text-black">Simple Pricing</p>
            <p className="font-body text-base text-muted mt-2">
              One-time. No subscription. No renewal.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* Social proof */}
      <section className="px-5 md:px-10 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted whitespace-nowrap">
              What people say
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <SocialProof />
        </div>
      </section>

      {/* CTA band */}
      <section className="px-5 md:px-10 py-20" style={{ background: "#111111" }}>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="font-display text-5xl md:text-6xl text-white leading-none">
            Stop guessing.
            <br />
            <span style={{ color: "var(--red)" }}>Start flipping.</span>
          </p>
          <p className="font-body text-base" style={{ color: "#ffffff80" }}>
            3 free lookups. No account needed. $9 for unlimited.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/app"
              className="px-8 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md border border-white/20 hover:bg-white/10 transition-colors"
            >
              Try Free
            </Link>
            <Link
              href={GUMROAD_BASIC}
              className="px-8 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "var(--red)" }}
            >
              Get Basic — $9
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-10 py-10 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-baseline gap-0">
                <span className="font-display text-xl text-black">Japan</span>
                <span className="font-display text-xl" style={{ color: "var(--red)" }}>
                  Flip
                </span>
              </div>
              <p className="font-body text-xs text-muted mt-1 max-w-xs">
                Not affiliated with any shop or brand. Built by someone who lives in Japan.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#" },
                { label: "Category Guides", href: "/app/guides" },
                { label: "Contact", href: "mailto:shaolinmonkuk@gmail.com" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="font-body text-sm text-muted hover:text-text transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="font-mono text-[10px] text-muted mt-8">
            JapanFlip uses publicly available market data for informational purposes only. Prices
            vary. We make no guarantee of profit. Customs regulations are subject to change — always
            verify before traveling.
          </p>
        </div>
      </footer>
    </div>
  );
}

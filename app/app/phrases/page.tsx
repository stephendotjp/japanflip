"use client";

import { useUser } from "@/context/UserContext";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LockOverlay } from "@/components/ui/LockOverlay";
import Link from "next/link";
import phrasesData from "@/data/phrases.json";

export default function PhrasesPage() {
  const { isPremium } = useUser();
  const FREE_PREVIEW = 1; // phrases shown per section for free users

  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <TopBar
        title="Phrase Cards"
        subtitle="Japanese negotiation phrases for recycle shops and flea markets."
      />

      {!isPremium && (
        <div
          className="px-4 py-3 rounded-md border text-sm"
          style={{ background: "var(--gold-light)", borderColor: "rgba(184,134,11,0.2)" }}
        >
          <span className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
            Showing 1 phrase per section.{" "}
            <Link href="/app/upgrade" className="underline">
              Upgrade for all {phrasesData.sections.reduce((n, s) => n + s.phrases.length, 0)} phrases →
            </Link>
          </span>
        </div>
      )}

      <div className="space-y-8">
        {phrasesData.sections.map((section) => {
          const visible = isPremium ? section.phrases : section.phrases.slice(0, FREE_PREVIEW);
          const locked = !isPremium ? section.phrases.slice(FREE_PREVIEW) : [];

          return (
            <div key={section.id}>
              <SectionLabel>{section.title}</SectionLabel>
              <div className="grid md:grid-cols-2 gap-3">
                {visible.map((phrase) => (
                  <div
                    key={phrase.romaji}
                    className="bg-surface border border-border rounded-xl p-5 space-y-3"
                  >
                    <p
                      className="font-display text-3xl"
                      style={{ color: "var(--text)", lineHeight: 1.2 }}
                    >
                      {phrase.japanese}
                    </p>
                    <p className="font-mono text-sm text-muted">{phrase.romaji}</p>
                    <p className="font-body text-sm text-text font-medium">{phrase.meaning}</p>
                    <p
                      className="font-body text-xs leading-relaxed pt-2 border-t border-border"
                      style={{ color: "var(--muted)" }}
                    >
                      {phrase.usageNote}
                    </p>
                  </div>
                ))}

                {locked.map((phrase, i) => (
                  <LockOverlay key={i} locked={true}>
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                      <p className="font-display text-3xl text-text">{phrase.japanese}</p>
                      <p className="font-mono text-sm text-muted">{phrase.romaji}</p>
                      <p className="font-body text-sm text-text">{phrase.meaning}</p>
                      <p className="font-body text-xs text-muted pt-2 border-t border-border">{phrase.usageNote}</p>
                    </div>
                  </LockOverlay>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!isPremium && (
        <div
          className="border-2 border-dashed rounded-xl p-8 text-center space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="font-display text-2xl text-black">Unlock All Phrases</p>
          <p className="font-body text-sm text-muted max-w-sm mx-auto">
            Premium includes all {phrasesData.sections.reduce((n, s) => n + s.phrases.length, 0)} negotiation phrases organized by situation.
          </p>
          <Link
            href="/app/upgrade"
            className="inline-block px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
            style={{ background: "var(--red)" }}
          >
            Get Premium — $24
          </Link>
        </div>
      )}
    </div>
  );
}

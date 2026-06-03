"use client";

interface Phrase {
  japanese: string;
  romaji: string;
  meaning: string;
}

interface PhraseCardProps {
  phrase: Phrase;
  blurred?: boolean;
}

export default function PhraseCard({ phrase, blurred = false }: PhraseCardProps) {
  return (
    <div className={`p-4 bg-[#F7F4EF] border border-[#E8E4DE] rounded space-y-1 ${blurred ? "blur-[3px] select-none" : ""}`}>
      <p className="text-2xl text-[#111111]">{phrase.japanese}</p>
      <p className="font-mono-custom text-xs text-[#888480]">{phrase.romaji}</p>
      <p className="font-mono-custom text-xs text-[#2A2825]">{phrase.meaning}</p>
    </div>
  );
}

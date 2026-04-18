"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/lib/rewards";
import { X } from "lucide-react";

export default function BadgeToast({ badges, onDone }: { badges: Badge[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      if (index < badges.length - 1) {
        setIndex(i => i + 1);
      } else {
        onDone();
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [index, visible, badges.length, onDone]);

  if (!badges.length || !visible) return null;
  const badge = badges[index];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-gray-950 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="text-4xl shrink-0">{badge.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">Badge Unlocked!</p>
          <p className="font-bold text-white">{badge.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>
        </div>
        <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-gray-300 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      {badges.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {badges.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-yellow-400" : "w-1.5 bg-gray-600"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

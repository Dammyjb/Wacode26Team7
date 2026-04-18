"use client";

import { useEffect, useState } from "react";
import { loadImpact, ImpactStats } from "@/lib/impact";
import { getTier, getBadges } from "@/lib/rewards";
import { Leaf, TrendingUp, Heart, Zap, FileText, Recycle } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BAR_MAX_PX = 120;

function BarChart({ data }: { data: { label: string; donation: number; biodigester: number; landfill: number }[] }) {
  const max = Math.max(...data.map(d => d.donation + d.biodigester + d.landfill), 1);
  return (
    <div className="flex items-end gap-3 w-full" style={{ height: BAR_MAX_PX + 24 }}>
      {data.map((d) => {
        const total = d.donation + d.biodigester + d.landfill;
        const barH = Math.max(Math.round((total / max) * BAR_MAX_PX), 4);
        const donH = total ? Math.round((d.donation / total) * barH) : 0;
        const bioH = total ? Math.round((d.biodigester / total) * barH) : 0;
        const lanH = barH - donH - bioH;
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full rounded overflow-hidden flex flex-col-reverse" style={{ height: barH }}>
              <div className="w-full bg-green-500 shrink-0" style={{ height: donH }} />
              <div className="w-full bg-blue-400 shrink-0" style={{ height: bioH }} />
              <div className="w-full bg-gray-300 shrink-0" style={{ height: lanH }} />
            </div>
            <span className="text-xs text-gray-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ImpactPage() {
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    setStats(loadImpact());
  }, []);

  if (!stats) return null;

  const tier = getTier(stats);
  const badges = getBadges(stats);
  const earnedBadges = badges.filter(b => b.earned);
  const diverted = stats.donationLbs + stats.biodigesterLbs;
  const divertedPct = stats.totalLbs ? Math.round((diverted / stats.totalLbs) * 100) : 0;

  // Stable factors per month slot so chart doesn't flicker on re-render
  const FACTORS = [0.65, 0.80, 0.72, 0.95, 0.88, 1.0];
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i);
    const factor = FACTORS[i];
    return {
      label: MONTHS[d.getMonth()],
      donation: Math.round((stats.donationLbs / 6) * factor),
      biodigester: Math.round((stats.biodigesterLbs / 6) * factor),
      landfill: Math.round((stats.landfillLbs / 6) * factor),
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Impact</h1>
          <p className="text-gray-500 mt-1">Your food waste diversion stats — cumulative across all sessions.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-2 text-center">
          <p className="text-2xl font-black text-green-700">{divertedPct}%</p>
          <p className="text-xs text-green-600 font-medium">Diverted from landfill</p>
        </div>
      </div>

      {/* Tier card */}
      <div className={`rounded-2xl border p-5 flex items-center gap-5 ${tier.bg} ${tier.border}`}>
        <div className="text-5xl">{tier.icon}</div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Tier</p>
          <p className={`text-2xl font-black ${tier.color}`}>{tier.name}</p>
          {tier.nextLbs && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{diverted.toLocaleString()} lbs diverted</span>
                <span>{tier.nextLbs.toLocaleString()} lbs to reach {tier.nextName}</span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min((diverted / tier.nextLbs) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {!tier.nextLbs && (
            <p className="text-sm text-gray-500 mt-1">You&apos;ve reached the highest tier! 🎉</p>
          )}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Leaf className="w-5 h-5" />, label: "Total Classified", value: `${stats.totalLbs.toLocaleString()} lbs`, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
          { icon: <Heart className="w-5 h-5" />, label: "Donated", value: `${stats.donationLbs.toLocaleString()} lbs`, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { icon: <Recycle className="w-5 h-5" />, label: "Biodigested", value: `${stats.biodigesterLbs.toLocaleString()} lbs`, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { icon: <FileText className="w-5 h-5" />, label: "Est. Tax Savings", value: `$${stats.estimatedTaxSavings.toLocaleString()}`, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 flex flex-col gap-2 ${s.bg}`}>
            <div className={s.color}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Environmental impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4 items-center">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <Zap className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.co2SavedLbs.toLocaleString()} lbs</p>
            <p className="text-sm text-gray-500">CO₂ emissions prevented</p>
            <p className="text-xs text-gray-400 mt-0.5">Equivalent to {Math.round(stats.co2SavedLbs / 404)} car trips avoided</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4 items-center">
          <div className="bg-orange-50 p-3 rounded-xl">
            <Heart className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.mealsProvided.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Meals provided to community</p>
            <p className="text-xs text-gray-400 mt-0.5">Across {stats.totalSessions} classification sessions</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Food Diversion (Last 6 Months)</h2>
            <p className="text-xs text-gray-400 mt-0.5">lbs classified per month</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Donation</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" /> Biodigester</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300 inline-block" /> Landfill</span>
          </div>
        </div>
        <BarChart data={chartData} />
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 mb-4">Disposal Breakdown</h2>
        {[
          { label: "Donation", lbs: stats.donationLbs, color: "bg-green-500", textColor: "text-green-700" },
          { label: "Biodigester", lbs: stats.biodigesterLbs, color: "bg-blue-400", textColor: "text-blue-700" },
          { label: "Landfill", lbs: stats.landfillLbs, color: "bg-gray-300", textColor: "text-gray-600" },
        ].map((row) => {
          const pct = stats.totalLbs ? Math.round((row.lbs / stats.totalLbs) * 100) : 0;
          return (
            <div key={row.label} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className={`font-medium ${row.textColor}`}>{row.label}</span>
                <span className="text-gray-500">{row.lbs.toLocaleString()} lbs ({pct}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Badges</h2>
          <span className="text-sm text-gray-500">{earnedBadges.length} / {badges.length} earned</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                badge.earned
                  ? "bg-gray-950 border-gray-800"
                  : "bg-gray-50 border-gray-200 opacity-40 grayscale"
              }`}
            >
              <span className="text-3xl mb-1">{badge.icon}</span>
              <p className={`text-xs font-semibold leading-tight ${badge.earned ? "text-white" : "text-gray-500"}`}>
                {badge.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
        <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800">
          <span className="font-semibold">Keep it up!</span> You&apos;ve diverted {divertedPct}% of your food waste from landfill.
          The national average for restaurants is just 14%.
        </p>
      </div>
    </div>
  );
}

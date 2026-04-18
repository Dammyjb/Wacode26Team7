import { ImpactStats } from "./impact";

export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface Tier {
  name: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  minLbs: number;
  nextName?: string;
  nextLbs?: number;
}

const TIERS: Tier[] = [
  { name: "Seedling",          icon: "🌱", color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200", minLbs: 0,    nextName: "Sprout",           nextLbs: 100  },
  { name: "Sprout",            icon: "🌿", color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",minLbs: 100,  nextName: "Green Champion",   nextLbs: 500  },
  { name: "Green Champion",    icon: "🌳", color: "text-teal-700",   bg: "bg-teal-50",    border: "border-teal-200",  minLbs: 500,  nextName: "Sustainability Hero",nextLbs: 1500 },
  { name: "Sustainability Hero",icon: "🏆", color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200",minLbs: 1500 },
];

export function getTier(stats: ImpactStats): Tier {
  const diverted = stats.donationLbs + stats.biodigesterLbs;
  const tier = [...TIERS].reverse().find(t => diverted >= t.minLbs) ?? TIERS[0];
  return tier;
}

export function getBadges(stats: ImpactStats): Badge[] {
  const diverted = stats.donationLbs + stats.biodigesterLbs;
  return [
    {
      id: "first_session",
      icon: "🥇",
      name: "First Step",
      description: "Completed your first classification session",
      earned: stats.totalSessions >= 1,
    },
    {
      id: "first_donation",
      icon: "💚",
      name: "Generous Heart",
      description: "Donated food to your first food bank",
      earned: stats.donationLbs > 0,
    },
    {
      id: "first_biodigester",
      icon: "♻️",
      name: "Composter",
      description: "Sent food to a biodigester for the first time",
      earned: stats.biodigesterLbs > 0,
    },
    {
      id: "five_sessions",
      icon: "🔥",
      name: "On a Roll",
      description: "Completed 5 classification sessions",
      earned: stats.totalSessions >= 5,
    },
    {
      id: "hundred_meals",
      icon: "🍽️",
      name: "Community Hero",
      description: "Provided 100 meals to the community",
      earned: stats.mealsProvided >= 100,
    },
    {
      id: "five_hundred_lbs",
      icon: "🌍",
      name: "Earth Saver",
      description: "Diverted 500 lbs of food from landfill",
      earned: diverted >= 500,
    },
    {
      id: "tax_doc",
      icon: "💰",
      name: "Tax Pro",
      description: "Generated your first IRS tax document",
      earned: stats.estimatedTaxSavings > 0,
    },
    {
      id: "thousand_lbs",
      icon: "💎",
      name: "Green Pioneer",
      description: "Classified over 1,000 lbs of food",
      earned: stats.totalLbs >= 1000,
    },
    {
      id: "twenty_sessions",
      icon: "🌟",
      name: "Dedicated Champion",
      description: "Completed 20 classification sessions",
      earned: stats.totalSessions >= 20,
    },
    {
      id: "co2_hero",
      icon: "💨",
      name: "Air Guardian",
      description: "Prevented 1,000 lbs of CO₂ emissions",
      earned: stats.co2SavedLbs >= 1000,
    },
  ];
}

const BADGE_STORAGE_KEY = "fw_earned_badges";

export function getPreviouslyEarnedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BADGE_STORAGE_KEY) ?? "[]");
  } catch { return []; }
}

export function saveEarnedIds(ids: string[]) {
  localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(ids));
}

export function getNewlyUnlocked(stats: ImpactStats): Badge[] {
  const all = getBadges(stats);
  const prev = getPreviouslyEarnedIds();
  const nowEarned = all.filter(b => b.earned);
  const newOnes = nowEarned.filter(b => !prev.includes(b.id));
  saveEarnedIds(nowEarned.map(b => b.id));
  return newOnes;
}

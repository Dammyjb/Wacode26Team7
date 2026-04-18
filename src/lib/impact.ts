import { ClassificationResult } from "@/types";

export interface ImpactStats {
  totalSessions: number;
  totalLbs: number;
  donationLbs: number;
  biodigesterLbs: number;
  landfillLbs: number;
  estimatedTaxSavings: number;
  co2SavedLbs: number; // ~2.5 lbs CO2 per lb of food diverted from landfill
  mealsProvided: number; // ~1.2 lbs per meal
}

const STORAGE_KEY = "fw_impact";

// Pre-seeded history so a restaurant looks like they've been using Allofood for a month
const SEED: ImpactStats = {
  totalSessions: 18,
  totalLbs: 1240,
  donationLbs: 780,
  biodigesterLbs: 380,
  landfillLbs: 80,
  estimatedTaxSavings: 1170,
  co2SavedLbs: 2900,
  mealsProvided: 650,
};

export function loadImpact(): ImpactStats {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as ImpactStats;
  } catch {
    return SEED;
  }
}

export function recordSession(results: ClassificationResult[]): ImpactStats {
  const prev = loadImpact();
  const donationLbs = results.filter(r => r.category === "donation").reduce((s, r) => s + r.item.quantity, 0);
  const biodigesterLbs = results.filter(r => r.category === "biodigester").reduce((s, r) => s + r.item.quantity, 0);
  const landfillLbs = results.filter(r => r.category === "landfill").reduce((s, r) => s + r.item.quantity, 0);
  const taxSavings = results.filter(r => r.category === "donation").reduce((s, r) => s + (r.estimatedValue ?? 0), 0);
  const diverted = donationLbs + biodigesterLbs;

  const next: ImpactStats = {
    totalSessions: prev.totalSessions + 1,
    totalLbs: prev.totalLbs + donationLbs + biodigesterLbs + landfillLbs,
    donationLbs: prev.donationLbs + donationLbs,
    biodigesterLbs: prev.biodigesterLbs + biodigesterLbs,
    landfillLbs: prev.landfillLbs + landfillLbs,
    estimatedTaxSavings: prev.estimatedTaxSavings + taxSavings,
    co2SavedLbs: prev.co2SavedLbs + Math.round(diverted * 2.5),
    mealsProvided: prev.mealsProvided + Math.round(donationLbs / 1.2),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

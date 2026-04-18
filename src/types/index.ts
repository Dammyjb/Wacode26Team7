export type FoodCondition = "fresh" | "near-expiry" | "spoiled";
export type FoodCategory = "donation" | "biodigester" | "landfill";

export interface FoodItem {
  id: string;
  name: string;
  quantity: number; // in lbs
  condition: FoodCondition;
  expiryDate: string;
  notes?: string;
}

export interface ClassificationResult {
  item: FoodItem;
  category: FoodCategory;
  confidence: number; // 0-100
  reason: string;
  estimatedValue?: number; // USD, for donations
}

export interface Facility {
  id: string;
  name: string;
  type: FoodCategory;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  distanceMiles?: number;
  driveMins?: number;
  capacityPercent: number; // 0–100: how full the facility currently is
}

export type CapacityStatus = "available" | "limited" | "full";

export function getCapacityStatus(pct: number): CapacityStatus {
  if (pct >= 85) return "full";
  if (pct >= 60) return "limited";
  return "available";
}

export interface DonationSummary {
  items: ClassificationResult[];
  totalLbs: number;
  totalFMV: number; // fair market value
  donorName: string;
  donorAddress: string;
  recipientName: string;
  recipientAddress: string;
  date: string;
}

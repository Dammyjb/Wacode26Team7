"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, Phone, Clock, ArrowRight, Navigation } from "lucide-react";
import { ClassificationResult, Facility, FoodCategory, getCapacityStatus } from "@/types";
import { MOCK_FACILITIES } from "@/lib/mockFacilities";

const CAPACITY_STYLES = {
  available: { bar: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200", label: "Space Available" },
  limited:   { bar: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Almost Full" },
  full:      { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50 border-red-200", label: "At Capacity" },
};

const FacilityMap = dynamic(() => import("@/components/FacilityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Loading map...
    </div>
  ),
});

const CATEGORY_COLORS: Record<FoodCategory, string> = {
  donation: "bg-green-100 text-green-800 border-green-200",
  biodigester: "bg-blue-100 text-blue-800 border-blue-200",
  landfill: "bg-gray-100 text-gray-700 border-gray-200",
};

const CATEGORY_PIN: Record<FoodCategory, string> = {
  donation: "🟢",
  biodigester: "🔵",
  landfill: "⚫",
};

const CATEGORY_LABEL: Record<FoodCategory, string> = {
  donation: "Donation Center",
  biodigester: "Biodigester",
  landfill: "Landfill",
};

function getNeededCategories(results: ClassificationResult[]): FoodCategory[] {
  const cats = new Set(results.map((r) => r.category));
  return Array.from(cats) as FoodCategory[];
}

export default function MapPage() {
  const router = useRouter();
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | "all">("all");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("classificationResults");
    if (stored) {
      const parsed: ClassificationResult[] = JSON.parse(stored);
      setResults(parsed);
      const cats = getNeededCategories(parsed);
      if (cats.length === 1) setSelectedCategory(cats[0]);
    }
  }, []);

  const neededCategories = getNeededCategories(results);
  const displayedCategories: FoodCategory[] =
    selectedCategory === "all" ? neededCategories : [selectedCategory];

  const facilities = MOCK_FACILITIES.filter((f) =>
    displayedCategories.length === 0
      ? true
      : displayedCategories.includes(f.type)
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find Nearby Facilities</h1>
        <p className="text-gray-600 mt-1">
          Based on your food classification, here are the closest facilities for each route.
        </p>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-500 mb-3">Your classification summary</p>
          <div className="flex flex-wrap gap-2">
            {results.map((r) => (
              <span
                key={r.item.id}
                className={`text-xs px-3 py-1 rounded-full border font-medium ${CATEGORY_COLORS[r.category]}`}
              >
                {r.item.name} → {r.category}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {results.length > 0 && (
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Needed
          </button>
        )}
        {(["donation", "biodigester", "landfill"] as FoodCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedCategory === cat
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {CATEGORY_PIN[cat]} {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facility list */}
        <div className="lg:col-span-1 flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1">
          {facilities.map((facility) => (
            <button
              key={facility.id}
              onClick={() => setSelectedFacility(facility)}
              className={`text-left bg-white rounded-2xl border p-4 flex flex-col gap-2 transition-all ${
                selectedFacility?.id === facility.id
                  ? "border-green-500 shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-gray-900 text-sm">{facility.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${CATEGORY_COLORS[facility.type]}`}>
                  {CATEGORY_LABEL[facility.type]}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {facility.address}
              </div>
              {facility.hours && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {facility.hours}
                </div>
              )}
              {facility.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  {facility.phone}
                </div>
              )}
              {/* Capacity indicator */}
              {(() => {
                const status = getCapacityStatus(facility.capacityPercent);
                const style = CAPACITY_STYLES[status];
                return (
                  <div className={`rounded-lg border px-2 py-1.5 ${style.bg}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                      <span className={`text-xs ${style.text}`}>{facility.capacityPercent}% full</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${style.bar}`}
                        style={{ width: `${facility.capacityPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(facility.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1 w-fit"
              >
                <Navigation className="w-3 h-3" /> Get Directions
              </a>
            </button>
          ))}
          {facilities.length === 0 && (
            <div className="text-center text-gray-500 py-8 text-sm">
              No facilities found. Try a different category.
            </div>
          )}
        </div>

        {/* Live OpenStreetMap */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[540px]">
          <FacilityMap
            facilities={facilities}
            selected={selectedFacility}
            onSelect={setSelectedFacility}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => router.push("/tax")}
          className="flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-800 transition-colors"
        >
          Generate Tax Docs <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

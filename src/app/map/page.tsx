"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Clock, ArrowRight, Navigation } from "lucide-react";
import { ClassificationResult, Facility, FoodCategory } from "@/types";
import { MOCK_FACILITIES } from "@/lib/mockFacilities";

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
    displayedCategories.includes(f.type)
  );

  function goToTax() {
    router.push("/tax");
  }

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
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${CATEGORY_COLORS[facility.type]}`}
                >
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

        {/* Map placeholder — replace with Google Maps in production */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[540px] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">Interactive Map</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Add a Google Maps API key in <code className="bg-white px-1 rounded">.env.local</code> to
                enable live facility routing.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm px-4">
              {facilities.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className={`flex items-center gap-2 bg-white rounded-xl px-4 py-2 text-sm shadow-sm border ${
                    selectedFacility?.id === f.id ? "border-green-400" : "border-gray-100"
                  }`}
                >
                  <span>{CATEGORY_PIN[f.type]}</span>
                  <span className="font-medium text-gray-800 truncate">{f.name}</span>
                  <span className="text-gray-400 text-xs ml-auto shrink-0">{f.address.split(",")[1]?.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={goToTax}
          className="flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-800 transition-colors"
        >
          Generate Tax Docs <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

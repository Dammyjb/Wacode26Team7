"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { FoodItem, FoodCondition, ClassificationResult } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  donation: "bg-green-100 text-green-800 border-green-200",
  biodigester: "bg-blue-100 text-blue-800 border-blue-200",
  landfill: "bg-gray-100 text-gray-700 border-gray-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  donation: "Donation",
  biodigester: "Biodigester",
  landfill: "Landfill",
};

function newItem(): FoodItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    quantity: 0,
    condition: "fresh",
    expiryDate: new Date().toISOString().split("T")[0],
    notes: "",
  };
}

export default function ClassifyPage() {
  const router = useRouter();
  const [items, setItems] = useState<FoodItem[]>([newItem()]);
  const [results, setResults] = useState<ClassificationResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateItem(id: string, field: keyof FoodItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function classify() {
    const valid = items.filter((i) => i.name.trim() && i.quantity > 0);
    if (!valid.length) {
      setError("Add at least one item with a name and quantity.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Classification failed");
      setResults(data.results);
      sessionStorage.setItem("classificationResults", JSON.stringify(data.results));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function goToMap() {
    router.push("/map");
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Classify Surplus Food</h1>
        <p className="text-gray-600 mt-1">
          Enter your end-of-day food items. Our AI will classify each one into the
          best disposal route.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="bg-gray-950 rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400">Item {idx + 1}</span>
              {items.length > 1 && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-400 mb-1 block">Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sliced bread, Cooked rice..."
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Quantity (lbs)</label>
                <input
                  type="number"
                  min={0}
                  value={item.quantity || ""}
                  onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Condition</label>
                <select
                  value={item.condition}
                  onChange={(e) => updateItem(item.id, "condition", e.target.value as FoodCondition)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="fresh">Fresh</option>
                  <option value="near-expiry">Near Expiry</option>
                  <option value="spoiled">Spoiled</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Expiry Date</label>
                <input
                  type="date"
                  value={item.expiryDate}
                  onChange={(e) => updateItem(item.id, "expiryDate", e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1 block">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Opened package, mixed items..."
                  value={item.notes || ""}
                  onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setItems((prev) => [...prev, newItem()])}
          className="flex items-center gap-2 text-green-700 font-medium text-sm hover:text-green-900 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" /> Add another item
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={classify}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-gray-950 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Classifying...
          </>
        ) : (
          "Classify Items"
        )}
      </button>

      {results && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">Results</h2>
          {results.map((r) => (
            <div
              key={r.item.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{r.item.name}</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${CATEGORY_COLORS[r.category]}`}
                >
                  {CATEGORY_LABELS[r.category]}
                </span>
              </div>
              <p className="text-sm text-gray-600">{r.reason}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>Confidence: {r.confidence}%</span>
                <span>{r.item.quantity} lbs</span>
                {r.estimatedValue ? (
                  <span className="text-green-700 font-medium">
                    Est. value: ${r.estimatedValue}
                  </span>
                ) : null}
              </div>
            </div>
          ))}

          <button
            onClick={goToMap}
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors mt-2"
          >
            Find Nearby Facilities <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

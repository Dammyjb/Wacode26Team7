"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowRight, Camera, X, Sparkles } from "lucide-react";
import { FoodItem, FoodCondition, ClassificationResult } from "@/types";
import StepBar from "@/components/StepBar";
import { recordSession } from "@/lib/impact";

const DEMO_ITEMS: FoodItem[] = [
  {
    id: crypto.randomUUID(),
    name: "Sliced whole wheat bread",
    quantity: 25,
    condition: "near-expiry",
    expiryDate: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0],
    notes: "12 loaves, bakery surplus",
  },
  {
    id: crypto.randomUUID(),
    name: "Fresh apples",
    quantity: 40,
    condition: "fresh",
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    notes: "Bruised but edible",
  },
  {
    id: crypto.randomUUID(),
    name: "Cooked rice (spoiled)",
    quantity: 15,
    condition: "spoiled",
    expiryDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    notes: "Left unrefrigerated overnight",
  },
  {
    id: crypto.randomUUID(),
    name: "Mixed plastic packaging",
    quantity: 5,
    condition: "spoiled",
    expiryDate: new Date().toISOString().split("T")[0],
    notes: "Food-contaminated plastic wrap",
  },
];

const CATEGORY_CONFIG = {
  donation:    { label: "Donation",    icon: "🍽️", bg: "bg-green-50",  border: "border-green-300", badge: "bg-green-100 text-green-800 border-green-300", bar: "bg-green-500", accent: "border-l-green-500"  },
  biodigester: { label: "Biodigester", icon: "♻️", bg: "bg-blue-50",   border: "border-blue-300",  badge: "bg-blue-100 text-blue-800 border-blue-300",   bar: "bg-blue-500",  accent: "border-l-blue-500"   },
  landfill:    { label: "Landfill",    icon: "🗑️", bg: "bg-gray-50",   border: "border-gray-300",  badge: "bg-gray-100 text-gray-700 border-gray-300",   bar: "bg-gray-400",  accent: "border-l-gray-400"   },
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
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateItem(id: string, field: keyof FoodItem, value: string | number) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleImageCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setScanning(true);
    setError(null);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setItems((prev) => {
        const hasEmpty = prev.length === 1 && !prev[0].name && !prev[0].quantity;
        return hasEmpty ? data.items : [...prev, ...data.items];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to scan image");
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function classify() {
    const valid = items.filter((i) => i.name.trim() && i.quantity > 0);
    if (!valid.length) { setError("Add at least one item with a name and quantity."); return; }
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
      recordSession(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const totalLbs = results ? results.reduce((s, r) => s + r.item.quantity, 0) : 0;
  const totalValue = results ? results.reduce((s, r) => s + (r.estimatedValue ?? 0), 0) : 0;
  const donationCount = results ? results.filter(r => r.category === "donation").length : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <StepBar current={1} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classify Surplus Food</h1>
          <p className="text-gray-500 mt-1">AI routes each item to donation, biodigester, or landfill.</p>
        </div>
        <button
          onClick={() => { setItems(DEMO_ITEMS.map(i => ({ ...i, id: crypto.randomUUID() }))); setResults(null); setError(null); setPreviewUrl(null); }}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-purple-700 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-full transition-colors mt-1"
        >
          <Sparkles className="w-3.5 h-3.5" /> Load Demo Data
        </button>
      </div>

      {/* Input area */}
      <div className="bg-gray-950 rounded-2xl overflow-hidden">
        {/* Camera strip */}
        <div className="p-5 border-b border-gray-800">
          {previewUrl && (
            <div className="relative mb-3">
              <img src={previewUrl} alt="Captured food" className="w-full max-h-48 object-cover rounded-xl" />
              <button onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold transition-colors"
          >
            {scanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing image...</> : <><Camera className="w-5 h-5" /> Scan with Camera</>}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">Opens your camera on mobile — AI detects food items automatically</p>
        </div>

        {/* Manual items */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Items to classify</p>

          {items.map((item, idx) => (
            <div key={item.id} className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Item {idx + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input type="text" placeholder="Food name (e.g. Sliced bread)" value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <input type="number" min={0} placeholder="Qty (lbs)" value={item.quantity || ""}
                    onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <select value={item.condition} onChange={(e) => updateItem(item.id, "condition", e.target.value as FoodCondition)}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="fresh">Fresh</option>
                    <option value="near-expiry">Near Expiry</option>
                    <option value="spoiled">Spoiled</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="date" value={item.expiryDate}
                    onChange={(e) => updateItem(item.id, "expiryDate", e.target.value)}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <input type="text" placeholder="Notes (optional)" value={item.notes || ""}
                    onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setItems((prev) => [...prev, newItem()])}
            className="flex items-center gap-2 text-green-400 hover:text-green-300 font-medium text-sm transition-colors w-fit">
            <Plus className="w-4 h-4" /> Add another item
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button onClick={classify} disabled={loading}
        className="flex items-center justify-center gap-2 bg-gray-950 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors text-base">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Classifying...</> : "Classify Items →"}
      </button>

      {/* Results */}
      {results && (
        <div className="flex flex-col gap-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Items</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{donationCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">For Donation</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">${totalValue}</p>
              <p className="text-xs text-gray-500 mt-0.5">Est. Tax Value</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">Classification Results</h2>

          {results.map((r) => {
            const cfg = CATEGORY_CONFIG[r.category];
            return (
              <div key={r.item.id} className={`bg-white rounded-2xl border-l-4 border border-gray-200 p-5 flex gap-4 ${cfg.accent}`}>
                <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center text-2xl shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{r.item.name}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{r.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span>{r.item.quantity} lbs</span>
                    {r.estimatedValue ? <span className="text-green-700 font-semibold">Est. ${r.estimatedValue} value</span> : null}
                  </div>
                  {/* Confidence bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${cfg.bar}`} style={{ width: `${r.confidence}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{r.confidence}% confident</span>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={() => router.push("/map")}
            className="flex items-center justify-center gap-2 bg-gray-950 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors mt-2">
            Find Nearby Facilities <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const features = [
  {
    href: "/classify",
    label: "Classify Food",
    description: "AI-powered routing for your surplus food items",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  },
  {
    href: "/map",
    label: "Find Facilities",
    description: "Locate nearby food banks, biodigesters & drop-off points",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
  },
  {
    href: "/tax",
    label: "Tax Docs",
    description: "Auto-generate IRS Form 8283 for your donations",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  },
];

const stats = [
  { value: "80M", label: "tons of food wasted annually in the US" },
  { value: "$1.3T", label: "global food waste economic cost per year" },
  { value: "8%", label: "of global greenhouse gas emissions from food waste" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-6xl mx-auto px-4 text-center py-20 flex flex-col items-center gap-6">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          FoodWise
        </h1>
        <p className="text-xl text-gray-500 max-w-xl">
          Recycling food waste — one user at a time.
        </p>
        <Link
          href="/classify"
          className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-gray-800 transition-colors"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Feature image cards */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] block shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={f.image}
                alt={f.label}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="text-white font-bold text-xl">{f.label}</span>
                <span className="text-gray-300 text-sm mt-1">{f.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats — full bleed dark section */}
      <section className="w-screen bg-gray-950 py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {stats.map((s) => (
            <div key={s.value}>
              <p className="text-4xl font-bold text-green-400">{s.value}</p>
              <p className="text-gray-400 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

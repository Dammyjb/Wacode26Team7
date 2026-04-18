"use client";

import Link from "next/link";
import { Leaf, MapPin, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-12">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-green-100 p-4 rounded-full">
          <Leaf className="w-12 h-12 text-green-700" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900">FoodWise</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Turn food surplus into impact. Classify end-of-day food, route it to
          the right facility, and generate tax documentation — all in one place.
        </p>
        <Link
          href="/classify"
          className="mt-4 flex items-center gap-2 bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-800 transition-colors"
        >
          Try the Demo <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
          <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <Leaf className="w-5 h-5 text-green-700" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">AI Classification</h3>
          <p className="text-gray-600 text-sm">
            Input your surplus food items and get instant AI-powered routing to
            donation, biodigester, or landfill.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
          <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Live Facility Map</h3>
          <p className="text-gray-600 text-sm">
            See the nearest food banks, biodigester facilities, and approved
            drop-off points on an interactive map.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
          <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-purple-700" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Tax Documentation</h3>
          <p className="text-gray-600 text-sm">
            Auto-generate IRS Form 8283 pre-filled with your donation data.
            Download and file in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-12 text-center">
        <div>
          <p className="text-4xl font-bold text-green-700">80M</p>
          <p className="text-gray-600 text-sm mt-1">tons of food wasted annually in the US</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-green-700">$1.3T</p>
          <p className="text-gray-600 text-sm mt-1">global food waste economic cost per year</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-green-700">8%</p>
          <p className="text-gray-600 text-sm mt-1">of global greenhouse gas emissions from food waste</p>
        </div>
      </div>
    </div>
  );
}

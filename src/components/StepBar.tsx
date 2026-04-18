"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const STEPS = [
  { href: "/classify", label: "Classify Food", num: 1 },
  { href: "/map",      label: "Find Facilities", num: 2 },
  { href: "/tax",      label: "Tax Docs",  num: 3 },
];

export default function StepBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.href} className="flex items-center flex-1 last:flex-none">
            <Link
              href={step.href}
              className="flex items-center gap-2.5 group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                done    ? "bg-green-600 text-white" :
                active  ? "bg-gray-950 text-white" :
                          "bg-gray-200 text-gray-400"
              }`}>
                {done ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-sm font-semibold hidden sm:block transition-colors ${
                active ? "text-gray-900" : done ? "text-green-700" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </Link>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded-full ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";

const steps = [
  { href: "/classify", label: "1. Classify Food" },
  { href: "/map", label: "2. Find Facilities" },
  { href: "/tax", label: "3. Tax Docs" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
          <Leaf className="w-5 h-5" />
          FoodWise
        </Link>
        <div className="flex items-center gap-1">
          {steps.map((step) => {
            const active = pathname === step.href;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-700 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {step.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

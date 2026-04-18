"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

const steps = [
  { href: "/classify", label: "Classify Food" },
  { href: "/map", label: "Find Facilities" },
  { href: "/tax", label: "Tax Docs" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <Leaf className="w-5 h-5 text-green-400" />
          FoodWise
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {steps.map((step) => {
            const active = pathname === step.href;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {step.label}
              </Link>
            );
          })}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 flex flex-col gap-2">
          {steps.map((step) => {
            const active = pathname === step.href;
            return (
              <Link
                key={step.href}
                href={step.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {step.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

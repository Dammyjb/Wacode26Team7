"use client";

import { useEffect, useState } from "react";
import { FileText, Download, CheckCircle, Loader2, Lock, LogOut } from "lucide-react";
import { ClassificationResult } from "@/types";
import { isLoggedIn, login, logout, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth";
import StepBar from "@/components/StepBar";

interface DonorInfo {
  donorName: string;
  donorAddress: string;
  donorEIN: string;
  recipientName: string;
  recipientAddress: string;
}

export default function TaxPage() {
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    donorName: "",
    donorAddress: "",
    donorEIN: "",
    recipientName: "City Food Bank",
    recipientAddress: "123 Main St, Houston, TX 77001",
  });
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Auth state
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showCreds, setShowCreds] = useState(false);

  useEffect(() => {
    setAuthed(isLoggedIn());
    const stored = sessionStorage.getItem("classificationResults");
    if (stored) setResults(JSON.parse(stored));
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (login(email, password)) {
      setAuthed(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Use the demo account below.");
    }
  }

  function handleLogout() {
    logout();
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto mt-16 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="bg-gray-950 p-4 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to access Tax Docs</h1>
          <p className="text-gray-500 text-sm">Tax documentation contains sensitive financial data and requires authentication.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          {loginError && (
            <p className="text-red-600 text-xs">{loginError}</p>
          )}
          <button
            type="submit"
            className="bg-gray-950 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={() => setShowCreds((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center w-full"
        >
          {showCreds ? "Hide" : "Show"} demo credentials
        </button>

        {showCreds && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700">
            <p className="font-semibold mb-1 text-gray-900">Demo credentials</p>
            <p>Email: <span className="font-mono text-gray-600">{DEMO_EMAIL}</span></p>
            <p>Password: <span className="font-mono text-gray-600">{DEMO_PASSWORD}</span></p>
          </div>
        )}
      </div>
    );
  }

  const donations = results.filter((r) => r.category === "donation");
  const totalLbs = donations.reduce((sum, r) => sum + r.item.quantity, 0);
  const totalFMV = donations.reduce((sum, r) => sum + (r.estimatedValue ?? 0), 0);

  async function generatePDF() {
    setGenerating(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const page = doc.addPage([612, 792]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);

      const { height } = page.getSize();
      let y = height - 60;

      const draw = (text: string, x: number, size = 10, isBold = false) => {
        page.drawText(text, { x, y, size, font: isBold ? bold : font, color: rgb(0, 0, 0) });
      };

      draw("IRS Form 8283 — Noncash Charitable Contributions (Demo)", 50, 14, true);
      y -= 10;
      page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      y -= 24;

      draw("SECTION A — Donor Information", 50, 11, true);
      y -= 18;
      draw(`Donor Name: ${donorInfo.donorName || "—"}`, 50);
      y -= 14;
      draw(`Donor Address: ${donorInfo.donorAddress || "—"}`, 50);
      y -= 14;
      draw(`Employer Identification Number (EIN): ${donorInfo.donorEIN || "—"}`, 50);
      y -= 24;

      draw("SECTION B — Recipient Organization", 50, 11, true);
      y -= 18;
      draw(`Recipient Name: ${donorInfo.recipientName}`, 50);
      y -= 14;
      draw(`Recipient Address: ${donorInfo.recipientAddress}`, 50);
      y -= 24;

      draw("SECTION C — Donated Food Items", 50, 11, true);
      y -= 18;

      const headers = ["Description", "Condition", "Qty (lbs)", "Est. FMV ($)"];
      const colX = [50, 230, 360, 460];
      headers.forEach((h, i) => draw(h, colX[i], 9, true));
      y -= 4;
      page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 14;

      donations.forEach((r) => {
        draw(r.item.name.slice(0, 28), colX[0], 9);
        draw(r.item.condition, colX[1], 9);
        draw(`${r.item.quantity}`, colX[2], 9);
        draw(`$${(r.estimatedValue ?? 0).toFixed(2)}`, colX[3], 9);
        y -= 14;
      });

      y -= 6;
      page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 18;
      draw(`Total Weight: ${totalLbs} lbs`, 50, 10, true);
      y -= 14;
      draw(`Total Estimated Fair Market Value: $${totalFMV.toFixed(2)}`, 50, 10, true);
      y -= 24;
      draw(`Date of Donation: ${new Date().toLocaleDateString()}`, 50);
      y -= 30;

      draw("Certification", 50, 11, true);
      y -= 18;
      draw(
        "Under penalties of perjury, I declare that I have examined this return, including accompanying schedules",
        50,
        8
      );
      y -= 12;
      draw(
        "and statements, and to the best of my knowledge and belief, it is true, correct, and complete.",
        50,
        8
      );
      y -= 30;
      draw("Donor Signature: ___________________________   Date: ___________", 50, 9);
      y -= 20;
      draw("* This is a demo document generated by FoodWise. Consult a tax professional before filing.", 50, 8);

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FoodWise_Form8283_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
      <StepBar current={3} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Documentation</h1>
          <p className="text-gray-500 mt-1">
            Auto-generate a pre-filled IRS Form 8283 for your food donations. Download and file
            in seconds.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors shrink-0 mt-1"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      {donations.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 text-sm">
          No items were classified as donations. Go back and classify food items to generate tax docs.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900">Donation Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">{donations.length}</p>
                <p className="text-xs text-gray-500 mt-1">Items Donated</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">{totalLbs}</p>
                <p className="text-xs text-gray-500 mt-1">Total lbs</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">${totalFMV.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-1">Est. Fair Market Value</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {donations.map((r) => (
                <div key={r.item.id} className="flex items-center justify-between text-sm text-gray-700 border-b border-gray-100 pb-2">
                  <span>{r.item.name}</span>
                  <span className="text-gray-500">{r.item.quantity} lbs · ${(r.estimatedValue ?? 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900">Organization Details</h2>
            <div className="grid grid-cols-1 gap-4">
              {(
                [
                  { key: "donorName", label: "Your Organization Name", placeholder: "e.g. Fresh Market Inc." },
                  { key: "donorAddress", label: "Your Address", placeholder: "123 Commerce St, Houston, TX 77001" },
                  { key: "donorEIN", label: "EIN (Employer ID Number)", placeholder: "XX-XXXXXXX" },
                  { key: "recipientName", label: "Recipient Organization", placeholder: "City Food Bank" },
                  { key: "recipientAddress", label: "Recipient Address", placeholder: "456 Hope Ave, Houston, TX" },
                ] as { key: keyof DonorInfo; label: string; placeholder: string }[]
              ).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={donorInfo[key]}
                    onChange={(e) => setDonorInfo((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={generatePDF}
              disabled={generating}
              className="flex items-center justify-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-800 disabled:opacity-60 transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Form 8283
                </>
              )}
            </button>

            {generated && (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium justify-center">
                <CheckCircle className="w-4 h-4" />
                PDF downloaded successfully! Consult a tax professional before filing.
              </div>
            )}

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" />
              Demo document — not a substitute for professional tax advice.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

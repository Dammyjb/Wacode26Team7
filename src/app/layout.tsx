import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Allofood — Smart Food Allocation",
  description:
    "Helping food businesses allocate surplus food smarter. Classify, route to the right facility, and generate tax documentation — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <NavBar />
        <main className="overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}

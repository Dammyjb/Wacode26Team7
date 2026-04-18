import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { FoodItem } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function mockScan(): FoodItem[] {
  const today = new Date();
  const threeDays = new Date(today);
  threeDays.setDate(today.getDate() + 3);
  const week = new Date(today);
  week.setDate(today.getDate() + 7);

  return [
    {
      id: crypto.randomUUID(),
      name: "Bread loaves",
      quantity: 10,
      condition: "near-expiry",
      expiryDate: threeDays.toISOString().split("T")[0],
      notes: "Detected from image",
    },
    {
      id: crypto.randomUUID(),
      name: "Canned vegetables",
      quantity: 20,
      condition: "fresh",
      expiryDate: week.toISOString().split("T")[0],
      notes: "Detected from image",
    },
    {
      id: crypto.randomUUID(),
      name: "Fresh produce",
      quantity: 15,
      condition: "fresh",
      expiryDate: threeDays.toISOString().split("T")[0],
      notes: "Detected from image",
    },
  ];
}

export async function POST(req: NextRequest) {
  let imageBase64 = "";
  let mediaType = "image/jpeg";

  try {
    const body = await req.json();
    imageBase64 = body?.image ?? "";
    mediaType = body?.mediaType ?? "image/jpeg";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ items: mockScan(), demo: true });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are a food inventory assistant. Analyze this image and identify all food items visible.

For each food item, estimate:
- name: descriptive name of the item
- quantity: estimated quantity in lbs (use your best judgment from visual size/count)
- condition: "fresh", "near-expiry", or "spoiled" based on visual appearance
- notes: any relevant observation (e.g. "opened package", "multiple units")

Today's date is ${new Date().toISOString().split("T")[0]}. Set expiryDate to a reasonable estimate based on condition:
- fresh: 7 days from today
- near-expiry: 2 days from today
- spoiled: today's date

Return ONLY a valid JSON array, no markdown:
[{"name":"...","quantity":10,"condition":"fresh","expiryDate":"YYYY-MM-DD","notes":"..."}]

If no food is visible, return an empty array: []`,
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "[]";

    let parsed: Array<{ name: string; quantity: number; condition: string; expiryDate: string; notes?: string }>;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ items: mockScan(), demo: true });
    }

    const items: FoodItem[] = parsed.map((p) => ({
      id: crypto.randomUUID(),
      name: p.name,
      quantity: p.quantity,
      condition: (p.condition as FoodItem["condition"]) ?? "fresh",
      expiryDate: p.expiryDate ?? new Date().toISOString().split("T")[0],
      notes: p.notes ?? "Detected from image",
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: mockScan(), demo: true });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { FoodItem, ClassificationResult, FoodCategory } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function mockClassify(items: FoodItem[]): ClassificationResult[] {
  return items.map((item) => {
    const name = item.name.toLowerCase();
    const spoiled = item.condition === "spoiled";
    const nearExpiry = item.condition === "near-expiry";

    let category: FoodCategory;
    let reason: string;
    let estimatedValue = 0;
    let confidence: number;

    if (name.includes("plastic") || name.includes("packaging")) {
      category = "landfill";
      reason = "Non-organic material cannot be donated or biodigested.";
      confidence = 95;
    } else if (spoiled) {
      category = "biodigester";
      reason = "Spoiled organic food is ideal for anaerobic digestion to produce energy and compost.";
      confidence = 88;
    } else if (nearExpiry) {
      category = "donation";
      reason = "Near-expiry food is still safe for human consumption and should be donated before it spoils.";
      estimatedValue = Math.round(item.quantity * 1.5);
      confidence = 82;
    } else {
      category = "donation";
      reason = "Fresh food in good condition is suitable for donation to food banks and community pantries.";
      estimatedValue = Math.round(item.quantity * 2.5);
      confidence = 94;
    }

    return { item, category, confidence, reason, estimatedValue };
  });
}

export async function POST(req: NextRequest) {
  let items: FoodItem[] = [];

  try {
    const body = await req.json();
    items = body?.items ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!items.length) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  // No API key — use mock
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ results: mockClassify(items), demo: true });
  }

  try {
    const itemList = items
      .map(
        (item, i) =>
          `${i + 1}. Name: ${item.name}, Quantity: ${item.quantity} lbs, Condition: ${item.condition}, Expires: ${item.expiryDate}${item.notes ? `, Notes: ${item.notes}` : ""}`
      )
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a food waste classification expert helping food supply chains reduce environmental impact.

Classify each food item below into exactly one of: "donation", "biodigester", or "landfill".

Rules:
- "donation": Food is still safe for human consumption (fresh or near-expiry but not spoiled). Edible, packaged, or minimally processed.
- "biodigester": Food is spoiled or inedible but organic and suitable for anaerobic digestion to produce energy/compost. No plastic, bones, or non-organics.
- "landfill": Only if the item cannot be donated or biodigested (contaminated, non-organic waste, mixed materials).

For each item, also estimate fair market value in USD (only for donations, else 0), confidence (0-100), and a 1-sentence reason.

Return ONLY valid JSON array, no markdown:
[{"id":"<id>","category":"donation|biodigester|landfill","confidence":85,"reason":"...","estimatedValue":50}]

Items:
${itemList}

Item IDs: ${items.map((i) => i.id).join(", ")}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: Array<{
      id: string;
      category: FoodCategory;
      confidence: number;
      reason: string;
      estimatedValue?: number;
    }>;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: text },
        { status: 500 }
      );
    }

    const results: ClassificationResult[] = items.map((item) => {
      const match = parsed.find((p) => p.id === item.id);
      return {
        item,
        category: match?.category ?? "landfill",
        confidence: match?.confidence ?? 50,
        reason: match?.reason ?? "Could not classify",
        estimatedValue: match?.estimatedValue ?? 0,
      };
    });

    return NextResponse.json({ results });
  } catch {
    // Any API failure (credits, network, etc.) — fall back to mock
    return NextResponse.json({ results: mockClassify(items), demo: true });
  }
}

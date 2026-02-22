import * as functions from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import Anthropic from "@anthropic-ai/sdk";
import * as admin from "firebase-admin";

admin.initializeApp();

const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

// ─── Types ────────────────────────────────────────────────────────────────────

interface TourRecommendationRequest {
  query: string;        // e.g. "Traditional palaces near Gyeongbokgung"
  category?: string;   // e.g. "history", "food", "nature", "shopping"
  location?: string;   // e.g. "Jongno-gu"
}

interface TourPlace {
  name: string;
  description: string;
  category: string;
  tips: string;
  address?: string;
}

interface TourRecommendationResponse {
  places: TourPlace[];
  summary: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPrompt(req: TourRecommendationRequest): string {
  const categoryHint = req.category ? ` Focus on ${req.category} spots.` : "";
  const locationHint = req.location ? ` Near or in ${req.location}.` : "";

  return `You are a Seoul travel expert. A tourist is asking about places to visit in Seoul.

Query: "${req.query}"${categoryHint}${locationHint}

Respond ONLY with a valid JSON object in this exact shape:
{
  "places": [
    {
      "name": "Place name in English (Korean name)",
      "description": "2-3 sentence description",
      "category": "one of: history | food | nature | shopping | culture | entertainment",
      "tips": "1-2 practical visitor tips",
      "address": "district or neighborhood"
    }
  ],
  "summary": "A 1-2 sentence overview of these recommendations"
}

Return 3-5 places. Do not include any text outside the JSON.`;
}

function parseClaudeResponse(text: string): TourRecommendationResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");
  return JSON.parse(jsonMatch[0]) as TourRecommendationResponse;
}

// ─── Cloud Function ───────────────────────────────────────────────────────────

export const getTourRecommendations = functions.onRequest(
  {
    secrets: [anthropicApiKey],
    cors: true,
    region: "us-central1",
  },
  async (req, res) => {
    // Only allow POST
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = req.body as TourRecommendationRequest;

    if (!body.query || typeof body.query !== "string") {
      res.status(400).json({ error: "Missing required field: query" });
      return;
    }

    try {
      const client = new Anthropic({ apiKey: anthropicApiKey.value() });

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: buildPrompt(body),
          },
        ],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      const result = parseClaudeResponse(textBlock.text);
      res.status(200).json(result);
    } catch (err) {
      console.error("Error calling Claude API:", err);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  }
);

import Anthropic from "@anthropic-ai/sdk";

interface Env {
  ANTHROPIC_API_KEY: string;
}

interface TourRecommendationRequest {
  query: string;
  category?: string;
  location?: string;
}

interface TourPlace {
  name: string;
  description: string;
  category: string;
  tips: string;
  address?: string;
  lat: number;
  lng: number;
}

interface TourRecommendationResponse {
  places: TourPlace[];
  summary: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

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
      "address": "district or neighborhood",
      "lat": 37.5796,
      "lng": 126.9770
    }
  ],
  "summary": "A 1-2 sentence overview of these recommendations"
}

Return 3-5 places. Use accurate GPS coordinates for each place in Seoul. Do not include any text outside the JSON.`;
}

function parseClaudeResponse(text: string): TourRecommendationResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");
  return JSON.parse(jsonMatch[0]) as TourRecommendationResponse;
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: "ANTHROPIC_API_KEY is not set" }, 500);
  }

  let body: TourRecommendationRequest;
  try {
    body = await request.json() as TourRecommendationRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body.query || typeof body.query !== "string") {
    return jsonResponse({ error: "Missing required field: query" }, 400);
  }

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(body) }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    const result = parseClaudeResponse(textBlock.text);
    return jsonResponse(result);
  } catch (err) {
    console.error("Error calling Claude API:", err);
    return jsonResponse({ error: "Failed to get recommendations" }, 500);
  }
};

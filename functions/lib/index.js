"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTourRecommendations = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildPrompt(req) {
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
function parseClaudeResponse(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
        throw new Error("No JSON found in Claude response");
    return JSON.parse(jsonMatch[0]);
}
// ─── Cloud Function ───────────────────────────────────────────────────────────
exports.getTourRecommendations = functions.onRequest({
    cors: true,
    region: "us-central1",
}, async (req, res) => {
    // Only allow POST
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const body = req.body;
    if (!body.query || typeof body.query !== "string") {
        res.status(400).json({ error: "Missing required field: query" });
        return;
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: "ANTHROPIC_API_KEY is not set" });
        return;
    }
    try {
        const client = new sdk_1.default({ apiKey });
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
    }
    catch (err) {
        console.error("Error calling Claude API:", err);
        res.status(500).json({ error: "Failed to get recommendations" });
    }
});
//# sourceMappingURL=index.js.map
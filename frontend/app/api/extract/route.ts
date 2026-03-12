import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const EXTRACT_PROMPT = `You are an expert opportunity parser for Indian college students. Extract details from this student opportunity message and return ONLY valid JSON with absolutely no extra text, no markdown, no backticks.

Rules:
- If its a government job, set type to "Job"
- company should be the organization name
- role should be the position/post name 
- branch_eligible should be relevant branches or "All"
- If deadline is mentioned, convert to YYYY-MM-DD format
- If no stipend/salary mentioned, use "Not mentioned"
- Extract any apply link/URL from the message

Return EXACTLY this JSON structure:
{"company":"org name","role":"position","type":"Internship","branch_eligible":"All","cgpa_required":null,"deadline":null,"location":"Remote","stipend":"Not mentioned","apply_link":null}

Message to parse:
`;

function calculateUrgency(deadlineStr: string | null): { days_left: number; urgency: string } {
  if (!deadlineStr) return { days_left: 99, urgency: "green" };
  try {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { days_left: 0, urgency: "red" };
    if (days <= 3) return { days_left: days, urgency: "red" };
    if (days <= 7) return { days_left: days, urgency: "yellow" };
    return { days_left: days, urgency: "green" };
  } catch {
    return { days_left: 99, urgency: "green" };
  }
}

function cleanAndParseJSON(raw: string): Record<string, unknown> {
  // Strip markdown code fences
  raw = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // Try to find JSON object in the response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(raw);
}

async function extractWithGroq(text: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");
  
  const groq = new Groq({ apiKey });
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a JSON-only response bot. Return only valid JSON, no other text." },
      { role: "user", content: EXTRACT_PROMPT + text }
    ],
    max_tokens: 500,
    temperature: 0.1,
  });
  const raw = response.choices[0]?.message?.content?.trim() || "";
  console.log("[Groq] Raw response:", raw.substring(0, 200));
  return cleanAndParseJSON(raw);
}

async function extractWithGemini(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: EXTRACT_PROMPT + text }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("[Gemini] HTTP error:", res.status, errText.substring(0, 200));
    throw new Error(`Gemini API returned ${res.status}`);
  }
  
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  console.log("[Gemini] Raw response:", raw.substring(0, 200));
  return cleanAndParseJSON(raw);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Strip emojis and special unicode for cleaner AI parsing
    const cleanText = text.replace(/[^\x00-\x7F]/g, " ").replace(/\s+/g, " ").trim();

    let result;
    let groqError = "";
    let geminiError = "";

    // Try Groq first, fallback to Gemini
    try {
      result = await extractWithGroq(cleanText);
    } catch (e1) {
      groqError = String(e1);
      console.error("[Extract] Groq failed:", groqError);
      try {
        result = await extractWithGemini(cleanText);
      } catch (e2) {
        geminiError = String(e2);
        console.error("[Extract] Gemini also failed:", geminiError);
        return NextResponse.json(
          { error: `Both AI providers failed. Groq: ${groqError}. Gemini: ${geminiError}` },
          { status: 500 }
        );
      }
    }

    const { days_left, urgency } = calculateUrgency(result.deadline as string || null);
    result.days_left = days_left;
    result.urgency = urgency;
    result.raw_text = text;

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Extract] Unexpected error:", err);
    return NextResponse.json(
      { error: `Server error: ${String(err)}` },
      { status: 500 }
    );
  }
}

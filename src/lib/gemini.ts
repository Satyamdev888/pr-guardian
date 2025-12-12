// src/lib/gemini.ts

export async function analyzePR(diff: string, comments: string[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing");
    return null;
  }

  // 👇 CHANGED: Using "gemini-2.5-flash" because your account has it!
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    You are an expert Senior Software Engineer reviewing a Pull Request.
    
    Here is the diff snippet:
    ${diff.substring(0, 5000)}
    
    Here are the AI comments:
    ${comments.join("\n")}
    
    Your Task:
    1. Analyze the quality.
    2. Assign a score (0-100).
    3. Summarize key issues (2-3 bullets).
    
    Return ONLY valid JSON:
    {
      "score": 85,
      "summary": "Key issues include...",
      "suggestions": ["Fix the any type", "Remove console logs"]
    }
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      console.error(`Gemini API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(errorText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Clean up markdown if present
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
}
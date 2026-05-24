export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an emoji expert. Given a feeling, mood, or description, suggest TWO emoji unicode codes (without 'U+' prefix, just hex like '1f60a') that would create a fun mashup. Return ONLY a JSON object like: {"code1":"1f60a","code2":"1f602"}. No explanation, no markdown, just raw JSON.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const cleaned = content.replace(/```json|```/g, "").trim();
    const emojiData = JSON.parse(cleaned);

    if (!emojiData.code1 || !emojiData.code2) {
      throw new Error("Invalid response format from AI");
    }

    return res.status(200).json({
      code1: emojiData.code1,
      code2: emojiData.code2
    });

  } catch (error) {
    console.error("AI Generator Error:", error.message);
    return res.status(500).json({
      error: "AI generation failed",
      detail: error.message
    });
  }
}
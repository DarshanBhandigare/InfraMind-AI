const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD8rG0h3jbC0K0obTg8DW7xgjojL_-QoqE";
const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash"];

const normalizeVerificationResult = (payload, modelName) => ({
  status: payload?.status === "TRUE" || payload?.status === "FAKE" ? payload.status : "ERROR",
  score: Number.isFinite(Number(payload?.score)) ? Number(payload.score) : 0,
  anomalies: Array.isArray(payload?.anomalies) && payload.anomalies.length ? payload.anomalies : ["NO_DETAILS_RETURNED"],
  breakdown: payload?.breakdown || "The AI service did not return a usable explanation.",
  model: modelName
});

const parseVerificationPayload = (text, modelName) => {
  const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
  return normalizeVerificationResult(JSON.parse(jsonStr), modelName);
};

const extractResponseText = (result) => {
  const candidate = result?.candidates?.[0];
  const textPart = candidate?.content?.parts?.find((part) => typeof part?.text === "string");

  if (textPart?.text) {
    return textPart.text;
  }

  if (candidate?.finishReason === "SAFETY") {
    throw new Error("The Gemini API blocked this image analysis because of a safety restriction.");
  }

  throw new Error("The Gemini API returned an empty response.");
};

const buildPrompt = (reportType) => `
You are an automated infrastructure inspector for a municipal government.
Analyze this image which was submitted as part of a ${reportType || "public infrastructure"} report.

Tasks:
1. Determine if the image is a "TRUE" original photo of an actual infrastructure issue or a "FAKE/PLACEHOLDER" such as a poster, UI screenshot, stock art, or unrelated content.
2. Provide a "Veracity Score" from 0-100 where 100 means definitely real and relevant.
3. Identify any "Technical Anomalies" such as AI artifacts, watermarks, poster text, collage layouts, screenshots, or location mismatches.
4. Give a brief "Technical Breakdown" of what you see in the image.

Return only valid JSON in this exact shape:
{
  "status": "TRUE" | "FAKE",
  "score": number,
  "anomalies": string[],
  "breakdown": string
}
`;

const callGeminiModel = async ({ modelName, base64Data, mimeType, prompt }) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = result?.error?.message || `Gemini API request failed with status ${response.status}`;
    throw new Error(message);
  }

  const text = extractResponseText(result);
  return parseVerificationPayload(text, modelName);
};

export const verifyImageAuthenticity = async (imageUrl, reportType) => {
  if (!imageUrl) {
    return { status: "ERROR", message: "No image provided" };
  }

  if (!API_KEY) {
    return {
      status: "ERROR",
      message: "Missing Gemini API key",
      score: 0,
      anomalies: ["CONFIGURATION_MISSING"],
      breakdown: "Image verification is unavailable because no Gemini API key is configured.",
      model: null
    };
  }

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Image fetch failed with status ${imageResponse.status}`);
    }

    const blob = await imageResponse.blob();
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });

    const mimeType = blob.type || "image/jpeg";
    const prompt = buildPrompt(reportType);
    let lastError = null;

    for (const modelName of MODEL_CANDIDATES) {
      try {
        return await callGeminiModel({ modelName, base64Data, mimeType, prompt });
      } catch (error) {
        lastError = error;
        console.warn(`Gemini validation failed for ${modelName}:`, error);

        const message = error?.message || "";
        if (
          message.includes("not found") ||
          message.includes("not supported") ||
          message.includes("permission") ||
          message.includes("quota")
        ) {
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error("No Gemini models were available for validation.");
  } catch (error) {
    console.error("Gemini Verification Error:", error);
    const errorMsg = error.message || "Unknown API Error";

    return {
      status: "ERROR",
      message: errorMsg,
      score: 0,
      anomalies: ["API_HANDSHAKE_FAILURE"],
      breakdown: "Image verification is temporarily unavailable. Please check the Gemini API key, enabled Gemini API access, billing/quota status, and supported model configuration.",
      model: null
    };
  }
};

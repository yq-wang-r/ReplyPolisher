import { GoogleGenAI } from "@google/genai";
import { Persona, PERSONA_CONFIG, AppLanguage, AIProvider, ProviderConfig } from "../types";

// Default keys from env (for fallback or initial setup)
const DEFAULT_GOOGLE_KEY = process.env.API_KEY;
const DEFAULT_OPENAI_KEY = process.env.SILICONFLOW_API_KEY; // Keeping env var name for backward compatibility or rename if needed

// Default OpenAI Compatible Configuration (using SiliconFlow as the initial default)
const DEFAULT_OPENAI_URL = "https://api.siliconflow.cn/v1/chat/completions";

export const polishText = async (
  draftText: string, 
  contextText: string, 
  thoughtsText: string,
  persona: Persona,
  language: AppLanguage,
  provider: AIProvider,
  config: ProviderConfig
): Promise<string> => {
  if (!draftText.trim()) return "";

  // Prompt Construction (Shared Logic)
  const personaConfig = PERSONA_CONFIG[persona];
  
  let languageRules = "";
  if (language === AppLanguage.CHINESE) {
    languageRules = `
    - OUTPUT LANGUAGE: Simplified Chinese (简体中文).
    - STYLE RULES (Chinese):
      - Format: Native IM Chat (WeChat/DingTalk).
      - Tone: Natural, grounded (接地气).
      - PROHIBITED: "Translationese" (e.g., avoid "秉持", "致以", "deeply regret"). Avoid robotic/stiff phrasing that sounds like translated English.
      - If Persona is Advisor/Boss: Be professional but concise.
    `;
  } else {
    languageRules = `
    - OUTPUT LANGUAGE: English.
    - STYLE RULES (English):
      - Format: Native IM Chat (Slack/Teams).
      - Tone: Idiomatic, professional but not stiff.
      - PROHIBITED: Textbook English. Make it sound like a native speaker (2024 style).
    `;
  }

  const systemPrompt = `You are a sophisticated communication assistant helping a user write a reply in an IM Chat context.
  
GLOBAL RULES (MUST FOLLOW):
${languageRules}
- PROHIBITED: Do not include email headers (Subject, Dear X) or sign-offs (Sincerely) unless specifically asked. This is Instant Messaging.
- Tone Nuance: Use [Inner Thoughts] ONLY to adjust the emotional tone.
- SAFETY RULE: If [Inner Thoughts] contains negative emotions (anger, sarcasm, laziness), convert them into socially acceptable, high-EQ professional language.

ANTI-DILUTION & SLANG PROTECTION PROTOCOL:
1. Preserve the Vibe: If the user's draft is a short slang term (e.g., "好家伙", "卧槽", "牛逼", "绝了"), DO NOT explain it. DO NOT turn it into a formal sentence.
2. No "Captain Obvious": Do not state facts that are visible in the context. (Bad: "Wow, that is very crowded." -> Good: "This is ridiculous.")
3. No "HR Speak": Unless the style is explicitly "Official Announcement", NEVER use phrases like "辛苦大家克服" (thanks for overcoming), "资源吃紧" (resources are tight), or "提升效率" (improve efficiency). It sounds patronizing.
4. Reaction Rule: If User Input = Short Exclamation ("好家伙") AND Context = Negative situation -> Lean into Sarcasm or Shock. Match the shortness of the input.

TARGET PERSONA SPECIFICS:
Target: ${personaConfig.label}
Instruction: ${personaConfig.promptInstruction}
`;

  const userContent = `
INPUT DATA:
1. INCOMING MESSAGE (Context):
"${contextText.trim() || "No context provided"}"

2. USER DRAFT (Content Source - Strictly follow facts here):
"${draftText}"

3. INNER THOUGHTS (Tone Modifier - Do not output explicitly):
"${thoughtsText.trim() || "No internal thoughts provided"}"

TASK:
Write the response based on the User Draft and Context, applying the Persona and Language Rules. Return ONLY the rewritten message text.
`;

  // --- Router Logic ---

  if (provider === AIProvider.OPENAI) {
    return await callOpenAICompatible(systemPrompt, userContent, config);
  } else {
    return await callGoogleGemini(systemPrompt, userContent, config);
  }
};

// --- Google Implementation ---
async function callGoogleGemini(systemPrompt: string, userContent: string, config: ProviderConfig): Promise<string> {
  const apiKey = config.apiKey || DEFAULT_GOOGLE_KEY;
  if (!apiKey) return "Error: Google API Key is missing. Please configure it in Settings.";
  
  try {
    // Initialize specifically for this call to support dynamic keys and optional base URL
    const options: any = { apiKey };
    if (config.baseUrl && config.baseUrl.trim()) {
      options.baseUrl = config.baseUrl.trim();
    }
    
    const googleAi = new GoogleGenAI(options);
    
    const response = await googleAi.models.generateContent({
      model: config.model || 'gemini-3-flash-preview',
      contents: userContent,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text || "Could not generate response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred with Google Gemini. Check your API Key and connection.";
  }
}

// --- OpenAI Compatible Implementation (Generic) ---
async function callOpenAICompatible(systemPrompt: string, userContent: string, config: ProviderConfig): Promise<string> {
  const apiKey = config.apiKey || DEFAULT_OPENAI_KEY;
  if (!apiKey) return "Error: API Key is missing. Please configure it in Settings.";
  
  // Use configured Base URL or fallback to default
  const apiUrl = config.baseUrl || DEFAULT_OPENAI_URL;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || "deepseek-ai/DeepSeek-V3", 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        stream: false,
        temperature: 0.7, // Balance between professional consistency and natural phrasing
        max_tokens: 2048, // Ensure sufficient length for detailed replies if needed
        top_p: 0.9        // Standard sampling for quality
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Compatible API Error Raw:", errorText);
      
      let errorMessage = `Status ${response.status}`;
      try {
        // Attempt to parse standard OpenAI-style error format
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        // Fallback to raw text if parsing fails
        errorMessage = errorText.substring(0, 100) + (errorText.length > 100 ? "..." : ""); 
      }
      
      return `Error: API Request failed. ${errorMessage}. Please check your API Key, Base URL, and Model Name in settings.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Could not generate response from the provider.";
  } catch (error) {
    console.error("Network Error:", error);
    return "Network error occurred. Please check your internet connection and API URL.";
  }
}
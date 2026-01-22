
import { GoogleGenAI } from "@google/genai";
import { ReportConfig, Language, ReportTypeTranslations } from "./types";

export const generateProfessionalReport = async (config: ReportConfig, existingContent?: string, feedback?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageNames = {
    [Language.ARABIC]: "Arabic (Official High-Level)",
    [Language.SOMALI]: "Somali (Professional Administrative)",
    [Language.ENGLISH]: "English (Executive Corporate)"
  };

  const localizedType = ReportTypeTranslations[config.language][config.type];

  const systemInstruction = `You are a world-class General Secretary and Expert Report Writer with 30 years of experience.
Task: Create or refine a ${localizedType} addressed to "${config.recipient}" from "${config.senderName}".
Language: ${languageNames[config.language]}.
Style: Modern scientific reporting, highly professional, eloquent, and structured.
Guidelines:
- Include a professional header/salutation for ${config.recipient}.
- The body should be clear and divided into logical paragraphs.
- End with a formal closing and include the name "${config.senderName}" at the end as the signatory.
- For Arabic, use high-level administrative vocabulary (السيد/المحترم، نود إحاطتكم، وتفضلوا بقبول فائق الاحترام).
- DO NOT use bolding or markdown throughout the text. Use plain text with clean line breaks.`;

  let prompt = "";
  if (existingContent && feedback) {
    prompt = `Existing content:
---
${existingContent}
---
Modify based on feedback: "${feedback}".
Maintain the official signature of "${config.senderName}".`;
  } else {
    prompt = `Subject: ${config.topic}
Context: ${config.details}
Writer (Sender): ${config.senderName}
Recipient: ${config.recipient}
Document Type: ${localizedType}

Please draft the full professional document.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.65,
      }
    });

    return response.text || "حدث خطأ أثناء التوليد.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("فشل الاتصال بمحرك الذكاء الاصطناعي.");
  }
};

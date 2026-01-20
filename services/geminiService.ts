import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyMeditationResult } from "../types";

const SYSTEM_INSTRUCTION = `
당신은 성도들의 영적 성장을 돕는 따뜻하고 지혜로운 성경 교사이자 목양 가이드입니다. 
제공된 주일 설교문을 깊이 있게 분석하여, 한샘교회 성도들이 한 주간(7일) 동안 하나님의 말씀을 묵상하고 삶 속에 적용할 수 있는 질문지를 만들어주세요.
웨슬리안 전통의 따뜻한 영성을 담아주세요.

응답은 반드시 지정된 JSON 형식으로 출력하세요.
`;

export const generateMeditation = async (sermonText: string): Promise<WeeklyMeditationResult> => {
  // 빌드 시점에 주입된 API_KEY를 가져옵니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key가 설정되지 않았습니다. Vercel 설정에서 API_KEY를 확인하고 Redeploy 해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `다음은 한샘교회의 주일 설교문입니다. 이를 바탕으로 성도들을 위한 7일간의 주간 묵상집을 만들어주세요:\n\n${sermonText}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sermonTitle: { type: Type.STRING },
            mainScripture: { type: Type.STRING },
            summary: { type: Type.STRING },
            meditations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  scripture: { type: Type.STRING },
                  reflectionQuestion: { type: Type.STRING },
                  practicalAction: { type: Type.STRING },
                  prayer: { type: Type.STRING },
                },
                required: ["day", "title", "scripture", "reflectionQuestion", "practicalAction", "prayer"]
              }
            }
          },
          required: ["sermonTitle", "mainScripture", "summary", "meditations"]
        }
      },
    });

    if (!response.text) {
      throw new Error("AI로부터 응답을 받지 못했습니다.");
    }

    const result = JSON.parse(response.text);
    return result as WeeklyMeditationResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
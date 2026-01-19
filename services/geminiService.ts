
import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyMeditationResult } from "../types";

const SYSTEM_INSTRUCTION = `
당신은 성도들의 영적 성장을 돕는 따뜻하고 지혜로운 성경 교사이자 목양 가이드입니다. 
제공된 주일 설교문을 깊이 있게 분석하여, 한샘교회 성도들이 한 주간(7일) 동안 하나님의 말씀을 묵상하고 삶 속에 적용할 수 있는 질문지를 만들어주세요.

질문 생성 시 다음 원칙을 지켜주세요:
1. **말씀 중심**: 설교의 핵심 메시지와 성경 본문의 의미가 훼손되지 않도록 합니다.
2. **삶의 적용**: 추상적인 질문보다는 성도들이 가정, 일터, 공동체에서 구체적으로 실천할 수 있는 방안(Action Item)을 제시합니다.
3. **격려와 위로**: 정죄하기보다는 하나님의 사랑을 느끼고 변화를 결단하게 하는 따뜻한 톤앤매너를 유지합니다.

각 날짜별로 다음 요소를 포함해야 합니다:
1. 주제 제목
2. 관련 성구 (설교 본문 혹은 해당 주제와 연관된 성경 구절)
3. 묵상 질문 (마음을 깊이 들여다보게 하는 질문)
4. 실천 방안 (오늘 하루 어떻게 살 것인가에 대한 구체적 제안)
5. 마침 기도

응답은 반드시 지정된 JSON 형식으로 출력하세요.
`;

export const generateMeditation = async (sermonText: string): Promise<WeeklyMeditationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  const result = JSON.parse(response.text);
  return result as WeeklyMeditationResult;
};

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Scientist, Field, SkillType, SkillCard } from "../types";

// Safe initialization
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateScientistCard = async (name: string): Promise<Scientist | null> => {
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }

  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      title: { type: Type.STRING },
      field: { type: Type.STRING, enum: Object.values(Field) },
      hp: { type: Type.INTEGER, description: "Between 80 and 120" },
      maxHp: { type: Type.INTEGER, description: "Same as hp" },
      quote: { type: Type.STRING },
      deck: {
        type: Type.ARRAY,
        description: "Create exactly 3 unique skill cards based on the scientist's theories.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: [SkillType.ATTACK, SkillType.DEFENSE, SkillType.HEAL] },
            cost: { type: Type.INTEGER, description: "Between 1 and 3" },
            value: { type: Type.INTEGER, description: "Amount of damage, shield, or heal. Scale with cost (approx 8-10 per 1 cost)." }
          },
          required: ["name", "description", "type", "cost", "value"]
        }
      }
    },
    required: ["name", "title", "field", "hp", "maxHp", "quote", "deck"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `创建一个基于科学家 ${name} 的卡牌游戏角色。富有创意但要有历史依据。请使用中文（简体）返回内容，但 'field' 和 'type' 字段必须使用指定的英文枚举值。确保生成3张独特的技能牌（deck）。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Validate basics and add ID
    if (data.name) {
      const field = Object.values(Field).includes(data.field) ? data.field : Field.PHYSICS;
      return {
        ...data,
        id: `gen_${Date.now()}`,
        field: field,
        deck: data.deck.map((card: any, idx: number) => ({
          ...card,
          id: `gen_card_${Date.now()}_${idx}`,
          field: field // Inherit field from scientist
        }))
      } as Scientist;
    }
    return null;
  } catch (error) {
    console.error("Failed to generate card:", error);
    return null;
  }
};

export const generateBattleNarration = async (
  attacker: string,
  defender: string,
  cardName: string,
  effectValue: number,
  type: string
): Promise<string> => {
  if (!apiKey) return `${attacker} 使用 ${cardName} 对 ${defender} 生效 (${effectValue})。`;

  const model = "gemini-2.5-flash";
  const prompt = `
    写一个非常简短（最多一句话）、充满戏剧性的中文（简体）战斗日志。
    发动者: ${attacker}
    目标: ${defender}
    使用卡牌: ${cardName}
    数值: ${effectValue}
    类型: ${type} (ATTACK=伤害, DEFENSE=护盾, HEAL=治疗)
    
    描述科学原理如何生效。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        maxOutputTokens: 60,
        temperature: 0.8
      }
    });
    return response.text?.trim() || `${attacker} 使用了 ${cardName}。`;
  } catch (e) {
    return `${attacker} 使用 ${cardName}。`;
  }
};
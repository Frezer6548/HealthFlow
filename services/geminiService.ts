
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMealSuggestions = async (ingredients: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugira 3 receitas saudáveis e criativas usando alguns destes ingredientes: ${ingredients.join(', ')}. 
      Para cada receita, forneça um nome atraente, macros aproximados e o modo de preparo passo a passo. 
      Retorne estritamente em formato JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: "breakfast, lunch, dinner or snack" },
                  calories: { type: Type.NUMBER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fat: { type: Type.NUMBER }
                    },
                    required: ["protein", "carbs", "fat"]
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  preparationSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Lista de passos para preparar a receita."
                  }
                },
                required: ["id", "name", "type", "calories", "macros", "ingredients", "preparationSteps"]
              }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text).meals;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return [];
  }
};

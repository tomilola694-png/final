
import { GoogleGenAI, Type } from "@google/genai";
import { BlueprintOutput, StatTopic, SampleQuestion } from "../types.ts";
import { SYSTEM_INSTRUCTION, TOPICS } from "../constants.tsx";

export async function generateBlueprint(topic: StatTopic): Promise<BlueprintOutput> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a comprehensive procedural question blueprint for the Cambridge A-Level Statistics topic: ${topic}. 
  Focus on high-rigor exam standards. Ensure SymPy logic is functional.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questionTemplate: { type: Type.STRING },
          narrativeLibrary: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          sympyCode: { type: Type.STRING },
          stackPrtLogic: { type: Type.STRING }
        },
        required: ["questionTemplate", "narrativeLibrary", "sympyCode", "stackPrtLogic"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as BlueprintOutput;
}

export async function generateSampleQuestions(topic: StatTopic): Promise<SampleQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config = TOPICS.find(t => t.id === topic);
  const objectives = config?.syllabusObjectives.join(", ") || "";

  const prompt = `Generate 3 distinct Cambridge A-Level Statistics exam-style questions for: ${topic}.
  
  THEMATIC FOCUS: ${objectives}.
  
  VISUAL CHART RULES:
  - ONLY include 'distParams' if the question is specifically about the Normal, Binomial, or Poisson distribution.
  - For 'Permutations & Combinations' or 'Representation of Data', you MUST OMIT 'distParams' entirely.
  
  EXAM-READY NOTATION:
  - NO computer characters: Never use '*' for times, use '\\times'. Never use '^' for powers, use 'x^{2}'. Never use '/' for fractions, use '\\frac{a}{b}'.
  - NO tech delimiters: Do not use '$' or '$$' in any field.
  - USE official symbols: P(A | B), μ, σ, Σ, and Φ.

  Output JSON format strictly.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a senior examiner for A-Level Statistics. You provide solutions in pure mathematical notation as they would appear in a textbook or mark scheme.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            context: { type: Type.STRING },
            questionHeader: { type: Type.STRING },
            subQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  part: { type: Type.STRING },
                  text: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                  stepByStepSolution: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        math: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                      },
                      required: ["label", "math", "explanation"]
                    }
                  },
                  finalAnswer: { type: Type.STRING }
                },
                required: ["id", "part", "text", "marks", "stepByStepSolution", "finalAnswer"]
              }
            },
            simplifiedExplanation: { type: Type.STRING },
            distParams: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['normal', 'binomial', 'poisson'] },
                mu: { type: Type.NUMBER },
                sigma: { type: Type.NUMBER },
                n: { type: Type.NUMBER },
                p: { type: Type.NUMBER },
                lambda: { type: Type.NUMBER },
                threshold: { type: Type.NUMBER },
                comparison: { type: Type.STRING, enum: ['greater', 'less'] }
              },
              required: ["type"]
            }
          },
          required: ["id", "context", "questionHeader", "subQuestions", "simplifiedExplanation"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as SampleQuestion[];
}

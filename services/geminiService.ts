
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const cleanText = (text: string) => {
  // Secondary safety check to remove any markdown bolding symbols
  return text.replace(/\*\*/g, '');
};

export const chatWithGemini = async (prompt: string, history: any[] = []) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT + `
      
      STRICT SCOPE:
      - Answer ONLY regarding International Trade, Nigerian Trade Regulations, Logistics, and Shipping.
      - DO NOT use markdown bolding (e.g., **text**).
      - If off-scope, politely decline.`,
      tools: [
        { googleSearch: {} }
      ],
      temperature: 0.1,
    },
  });

  return {
    text: cleanText(response.text || "I'm processing your request..."),
    toolCalls: response.functionCalls || [],
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    })).filter((s: any) => s.uri) || []
  };
};

export const analyzeTradeDocument = async (
  prompt: string, 
  base64Data: string, 
  mimeType: string,
  extraFiles: Array<{ data: string, mimeType: string }> = []
) => {
  const ai = getAIClient();
  
  const primaryData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const fileParts = [
    {
      inlineData: {
        data: primaryData,
        mimeType: mimeType,
      },
    }
  ];

  extraFiles.forEach(file => {
    const cleanData = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    fileParts.push({
      inlineData: {
        data: cleanData,
        mimeType: file.mimeType,
      }
    });
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...fileParts,
        {
          text: `You are an expert Nigerian Trade Auditor. 
          Analyze these ${fileParts.length} files (documents, images, audio, or video) if they relate to trade. 
          User Request: "${prompt}".
          
          If any files are audio or video, first transcribe their content fully, then analyze the transcription in the context of the user's request and any other attached documents.
          
          FORMATTING: DO NOT USE BOLD SYMBOLS (**) IN YOUR OUTPUT. Provide clear, professional plain text.`,
        },
      ],
    },
    config: {
      systemInstruction: SYSTEM_PROMPT
    }
  });

  let imageUrl = '';
  let feedbackText = '';

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      feedbackText = cleanText(part.text);
    }
  }

  return { imageUrl, feedbackText };
};

export const editTradeImage = analyzeTradeDocument;

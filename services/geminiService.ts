
import { GoogleGenAI, Type } from "@google/genai";
import { DataStore } from './dataStore';

// Use Flash Lite for low-latency command parsing and extraction.
const FAST_MODEL = 'gemini-flash-lite-latest';
// Use Pro for complex reasoning and chat.
const PRO_MODEL = 'gemini-3-pro-preview';

// Helper to get client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("FocusPilot: API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// Structured schema for command parsing.
const parsedCommandSchema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: ["create_task", "update_task", "complete_task", "create_bill", "mark_bill_paid", "create_event", "create_note", "set_reminder", "query", "daily_summary"]
    },
    confidence: { type: Type.NUMBER },
    clarification_question: { type: Type.STRING, nullable: true },
    missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } },
    payload: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, nullable: true },
        notes: { type: Type.STRING, nullable: true },
        dueAt: { type: Type.STRING, nullable: true },
        priority: { type: Type.STRING, enum: ["P0", "P1", "P2", "P3"], nullable: true },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
        payee: { type: Type.STRING, nullable: true },
        amount: { type: Type.NUMBER, nullable: true },
        currency: { type: Type.STRING, nullable: true },
        dueDate: { type: Type.STRING, nullable: true },
        autopay: { type: Type.BOOLEAN, nullable: true },
        recurrence: { type: Type.STRING, enum: ["none", "monthly", "biweekly", "custom"], nullable: true },
        id: { type: Type.STRING, nullable: true }
      },
      nullable: true
    }
  },
  required: ["type", "confidence", "missing_fields"]
};

// Structured schema for receipt data extraction.
const receiptExtractSchema = {
  type: Type.OBJECT,
  properties: {
    vendorName: { type: Type.STRING, nullable: true },
    date: { type: Type.STRING, nullable: true },
    subtotal: { type: Type.NUMBER, nullable: true },
    tax: { type: Type.NUMBER, nullable: true },
    total: { type: Type.NUMBER, nullable: true },
    currency: { type: Type.STRING, nullable: true },
    category: { type: Type.STRING, nullable: true },
    paymentMethod: { type: Type.STRING, nullable: true },
    lineItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER }
        }
      },
      nullable: true
    }
  }
};

export const GeminiService = {
  // Parses natural language input into structured commands.
  parseCommand: async (text: string) => {
    const ai = getClient();
    const db = await DataStore.get();
    const settings = db.settings;
    const now = new Date().toISOString();
    
    const prompt = `
      You are FocusPilot, a personal assistant.
      Current Time: ${now}
      User Timezone: ${settings.timezone}
      Analyze the user's request: "${text}"
      
      Rules:
      1. Map to correct action.
      2. Convert relative dates (tomorrow, Friday) to absolute ISO.
      3. For bills, default currency is ${settings.currency}.
    `;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: parsedCommandSchema
      }
    });
    
    return JSON.parse(response.text || "{}");
  },

  // Extracts information from a base64 encoded receipt image.
  extractReceipt: async (base64Image: string) => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Extract receipt data with high precision." }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptExtractSchema
      }
    });

    return JSON.parse(response.text || "{}");
  },

  // Initializes a new chat session with user context.
  createChatSession: async () => {
    const ai = getClient();
    const db = await DataStore.get();
    const context = `
      You are the FocusPilot AI Concierge. 
      You help users manage tasks, bills, and productivity.
      Current Context:
      - Active Tasks: ${db.tasks.filter(t => t.status !== 'done').length}
      - Unpaid Bills: ${db.bills.filter(b => b.status !== 'paid').length}
      - Recent Notes: ${db.notes.length}
      User Timezone: ${db.settings.timezone}
      
      Always be helpful, professional, and concise.
    `;

    return ai.chats.create({
      model: PRO_MODEL,
      config: {
        systemInstruction: context,
      },
    });
  }
};

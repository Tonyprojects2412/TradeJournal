'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { InsertTrade } from './trade';

export async function parseTradeText(rawText: string): Promise<{ success: boolean; data?: Partial<InsertTrade>; error?: string }> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: 'GEMINI_API_KEY not configured. Please add it to your .env file.' };
        }

        const ai = new GoogleGenAI({ apiKey });

        const tradeSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                ticker: { type: Type.STRING, description: "The symbol of the stock or option" },
                assetType: { type: Type.STRING, enum: ["stock", "option"] },
                direction: { type: Type.STRING, enum: ["long", "short"] },
                entryPrice: { type: Type.NUMBER, description: "Price per share (for stocks) or premium paid (for options)" },
                size: { type: Type.NUMBER, description: "Number of shares or contracts" },
                entryDate: { type: Type.STRING, description: "ISO 8601 date string" },
                exitPrice: { type: Type.NUMBER, description: "Exit execution price, if closed, otherwise null", nullable: true },
                exitDate: { type: Type.STRING, description: "Exit date string, if closed, otherwise null", nullable: true },
                tradeType: { type: Type.STRING, enum: ["day_trade", "swing_trade"], nullable: true },
                fees: { type: Type.NUMBER, description: "Brokerage fees or commissions", nullable: true },
                strategy: { type: Type.STRING, description: "The inferred strategy or setup name", nullable: true },
                // Option specific fields
                optionType: { type: Type.STRING, enum: ["call", "put"], nullable: true },
                strike: { type: Type.NUMBER, description: "Strike price for options", nullable: true },
                expirationDate: { type: Type.STRING, description: "Expiration date for options", nullable: true },
                contracts: { type: Type.INTEGER, description: "Number of option contracts", nullable: true },
                premiumEntry: { type: Type.NUMBER, description: "Entry premium for the option", nullable: true },
                premiumExit: { type: Type.NUMBER, description: "Exit premium if filled", nullable: true },
            },
            required: ["ticker", "assetType", "direction", "entryPrice", "size", "entryDate"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [{
                        text: `Extract the trading details from the following raw text or pasted data. Format it into the specific JSON schema representing a trade log entry. If sizes, prices or dates are unclear, make your best guess based on financial standard formats.\n\nRaw Data:\n${rawText}`
                    }]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: tradeSchema,
                temperature: 0.1,
            }
        });

        const textResponse = response.text;

        if (!textResponse) {
            throw new Error("No prediction output from GenAI.");
        }

        const parsedData = JSON.parse(textResponse) as Partial<InsertTrade>;

        // Standardize base date formats if AI misses it
        if (!parsedData.entryDate) {
            parsedData.entryDate = new Date().toISOString();
        } else {
            // Validate date format, fallback to now if invalid
            try {
                const date = new Date(parsedData.entryDate);
                if (isNaN(date.getTime())) throw new Error("Invalid");
            } catch {
                parsedData.entryDate = new Date().toISOString();
            }
        }

        return {
            success: true,
            data: parsedData,
        };

    } catch (error: any) {
        console.error("AI Parsing Error: ", error);
        return {
            success: false,
            error: error.message || "Failed to process text using AI model."
        };
    }
}

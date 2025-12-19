
import { GoogleGenAI, GenerateContentResponse, Type, Chat } from '@google/genai';
import { FloorplanAnalysis, Room, MaterialBreakdownItem, SupplierRequest } from '../types';

const getAiClient = () => {
    // NOTE: This will be populated by the environment. Do not edit.
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        // This should be caught by the ApiKeySelector flow, but as a fallback.
        throw new Error("API_KEY environment variable not set.");
    }

    return new GoogleGenAI({ apiKey: API_KEY });
};

const cleanJsonString = (jsonString: string): string => {
  return jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
};

export const analyzeFloorplan = async (base64Image: string): Promise<FloorplanAnalysis> => {
    const ai = getAiClient();
    const systemInstruction = `You are a hyper-precise digital architectural surveyor. Your sole mission is to analyze a floorplan image and convert it into a perfectly structured JSON object with extreme accuracy. Pay meticulous attention to the placement of every feature.

    **CRITICAL RULES:**
    1.  **Identify Rooms:** Accurately identify every enclosed space as a room.
    2.  **Room Details:** For each room, you MUST provide:
        *   \`name\`: A descriptive name (e.g., "living_room", "master_bedroom").
        *   \`size\`: The dimensions in meters (e.g., "4.5x6m").
        *   \`entry\`: The cardinal direction (N, S, E, W) of the primary entrance into the room.
        *   \`walls\`: A description for each of the four cardinal walls (N, S, E, W).
    3.  **Feature Detection & ID:**
        *   Identify ALL windows, doors, and significant fixed equipment (fireplaces, sinks, stoves, etc.).
        *   Assign a unique, sequential ID to each feature: \`W1\`, \`W2\` for windows; \`D1\`, \`D2\` for doors; \`E1\`, \`E2\` for equipment.
    4.  **PRECISION LOCATION:** For each feature, the \`description\` MUST be highly specific about its location. Use phrases like:
        *   "Centered on the S wall."
        *   "Located on the W wall, 1m from the NW corner."
        *   "Spanning the entire E wall."
        *   "In the SE corner of the room."
        *   "Double doors on the N wall, leading to the hallway."
    5.  **JSON ONLY:** Your entire output must be a single, valid JSON object. Do NOT include \`\`\`json, explanations, apologies, or any text outside of the JSON structure.

    **EXAMPLE JSON STRUCTURE:**
    {
      "rooms": [
        {
          "name": "living_room",
          "size": "5x7m",
          "walls": {
            "N": "A long, uninterrupted wall.",
            "S": "Contains a large, centered picture window.",
            "E": "Features a fireplace in the center.",
            "W": "Has a double doorway leading to the dining room."
          },
          "entry": "W",
          "features": [
            { "id": "W1", "type": "window", "description": "Large picture window centered on the S wall." },
            { "id": "D1", "type": "door", "description": "Double doorway centered on the W wall, connects to dining_room." },
            { "id": "E1", "type": "equipment", "name": "fireplace", "description": "Brick fireplace centered on the E wall." }
          ]
        }
      ]
    }`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        // FIX: Updated model to 'gemini-3-flash-preview' for multimodal tasks as per guidelines.
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: systemInstruction }
            ]
        },
        config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const rawText = response.text || '';
        const jsonStr = cleanJsonString(rawText);
        const parsed = JSON.parse(jsonStr);
        return parsed as FloorplanAnalysis;
    } catch (e) {
        console.error("Failed to parse floorplan analysis response:", response.text, e);
        throw new Error("Could not understand the floorplan structure.");
    }
};

export const correctArchitecture = async (originalRoom: Room, correction: string): Promise<Room> => {
    const ai = getAiClient();
    const systemInstruction = `You are an architectural assistant AI. Your task is to update a room's layout based on a user's correction.
    You will be given a JSON object representing the original room layout and a text string with the user's requested change.
    Your goal is to apply the correction to the JSON object and return the complete, updated JSON object.
    - You MUST maintain the exact original JSON structure.
    - Update the 'walls' descriptions and the 'features' array as necessary to reflect the correction.
    - Do not add any new properties or change the format.
    - The user might refer to features by their IDs (e.g., "W1", "D1").

    Original Room JSON:
    ${JSON.stringify(originalRoom)}

    User's Correction:
    "${correction}"

    Return ONLY the single, valid, updated JSON object. Do not include any other text or explanations.`;

    const response = await ai.models.generateContent({
        // FIX: Updated model to 'gemini-3-flash-preview' for text tasks as per guidelines.
        model: 'gemini-3-flash-preview',
        contents: systemInstruction,
        config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const jsonStr = cleanJsonString(response.text || '{}');
        return JSON.parse(jsonStr) as Room;
    } catch(e) {
        console.error("Failed to parse corrected architecture response:", response.text, e);
        throw new Error("Could not apply architectural correction.");
    }
};

interface DesignGenerationResult {
    imagePrompt: string;
    materialBreakdown: MaterialBreakdownItem[];
    albumTitle: string;
}

export const generateDesignAids = async (room: Room, style: string, refinementPrompt: string | null = null): Promise<DesignGenerationResult> => {
    const ai = getAiClient();
    
    const userRequestBlock = refinementPrompt
        ? `
This is a refinement of a previous design.
- Base Style: ${style}
- User's Requested Change: "${refinementPrompt}"

Your generated 'imagePrompt' must describe the room in the base style, but with the user's requested change fully integrated. The 'albumTitle' should reflect this change (e.g., "${style} with ${refinementPrompt}").
`
        : `
User Request:
- Style: ${style}
`;

    const systemInstruction = `You are a precise interior designer AI. Your task is to generate a JSON object for a room design based on strict data.

    Your output MUST adhere to these rules:
    - The design must not alter the room's architecture (walls, windows, doors).
    - The location of existing equipment is fixed and must be preserved.
    - The camera view for the render must be from the entry door, looking into the room at a 45-degree angle.

    Based on the user's request and the provided room data, generate a JSON object containing:
    1. 'imagePrompt': A detailed, photorealistic prompt for an image generator that respects all rules.
    2. 'materialBreakdown': An array of objects, each with a 'name' and 'description' (including metric quantities).
    3. 'albumTitle': A short, descriptive title for the design.
    
    ${userRequestBlock}

    Room Data:
    - Name: ${room.name}
    - Size: ${room.size}
    - Entry Door: ${room.entry} wall
    - Walls: ${JSON.stringify(room.walls)}
    - Features Layout: ${JSON.stringify(room.features)}

    Output ONLY the single valid JSON object.`;

    const response = await ai.models.generateContent({
        // FIX: Updated model to 'gemini-3-flash-preview' for text tasks as per guidelines.
        model: 'gemini-3-flash-preview',
        contents: systemInstruction,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    imagePrompt: { type: Type.STRING },
                    materialBreakdown: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['name', 'description']
                        }
                    },
                    albumTitle: {
                        type: Type.STRING
                    }
                }
            }
        }
    });

    try {
        const jsonStr = cleanJsonString(response.text || '{}');
        return JSON.parse(jsonStr) as DesignGenerationResult;
    } catch(e) {
        console.error("Failed to parse design aids response:", response.text, e);
        throw new Error("Could not generate design details.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: {
                aspectRatio: '16:9',
            }
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No image was generated.");
};

export const refineImage = async (prompt: string, base64Image: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: 'image/png' } },
                { text: prompt },
            ],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No refined image was generated.");
}

export const generateSupplierPackage = async (roomName: string, materials: MaterialBreakdownItem[]): Promise<SupplierRequest> => {
    const ai = getAiClient();
    const systemInstruction = `You are a procurement assistant AI. Convert the following material list for a ${roomName} into a JSON object with "room" and "materials" keys.
    Materials: ${JSON.stringify(materials)}
    Output ONLY the single, valid JSON object.`;

    const response = await ai.models.generateContent({
        // FIX: Updated model to 'gemini-3-flash-preview' for text tasks as per guidelines.
        model: 'gemini-3-flash-preview',
        contents: systemInstruction,
        config: {
            responseMimeType: 'application/json',
        },
    });
    
    try {
        const rawText = response.text || '';
        const jsonStr = cleanJsonString(rawText);
        return JSON.parse(jsonStr) as SupplierRequest;
    } catch(e) {
        console.error("Failed to parse supplier package response:", response.text, e);
        throw new Error("Could not generate supplier package.");
    }
};


export const getDesignAdvice = async (chatHistory: { role: string, parts: { text: string }[] }[]): Promise<string> => {
    const ai = getAiClient();
    
    const history = chatHistory.slice(0, -1);
    const lastMessage = chatHistory[chatHistory.length - 1].parts[0].text;

    const chat: Chat = ai.chats.create({
        // FIX: Updated model to 'gemini-3-flash-preview' for chat tasks as per guidelines.
        model: 'gemini-3-flash-preview',
        history: history,
        config: {
            systemInstruction: "You are a helpful and creative interior design assistant. Provide concise, actionable advice to help users with their room designs."
        }
    });

    const response = await chat.sendMessage({ message: lastMessage });
    
    return response.text || "I'm not sure how to answer that. Could you rephrase?";
}
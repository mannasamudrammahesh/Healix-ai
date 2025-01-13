import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAx34o31vs5bNBpR8BbftYHU-hC4jqOOJQ");  // API key included
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const apiKey = "AIzaSyAx34o31vs5bNBpR8BbftYHU-hC4jqOOJQ";
    const reqBody = await req.json();
    const { userPrompt } = reqBody;

    let genAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error("Error initializing Google AI:", error);
      return NextResponse.json({ error: "Failed to initialize AI service" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    });

    const prompt = `You are a mental health professional providing supportive and empathetic responses. Please respond to the following: ${userPrompt}`;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 15000);
    });

    const responsePromise = model.generateContent(prompt);
    const result = await Promise.race([responsePromise, timeoutPromise]);

    if (!result || typeof result === 'string') {
      throw new Error("Invalid response from AI service");
    }

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: "Empty response received" }, { status: 500 });
    }

    return NextResponse.json({ text });

  } catch (error) {
    console.error("Error processing request:", error);

    let errorMessage = "Unable to process the prompt. Please try again.";
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "API configuration error";
      } else if (error.message.includes("timed out")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 504;
      } else if (error.message.includes("model not found")) {
        errorMessage = "Model configuration error. Please check your API access.";
        statusCode = 400;
      }
    }

    return NextResponse.json({ error: errorMessage, details: error.message }, { status: statusCode });
  }
}
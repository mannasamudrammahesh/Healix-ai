import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAx34o31vs5bNBpR8BbftYHU-hC4jqOOJQ");  // API key included
const model = genAI.getGenerativeModel({ model: "gemini-pro"});
const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 1000,
  },
});

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { userPrompt } = reqBody;
  const result = await chat.sendMessage(userPrompt);
  const response = await result.response;
  const text = response.text();
  
  if (text === "") {
    return NextResponse.json({ text: "Sorry, I don't understand." });
  }
  
  return NextResponse.json({ text });
}
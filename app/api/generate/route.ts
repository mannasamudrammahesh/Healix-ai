import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAx34o31vs5bNBpR8BbftYHU-hC4jqOOJQ");  // API key included
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { prompt, imageParts } = reqBody;
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  return NextResponse.json({ text });
}
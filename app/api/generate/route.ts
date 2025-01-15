import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Use the environment variable
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
export async function POST(req: NextRequest) {
  const secretKey = req.headers.get("Authorization")?.split(" ")[1];
  if (secretKey !== process.env.NEXT_PUBLIC_UPLOADTHING_SECRET) {
    return NextResponse.json({ error: "No secret provided" }, { status: 401 });
  }
  const reqBody = await req.json();
  const { prompt, imageParts } = reqBody;
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = await response.text();
  return NextResponse.json({ text });
}

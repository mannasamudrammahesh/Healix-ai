import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, gender, userPrompt, selectedFile } = body;

    if (!selectedFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const basePrompt = `Generate an anime avatar based on this person's image. Gender: ${gender}.`;
    const finalPrompt = userPrompt 
      ? `${basePrompt} Additional requirements: ${userPrompt}`
      : basePrompt;

    try {
      const result = await model.generateContent([
        {
          text: finalPrompt,
          inlineData: { imageUrl: selectedFile }
        }
      ]);

      const response = await result.response;
      const imageURl = response.text();

      return NextResponse.json({ imageURl });
    } catch (error) {
      console.error("AI Generation Error:", error);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

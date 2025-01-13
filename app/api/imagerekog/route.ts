import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { parseMultipartFormData } from "next-multipart-formdata-parser";




export const POST = async (req: NextRequest) => {
  try {
    // Parse incoming form data
    const { files, fields } = await parseMultipartFormData(req);
    const selectedFile = files?.selectedFile;

    if (!selectedFile) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }

    const prompt = fields?.prompt || "Describe this image.";

    // Generate image with Replicate
    const result = await replicate.run(
      "stability-ai/stable-diffusion",
      { input: { prompt, image: selectedFile.buffer.toString("base64") } }
    );

    if (!result || !result[0]) {
      throw new Error("Image generation failed.");
    }

    return NextResponse.json({ imageURl: result[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
};

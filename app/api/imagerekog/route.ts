import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const dynamic = "force-dynamic"; // Forces dynamic route behavior
export const runtime = "nodejs"; // Required for server-side processing

export const POST = async (req: NextRequest) => {
  try {
    // Check content type
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Parse form data using FormData
    const formData = await req.formData();

    // Retrieve the file and prompt from the form data
    const file = formData.get("selectedFile") as File | null;
    const prompt = formData.get("prompt") as string || "Describe this image.";

    if (!file) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }

    // Read the file as a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || "",
    });

    // Call Replicate API to generate an image
    const result = await replicate.run("stability-ai/stable-diffusion", {
      input: {
        prompt,
        image: fileBuffer.toString("base64"),
      },
    });

    if (!result || !result[0]) {
      throw new Error("Image generation failed.");
    }

    // Return the generated image URL
    return NextResponse.json({ imageURL: result[0] });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
};

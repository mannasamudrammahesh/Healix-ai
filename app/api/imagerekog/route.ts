import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import formidable from 'formidable';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for formidable
export const bodyParser = false;

async function requestToFormDataStream(req: NextRequest) {
  const arrayBuffer = await req.arrayBuffer();
  return Readable.from(Buffer.from(arrayBuffer));
}

export const POST = async (req: NextRequest) => {
  try {
    const form = formidable({
      maxFileSize: 4 * 1024 * 1024, // 4MB limit
    });

    const formDataStream = await requestToFormDataStream(req);
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(formDataStream, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const selectedFile = files.selectedFile?.[0];  // formidable v3+ returns arrays
    if (!selectedFile) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }

    const prompt = fields.prompt?.[0] || "Describe this image.";

    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const readStream = Readable.from(selectedFile.filepath);
      
      readStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      readStream.on('end', () => resolve(Buffer.concat(chunks)));
      readStream.on('error', reject);
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Generate image with Replicate
    const result = await replicate.run(
      "stability-ai/stable-diffusion",
      { 
        input: { 
          prompt, 
          image: fileBuffer.toString("base64") 
        } 
      }
    );

    if (!result || !result[0]) {
      throw new Error("Image generation failed.");
    }

    return NextResponse.json({ imageURl: result[0] });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." }, 
      { status: 500 }
    );
  }
};
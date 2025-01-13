import { EmailTemplate } from "@/components/email-template";
import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_9nSrzkiw_LjaXVAXvcu74HuJGKW7cwN2Y");  // API key included

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { imageURl, email } = reqBody;

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your avatar is ready! 🌟🤩",
      react: EmailTemplate({ imageURl }),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
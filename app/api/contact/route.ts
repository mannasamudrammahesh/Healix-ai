import { NextRequest } from 'next/server';
import { ContactEmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend("re_9nSrzkiw_LjaXVAXvcu74HuJGKW7cwN2Y");  

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' });
  }

  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: "maheshh130506@gmail.com",
      subject: 'Message from Mentify',
      react: ContactEmailTemplate({ name, email, message }),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
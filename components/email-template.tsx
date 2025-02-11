import * as React from 'react';
import Image from 'next/image';

interface EmailTemplateProps {
  imageURl: string;
}

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  imageURl
}) => (
  <div>
    <h1>Here is your image</h1>
    <div style={{ position: 'relative', width: '100%', height: '300px' }}>
      <Image 
        src={imageURl} 
        alt="Generated image"
        fill
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  </div>
);

export const ContactEmailTemplate: React.FC<Readonly<ContactEmailTemplateProps>> = ({
  name,
  email,
  message
}) => (
  <div>
    <h1>You got a message from Healix</h1>
    <h2>Name: {name}</h2>
    <h2>Email: {email}</h2>
    <h2>Message: {message}</h2>
  </div>
);

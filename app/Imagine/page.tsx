"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import "@uploadthing/react/styles.css";
import { UploadButton } from "@/utils/uploadthing";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import styles from "@/styles/swapImage.module.css";

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [click, setClick] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [imageURl, setImageURl] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [receivedEmail, setReceivedEmail] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClick(true);

    try {
      if (!selectedFile) {
        setClick(false);
        return toast.error("Please upload a picture");
      }

      const body = {
        email,
        gender,
        userPrompt,
        selectedFile,
      };

      const data = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_UPLOADTHING_SECRET}`, 
        },
        body: JSON.stringify(body),
      });

      const response = await data.json();

      if (response.error) {
        setClick(false);
        toast.error(response.error);
        return;
      }

      setImageURl(response.imageURl);
      setClick(false);
    } catch (err) {
      setClick(false);
      toast.error("Something went wrong");
    }
  };

  const handleEmailReceive = () => {
    if (!receivedEmail) {
      toast.success("Email receive is enabled");
    } else {
      toast.error("Email receive is disabled");
    }
    setReceivedEmail(!receivedEmail);
  };

  useEffect(() => {
    if (imageURl) {
      setEmail("");
      setGender("");
      setUserPrompt("");
      setSelectedFile("");
    }

    const sendEmail = async () => {
      try {
        const emailRes = await fetch("/api/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            imageURl,
          }),
        });

        const emailResponse = await emailRes.json();

        if (emailResponse.error) {
          return toast.error("Error sending email");
        }

        setEmailSent(true);
        toast.success("Email sent successfully!");
      } catch (err) {
        toast.error("Failed to send email");
      }
    };

    if (imageURl && receivedEmail) {
      sendEmail();
    }
  }, [imageURl, email, receivedEmail]);

  return (
    <div>
      <Toaster />
      {!imageURl ? (
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 md:p-8 relative">
          <div className={styles.toggleButton} onClick={handleEmailReceive}>
            <div className={receivedEmail ? styles.receivedEmail : ""}></div>
          </div>
          <Head>
            <title>Imagine Yourself</title>
          </Head>
          <header className="mb-8 flex w-full flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Imagine Yourself</h1>
            <p className="opacity-60">Upload a picture of yourself and generate your avatar</p>
          </header>
          <form onSubmit={handleSubmit} className="flex w-full flex-col md:w-[60%]">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              required
              className="mb-3 border-[1px] px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="gender">Gender</label>
            <select
              className="mb-4 rounded border-[1px] px-4 py-3"
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setSelectedFile(res[0].url);
                  toast.success("Image uploaded successfully!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />

            <label htmlFor="prompt" className="mt-4">
              Add custom prompt for your avatar
              <span className="opacity-60"> (optional)</span>
            </label>
            <textarea
              rows={4}
              className="w-full border-[1px] p-3"
              id="prompt"
              value={userPrompt}
              placeholder="Copy image prompts from https://lexica.art"
              onChange={(e) => setUserPrompt(e.target.value)}
            />
            <button
              type="submit"
              className="mt-5 rounded bg-blue-500 px-6 py-4 text-lg text-white hover:bg-blue-700"
              disabled={click}
            >
              {click ? (
                <BeatLoader size={8} color="white" />
              ) : (
                "Generate Image"
              )}
            </button>
          </form>
        </main>
      ) : (
        <div className="min-h-screen w-full flex flex-col items-center justify-center">
          {imageURl && (
            <Image
              src={imageURl}
              width={200}
              height={200}
              alt="Generated avatar"
              className="mb-10"
            />
          )}
          <h2 className="font-bold text-3xl mb-2">Thank you! 🌟</h2>
          <p className="mb-4 text-center">
            {emailSent ? (
              "Your avatar has been sent to your email address"
            ) : (
              receivedEmail ? (
                <BeatLoader size={8} color="black" />
              ) : (
                "Your image has been generated"
              )
            )}
          </p>
          <Link
            href="/imagine"
            className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600"
          >
            Generate another
          </Link>
        </div>
      )}
    </div>
  );
}

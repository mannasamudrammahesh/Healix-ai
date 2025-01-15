"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "@uploadthing/react/styles.css";
import { UploadButton } from "@/utils/uploadthing";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import styles from "@/styles/swapImage.module.css";

interface UploadResponse {
  url: string;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [click, setClick] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [imageURl, setImageURl] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [receivedEmail, setReceivedEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !gender) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload a picture");
      return;
    }

    setClick(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          gender,
          userPrompt,
          selectedFile,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setImageURl(data.imageURl);
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setClick(false);
    }
  };

  const handleEmailReceive = () => {
    setReceivedEmail(prev => {
      const newState = !prev;
      toast[newState ? "success" : "error"](
        `Email receive is ${newState ? "enabled" : "disabled"}`
      );
      return newState;
    });
  };

  useEffect(() => {
    const sendEmail = async () => {
      if (!imageURl || !email || !receivedEmail) return;

      try {
        const response = await fetch("/api/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            imageURl,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setEmailSent(true);
        toast.success("Email sent successfully!");
      } catch (err) {
        console.error("Email error:", err);
        toast.error("Failed to send email");
      }
    };

    if (imageURl) {
      setEmail("");
      setGender("");
      setUserPrompt("");
      setSelectedFile("");
      
      if (receivedEmail) {
        sendEmail();
      }
    }
  }, [imageURl, email, receivedEmail]);

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" />
      
      {!imageURl ? (
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 md:p-8 relative">
          <div className={styles.toggleButton} onClick={handleEmailReceive}>
            <div className={`${receivedEmail ? styles.receivedEmail : ""}`}></div>
          </div>
          
          <header className="mb-8 flex w-full flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Imagine Yourself</h1>
            <p className="opacity-60">Upload a picture of yourself and generate your avatar</p>
          </header>

          <form onSubmit={handleSubmit} className="flex w-full flex-col md:w-[60%]">
            <label htmlFor="email" className="mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              required
              className="mb-3 border-[1px] px-4 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="gender" className="mb-2">Gender</label>
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

            <div className="mb-4">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.url) {
                    setSelectedFile(res[0].url);
                    toast.success("Image uploaded successfully!");
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  toast.error(`Upload failed: ${error.message}`);
                }}
              />
            </div>

            <label htmlFor="prompt" className="mb-2">
              Add custom prompt for your avatar
              <span className="opacity-60"> (optional)</span>
            </label>
            <textarea
              rows={4}
              className="w-full border-[1px] p-3 rounded mb-4"
              id="prompt"
              value={userPrompt}
              placeholder="Copy image prompts from https://lexica.art"
              onChange={(e) => setUserPrompt(e.target.value)}
            />

            <button
              type="submit"
              className="mt-5 rounded bg-blue-500 px-6 py-4 text-lg text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={click || !email || !gender || !selectedFile}
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
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
          {imageURl && (
            <Image
              src={imageURl}
              width={200}
              height={200}
              alt="Generated avatar"
              className="mb-10"
              priority
            />
          )}
          <h2 className="font-bold text-3xl mb-2">Thank you! 🌟</h2>
          <p className="mb-4 text-center">
            {emailSent ? (
              "Your avatar has been sent to your email address"
            ) : receivedEmail ? (
              <BeatLoader size={8} color="black" />
            ) : (
              "Your image has been generated"
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

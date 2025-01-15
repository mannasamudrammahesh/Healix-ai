"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import "@uploadthing/react/styles.css";
import { UploadButton } from "@/utils/uploadthing";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import styles from "@/styles/swapImage.module.css";

interface FormData {
  email: string;
  gender: string;
  userPrompt: string;
  selectedFile: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    gender: "",
    userPrompt: "",
    selectedFile: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageURl, setImageURl] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [receivedEmail, setReceivedEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.selectedFile) {
        toast.error("Please upload a picture");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setImageURl(data.imageUrl);
      
      if (receivedEmail) {
        await sendEmail(formData.email, data.imageUrl);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async (email: string, imageUrl: string) => {
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setEmailSent(true);
      toast.success("Email sent successfully!");
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const handleEmailReceive = () => {
    setReceivedEmail(!receivedEmail);
    toast.success(receivedEmail ? "Email receive disabled" : "Email receive enabled");
  };

  return (
    <div className="min-h-screen">
      <Toaster />
      {!imageURl ? (
        <main className="flex min-h-screen w-full flex-col items-center justify-center px-4 md:p-8 relative">
          <div
            className={`${styles.toggleButton} cursor-pointer`}
            onClick={handleEmailReceive}
            role="button"
            tabIndex={0}
          >
            <div className={`${receivedEmail ? styles.receivedEmail : ""}`} />
          </div>

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
              className="mb-3 border-[1px] px-4 py-2 rounded"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />

            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              className="mb-4 rounded border-[1px] px-4 py-3"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              required
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) {
                  setFormData(prev => ({ ...prev, selectedFile: res[0].url }));
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
              id="prompt"
              rows={4}
              className="w-full border-[1px] p-3 rounded"
              value={formData.userPrompt}
              placeholder="Copy image prompts from https://lexica.art"
              onChange={(e) => setFormData(prev => ({ ...prev, userPrompt: e.target.value }))}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 rounded bg-blue-500 px-6 py-4 text-lg text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? (
                <BeatLoader size={8} color="white" />
              ) : (
                <span>Generate Image</span>
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

"use client";

import { useState } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import { BeatLoader } from "react-spinners";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [file, setFile] = useState<File[]>([]);
  const [fileURLs, setFileURLs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("Describe the image");
  const [showGenerate, setShowGenerate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const fileURLs = files.map((file) => URL.createObjectURL(file));

    setFile(files);
    setFileURLs(fileURLs);
    setShowGenerate(true);
  }

  const handleClick = async () => {
    if (file.length === 0) {
      toast.error("Please upload an image.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      file.forEach((f) => formData.append("selectedFile", f));
      formData.append("prompt", prompt);

      const response = await fetch("/api/imagerekog", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error processing the request.");
      }

      setOutput(data.imageURl || "Image generation successful, but no URL returned.");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center gap-5 h-screen overflow-y-scroll">
      <Toaster />
      <div className="flex items-center gap-3">
        <Image src="/image.png" alt="Logo" width={50} height={50} />
        <h1 className="text-2xl font-bold">AI Image Recognition</h1>
      </div>
      <button
        onClick={() => document.querySelector<HTMLInputElement>("input[type=file]")?.click()}
        className="w-40 h-10 bg-black text-white rounded-md"
      >
        Upload Image
      </button>
      <input type="file" multiple onChange={handleChange} className="hidden" />
      {fileURLs.map((url, idx) => (
        <Image key={idx} src={url} width={200} height={200} alt="Uploaded Preview" />
      ))}
      {showGenerate && (
        <div className="flex flex-col items-center gap-4 mt-5">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-60 border p-2 rounded"
            placeholder="Enter a prompt"
          />
          <button
            onClick={handleClick}
            className="bg-blue-500 text-white p-2 rounded w-40"
            disabled={loading}
          >
            {loading ? <BeatLoader size={8} color="white" /> : "Generate"}
          </button>
        </div>
      )}
      {output && <Markdown className="w-80 overflow-y-scroll mt-5">{output}</Markdown>}
    </main>
  );
}

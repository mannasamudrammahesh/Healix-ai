"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { MessageCircleCode, Upload, Send, Copy, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/styles/styles.module.css";
import { BeatLoader } from "react-spinners";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");
  const [loading, setLoading] = useState(false);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected!");
      return;
    }

    // Check for supported text file types
    const supportedTypes = ["text/plain", "text/markdown", "text/csv"];
    if (!supportedTypes.includes(file.type)) {
      toast.error("Only text files (.txt, .md, .csv) are supported!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const fileContent = readerEvent.target?.result as string;
      if (fileContent) {
        setPrompt(fileContent);
        toast.success("File uploaded successfully!");
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file!");
    };
    reader.readAsText(file, "UTF-8");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chat-response.txt";
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const onSubmit = async () => {
    if (prompt.trim() === "") {
      toast.error("Prompt cannot be empty!");
      return;
    }

    setOutput("Generating response...");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);

      if (data.error) {
        toast.error(data.error);
        setOutput("Error occurred. Please try again.");
        return;
      }

      if (!data.text || data.text === "") {
        toast.error("No response from the server!");
        setOutput("No response received. Please try again.");
        return;
      }

      setResponse(data.text);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch response. Check your connection!");
      setOutput("Failed to get response. Please try again.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (response.length === 0) return;

    setOutput(""); // Reset output before typing effect

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < response.length) {
        setOutput((prev) => prev + response[i]);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval); // Cleanup on unmount or response change
  }, [response]);

  return (
    <main className="flex flex-col items-center min-h-screen gap-4 p-4 bg-gray-100">
      <Toaster position="top-center" />
      <div className="flex gap-2 items-center mt-8 mb-5">
        <MessageCircleCode size="64" className="text-blue-600" />
        <span className="text-3xl md:text-4xl font-bold text-gray-800">Council</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-center w-full max-w-3xl">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Enter your prompt here..."
            value={prompt}
            className={cn(
              "w-full h-[50px] pr-12 text-sm md:text-base",
              "focus:ring-2 focus:ring-blue-500"
            )}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          {loading ? (
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
              <BeatLoader color="#000" size={8} />
            </div>
          ) : (
            <button
              onClick={onSubmit}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 hover:scale-110 transition ease-in-out"
              aria-label="Submit prompt"
            >
              <Send className="text-blue-600" />
            </button>
          )}
        </div>
        <input
          type="file"
          onChange={onFileChange}
          className="hidden"
          id="file-upload"
          accept=".txt,.md,.csv"
        />
        <Button
          variant="outline"
          className={cn("w-[40px] h-[40px] p-0 flex items-center justify-center")}
          onClick={() => document.getElementById("file-upload")?.click()}
          aria-label="Upload file"
        >
          <Upload className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-start w-full max-w-3xl">
        <Card
          className={cn(
            "p-5 w-full min-h-[150px] max-h-[400px] overflow-y-auto",
            "bg-white shadow-md rounded-lg"
          )}
        >
          <div className={styles.textwrapper}>
            <Markdown className="w-full h-full text-gray-700 prose">
              {output}
            </Markdown>
          </div>
        </Card>
        <div className="flex flex-row sm:flex-col gap-3">
          <Button
            variant="outline"
            className={cn("w-[40px] h-[40px] p-0 flex items-center justify-center")}
            onClick={copyToClipboard}
            aria-label="Copy to clipboard"
          >
            <Copy className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className={cn("w-[40px] h-[40px] p-0 flex items-center justify-center")}
            onClick={downloadFile}
            aria-label="Download response"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}

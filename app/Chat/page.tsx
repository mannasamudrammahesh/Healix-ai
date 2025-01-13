"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { MessageCircleCode, Upload } from "lucide-react";
import { Send, Copy, Download } from "lucide-react";
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

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected!");
      return;
    }
    if (!file.type.includes("text")) {
      toast.error("File type not supported!");
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (readerEvent) => {
      setPrompt(readerEvent.target?.result || "done");
    };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    // Set the href and download attributes for the anchor tag
    anchor.href = url;
    anchor.download = "chat.txt";
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = async () => {
    if (prompt === "") {
      toast.error("Prompt cannot be empty!");
      return;
    }

    setOutput("The response will appear here...");

    setLoading(true);

    const response = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userPrompt: prompt,
      }),
    });

    const data = await response.json();

    setLoading(false)

    if(data.error) {
      toast.error(data.error);
      return;
    }

    if(data.text === "") {
      toast.error("No response from the server!");
      return;
    }

    setResponse(data.text);

  };

  useEffect(() => {
    if (response.length === 0) return;

    setOutput("");

    for (let i = 0; i < response.length; i++) {
      setTimeout(() => {
        setOutput((prev) => prev + response[i]);
      }, i * 10);
    }
  }, [response]);

  return (
    <main className={`flex flex-col items-center h-screen gap-4 mt-10`}>
      <Toaster />
      <div className="flex gap-2 items-center mb-5">
        <MessageCircleCode size="64" />
        <span className="text-3xl font-bold">Council</span>
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <Input
            type="text"
            placeholder="prompt"
            value={prompt}
            className={cn(
              "min-w-[320px] sm:min-w-[400px] md:min-w-[500px] h-[50px] pr-12"
            )}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(e) => onKeyDown(e)}
          />
          {loading ? (
            <button className="absolute top-3 right-3 hover:scale-110 transition ease-in-out">
              <BeatLoader color="#000" size={8} />
            </button>
          ) : (
            <button
              onClick={() => onSubmit()}
              className="absolute top-3 right-3 hover:scale-110 transition ease-in-out"
            >
              <Send />
            </button>
          )}
        </div>
        <Input
          type="file"
          onChange={(e) => onFileChange(e)}
          className="hidden"
        />
        <Button
          variant="outline"
          className={cn("w-[40px] p-1")}
          onClick={() => {
            const fileInput = document.querySelector(
              "input[type=file]"
            ) as HTMLInputElement;
            fileInput.click();
          }}
        >
          <Upload className={cn("w-[20px]")} />
        </Button>
      </div>
      <div className="flex gap-3 items-center">
        <Card
          className={cn(
            "p-5 whitespace-normal min-w-[320px] sm:w-[500px] md:min-w-[600px] min-h-[150px] max-h-[400px] lg:min-w-[700px] overflow-y-scroll"
          )}
        >
          <div className={`${styles.textwrapper}`}>
            <Markdown className={cn("w-full h-full ")}>{`${output}`}</Markdown>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          <Button
            variant="outline"
            className={cn("w-[40px] p-1")}
            onClick={() => copyToClipboard()}
          >
            <Copy className={cn("w-[20px]")} />
          </Button>
          <Button
            variant="outline"
            className={cn("w-[40px] p-1")}
            onClick={() => downloadFile()}
          >
            <Download className={cn("w-[20px]")} />
          </Button>
        </div>
      </div>
    </main>
  );
}
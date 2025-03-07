"use client";

import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { MessageCircleCode, Upload, Mic, Volume2, History } from "lucide-react";
import { Send, Copy, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/styles/styles.module.css";
import { BeatLoader } from "react-spinners";
import { useSpeechSynthesis } from "react-speech-kit";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const submissionTimeout = useRef<NodeJS.Timeout | null>(null);
  const { speak, speaking, cancel, voices } = useSpeechSynthesis();
  const completeResponseRef = useRef<string>("");

  const getBestVoice = () => {
    const preferredVoiceNames = [
      "Google UK English Female",
      "Google US English Female",
      "Microsoft Zira Desktop - English (United States)",
      "Samantha",
      "Victoria",
      "Alex",
      "Karen",
    ];

    for (const name of preferredVoiceNames) {
      const exactMatch = voices.find(voice => voice.name === name);
      if (exactMatch) return exactMatch;
    }

    const keywordMatch = voices.find(voice =>
      (voice.name.toLowerCase().includes("female") ||
       voice.name.toLowerCase().includes("girl") ||
       voice.name.toLowerCase().includes("woman")) &&
      voice.lang.startsWith("en")
    );
    if (keywordMatch) return keywordMatch;

    const providerMatch = voices.find(voice =>
      (voice.name.includes("Google") || voice.name.includes("Microsoft")) &&
      voice.lang.startsWith("en")
    );
    if (providerMatch) return providerMatch;

    const englishVoice = voices.find(voice => voice.lang.startsWith("en"));
    return englishVoice || voices[0];
  };

  const speechOptions = {
    voice: getBestVoice(),
    rate: 0.95,
    pitch: 1.1,
    volume: 1.0
  };

  useEffect(() => {
    fetch("/api/chat", { method: "GET" })
      .then((res) => res.json())
      .then((data) => setChatHistory(data.history || []))
      .catch((err) => console.error("Failed to fetch chat history:", err));
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      toast.success("Voice captured!");
      submissionTimeout.current = setTimeout(() => onSubmit(), 1500);
    };

    recognition.onerror = (event) => {
      toast.error(`Voice input error: ${event.error}`);
      setIsListening(false);
      if (submissionTimeout.current) clearTimeout(submissionTimeout.current);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (error) {
      toast.error("Failed to start voice input.");
      setIsListening(false);
    }
  };

  const processTextForSpeech = (text: string): string => {
    if (!text || text === "The response will appear here...") return "";

    let cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/#{1,6}\s+(.*?)(?:\n|$)/g, "$1. ")
      .replace(/^\s*[-*+]\s+(.*?)(?:\n|$)/gm, "$1. ")
      .replace(/^\s*\d+\.\s+(.*?)(?:\n|$)/gm, "$1. ")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, ". ")
      .replace(/\.\s*\./g, ".")
      .replace(/\s{2,}/g, " ")
      .replace(/[\s\.]+([\.,;:])/g, "$1")
      .trim();

    if (cleanedText && !".?!".includes(cleanedText[cleanedText.length - 1])) {
      cleanedText += ".";
    }

    console.log("Full processed text for speech:", cleanedText);
    return cleanedText;
  };

  const toggleSpeech = () => {
    if (speaking) {
      cancel();
      toast.success("Speech stopped");
      return;
    }

    const fullText = completeResponseRef.current;
    if (!fullText || fullText === "The response will appear here...") {
      toast.error("No content to speak");
      return;
    }

    const processedText = processTextForSpeech(fullText);
    if (!processedText) {
      toast.error("No valid content to speak");
      return;
    }

    console.log("Speaking full text length:", processedText.length);
    toast.success("Starting speech...");
    const MAX_CHARS = 4000;

    if (processedText.length <= MAX_CHARS) {
      speak({
        ...speechOptions,
        text: processedText,
        onEnd: () => {
          console.log("Single chunk speech completed");
          toast.success("Speech completed");
        },
        onError: (err) => {
          console.error("Speech error:", err);
          toast.error("Speech playback failed");
        }
      });
    } else {
      const chunks = [];
      let currentChunk = "";
      const sentences = processedText.split(/(?<=[.!?])\s+/).filter(Boolean);

      for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).length > MAX_CHARS) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      console.log("Speech chunks:", chunks.length, chunks);

      let chunkIndex = 0;
      const speakNextChunk = () => {
        if (chunkIndex >= chunks.length) {
          console.log("All chunks spoken");
          toast.success("Full speech completed");
          return;
        }

        console.log(`Speaking chunk ${chunkIndex + 1}/${chunks.length}:`, chunks[chunkIndex]);
        speak({
          ...speechOptions,
          text: chunks[chunkIndex],
          onEnd: () => {
            chunkIndex++;
            speakNextChunk();
          },
          onError: (err) => {
            console.error(`Speech error on chunk ${chunkIndex}:`, err);
            toast.error(`Speech error on part ${chunkIndex + 1}`);
          }
        });
      };

      speakNextChunk();
    }
  };

  const onKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return toast.error("No file selected!");

    const supportedExtensions = /\.(txt|pdf|docx|xlsx|pptx|html|epub|mobi|azw|azw3|odt|ods|odp)$/i;
    if (!file.name.match(supportedExtensions)) {
      return toast.error("File type not supported!");
    }

    setFile(file);
    toast.success(`File selected: ${file.name}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy text."));
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `council-chat-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  };

  const onSubmit = async () => {
    if (submissionTimeout.current) clearTimeout(submissionTimeout.current);

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return toast.error("Please enter a prompt!");

    setOutput("The response will appear here...");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: trimmedPrompt,
          age: "not specified",
          hasFile: !!file
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setLoading(false);

      if (data.error) return toast.error(data.error);
      if (!data.text) return toast.error("No response from server!");

      const fullResponse = data.text;
      setResponse(fullResponse);
      completeResponseRef.current = fullResponse;
      console.log("Full response set:", fullResponse);
      setPrompt("");
      setChatHistory(prev => [
        ...prev,
        { prompt: trimmedPrompt, response: fullResponse, timestamp: new Date().toISOString() }
      ]);
      setFile(null);
    } catch (error) {
      toast.error(`Failed to get response: ${error instanceof Error ? error.message : "Unknown error"}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!response) return;

    setOutput("");
    const charsPerBatch = 5;
    const batchDelay = 12;
    const timeoutIds: NodeJS.Timeout[] = [];

    for (let i = 0; i < response.length; i += charsPerBatch) {
      const timeoutId = setTimeout(() => {
        setOutput(prev => prev + response.slice(i, Math.min(i + charsPerBatch, response.length)));
      }, Math.floor(i / charsPerBatch) * batchDelay);
      timeoutIds.push(timeoutId);
    }

    return () => timeoutIds.forEach(id => clearTimeout(id));
  }, [response]);

  return (
    <main className="flex flex-col items-center h-screen gap-4 mt-10 relative">
      <Toaster position="top-center" />
      <div className="absolute top-4 left-4">
        <Button variant="outline" onClick={() => setShowHistory(!showHistory)} aria-label="Toggle chat history">
          <History size={24} />
        </Button>
      </div>

      {showHistory && (
        <div className="absolute top-16 left-4 w-1/3 h-[80vh] bg-gray-100 p-4 overflow-y-auto shadow-lg z-10 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Chat History</h2>
            <Button variant="ghost" onClick={() => setShowHistory(false)} size="sm">✕</Button>
          </div>
          {chatHistory.length === 0 ? (
            <p className="text-gray-500 italic">No previous chats found.</p>
          ) : (
            <div className="space-y-4">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4 p-3 bg-white rounded-lg shadow">
                  <p className="font-medium text-sm text-gray-700">{new Date(chat.timestamp).toLocaleString()}</p>
                  <p className="font-semibold mt-1 mb-1">Q: {chat.prompt}</p>
                  <p className="text-sm text-gray-600">{chat.response.slice(0, 100)}...</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPrompt(chat.prompt);
                      setOutput(chat.response);
                      completeResponseRef.current = chat.response;
                      setShowHistory(false);
                    }}
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 items-center mb-5">
        <MessageCircleCode size="64" />
        <span className="text-3xl font-bold">Council</span>
      </div>

      <div className="flex gap-2 items-center w-full max-w-[700px]">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Type or speak your prompt"
            value={prompt}
            className={cn("w-full h-[50px] pr-24")}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex gap-2">
            {loading ? (
              <BeatLoader color="#000" size={8} />
            ) : (
              <Button variant="ghost" onClick={onSubmit} className="p-1">
                <Send size={20} />
              </Button>
            )}
            <Button variant="ghost" onClick={startListening} className="p-1" disabled={isListening}>
              <Mic size={20} color={isListening ? "red" : "black"} />
            </Button>
          </div>
        </div>
        <Input
          type="file"
          onChange={onFileChange}
          className="hidden"
          id="file-upload"
          accept=".txt,.pdf,.docx,.xlsx,.pptx,.html,.epub,.mobi,.azw,.azw3,.odt,.ods,.odp"
        />
        <Button
          variant="outline"
          className={cn("w-[40px] p-1")}
          onClick={() => document.getElementById("file-upload")?.click()}
          title="Upload a file"
        >
          <Upload className={cn("w-[20px]")} />
        </Button>
      </div>

      <div className="flex gap-3 items-center w-full max-w-[700px]">
        <Card className={cn("p-5 whitespace-normal w-full min-h-[150px] max-h-[400px] overflow-y-scroll")}>
          <div className={`${styles.textwrapper}`}>
            <Markdown className={cn("w-full h-full")}>{output}</Markdown>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          <Button variant="outline" className={cn("w-[40px] p-1")} onClick={copyToClipboard} title="Copy to clipboard">
            <Copy className={cn("w-[20px]")} />
          </Button>
          <Button variant="outline" className={cn("w-[40px] p-1")} onClick={downloadFile} title="Download as text file">
            <Download className={cn("w-[20px]")} />
          </Button>
          <Button
            variant={speaking ? "default" : "outline"}
            className={cn("w-[40px] p-1")}
            onClick={toggleSpeech}
            title={speaking ? "Stop speech" : "Text to speech"}
            disabled={!completeResponseRef.current || completeResponseRef.current === "The response will appear here..."}
          >
            <Volume2 className={cn("w-[20px]")} color={speaking ? "white" : "black"} />
          </Button>
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import toast, { Toaster } from "react-hot-toast";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "rive-react";
import { Label } from "@/components/ui/label";
import Confetti from 'react-canvas-confetti';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import styles from "@/styles/styles.module.css";
import "@/styles/LoginFormComponent.css";

export default function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [progress, setProgress] = useState(10);
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showMedal, setShowMedal] = useState(false);
  const inputRef = useRef(null);

  const fetchData = async () => {
    try {
      const markdown = await import(`@/data/${name}.d.ts`);
      setContent(markdown.data);
      setQuestion(markdown.data?.questions[0]);
    } catch (error) {
      toast.error("Error reading file");
    }
  };

  useEffect(() => {
    fetchData();
  }, [name]);

  const onSubmit = async () => {
    setIsQuizComplete(true);
    toast.success(
      `Based on the personality test, we are creating a response to diagnose ${name}`
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: `hello I have obtained a score of ${
            30 - score
          }/30 in ${name} related issue. Based on my performance, I would like a cure for ${name}. The lesser the score, the better the precautions and cure the person should take.`,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setResponse(data.text || "No response received, please try again.");
      
      // Show medal after a slight delay
      setTimeout(() => setShowMedal(true), 500);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (!response) return;
    setOutput("");
    [...response].forEach((char, i) =>
      setTimeout(() => setOutput((prev) => prev + char), i * 50)
    );
  }, [response]);

  const STATE_MACHINE_NAME = "Login Machine";

  const { rive: riveInstance, RiveComponent } = useRive({
    src: "/bear.riv",
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  });

  const trigSuccessInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigSuccess"
  );
  const trigFailInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigFail"
  );

  const onNext = () => {
    if (!chosen) {
      toast.error("Please select an option");
      return;
    }

    const questionsLength = content?.questions?.length || 1;
    const newProgress = ((count + 1) / questionsLength) * 100;
    setProgress(newProgress);
    
    const currentScore = parseInt(chosen.split("+")[1]);
    setScore(score + currentScore);

    if (question?.correctOption === chosen.split("+")[0]) {
      trigSuccessInput?.fire();
    } else {
      trigFailInput?.fire();
    }

    if (count + 1 >= content?.questions?.length) {
      setProgress(110); // Ensure we move to completion state
      onSubmit();
      return;
    }

    setCount(count + 1);
    setQuestion(content?.questions[count + 1]);
    setChosen(null);
  };

  const getMedal = () => {
    if (score >= 25) {
      return { src: "/gold-medal.png", text: "Excellent Performance! 🌟" };
    } else if (score >= 15) {
      return { src: "/silver-medal.png", text: "Great Effort! ✨" };
    } else {
      return { src: "/bronze-medal.png", text: "Keep Improving! 💪" };
    }
  };

  return (
    <div className="around">
      <Toaster />
      {progress < 110 ? (
        <>
          <RiveComponent className="rive-container" />
          <div className="flex flex-col mt-5 items-center h-screen gap-6">
            <Progress value={progress} className={cn("w-[60%]")} />
            <div className="w-[60%] flex justify-center">
              <h1 className="text-2xl font-bold">{question?.question}</h1>
            </div>
            <RadioGroup
              value={chosen || ""}
              onValueChange={(value) => setChosen(value)}
            >
              {question?.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`r${index}`} />
                  <Label htmlFor={`r${index}`}>{option.split("+")[0]}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={onNext}>
              {count + 1 >= (content?.questions?.length || 0) ? "Finish" : "Next"}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center h-screen gap-6 p-4">
          <AnimatePresence>
            <motion.h1 
              className="text-3xl mt-2 font-bold text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Quiz Complete!
            </motion.h1>
            
            <motion.div
              className="text-2xl font-semibold text-center text-blue-600"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              You scored {score} out of 30
            </motion.div>

            {showMedal && (
              <motion.div 
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.5
                }}
              >
                <Image 
                  src={getMedal().src} 
                  width={150} 
                  height={150} 
                  alt="Medal"
                  className="drop-shadow-xl"
                />
                <motion.p 
                  className="text-xl font-semibold text-center mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {getMedal().text}
                </motion.p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={() => {
                  setProgress(10);
                  setScore(0);
                  setCount(0);
                  setQuestion(content?.questions[0]);
                  setChosen(null);
                  setShowMedal(false);
                  setIsQuizComplete(false);
                  setResponse("");
                  setOutput("The response will appear here...");
                }}
                className="mt-4"
              >
                Try Again
              </Button>
            </motion.div>

            {isQuizComplete && <Confetti />}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <Card className={cn("p-5 whitespace-normal w-full md:w-[600px] mt-4")}>
                <Markdown>{output}</Markdown>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}





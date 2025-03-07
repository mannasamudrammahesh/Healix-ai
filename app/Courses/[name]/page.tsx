// @ts-nocheck
"use client";
import Confetti from '@/components/Confetti'; // Keep this one
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import {
  useRive,
  RiveState,
  useStateMachineInput,
  StateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "rive-react";
import styles from "@/styles/styles.module.css";
import "@/styles/LoginFormComponent.css";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const [content, setContent] = useState<any>();
  const [question, setQuestion] = useState<any>();
  const [progress, setProgress] = useState(0);
  const [inputLookMultiplier, setInputLookMultiplier] = useState(0);
  const inputRef = useRef(null);
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOutput("The response will appear here...");
    toast.success(
      "Based on the personality test we are creating a response to diagnose " +
        name
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: `hello I have obtained a score of ${
            30 - score
          }/${30} in ${name} related issue based on my performance I would like to get a cure for ${name} can you suggest me a path? The lesser the score the better the precautions and cure the person should take.`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!data.text) {
        toast.error("No response from the server, please try again");
        return;
      }

      // Format the response with headings and bullet points
      const formattedResponse = data.text
        .split("\n")
        .map((line) => line.replace(/\*\*([^*]+)\*\*/g, "$1").trim()) // Remove **
        .filter((line) => line) // Remove empty lines
        .map((line) => `- ${line}`) // Add bullet points
        .join("\n");

      setResponse(formattedResponse);
      setShowCelebration(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (response.length === 0) return;
    setOutput("");
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < response.length) {
        setOutput((prev) => prev + response[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 10);

    return () => clearInterval(typingInterval);
  }, [response]);

  const STATE_MACHINE_NAME = "Login Machine";

  const { rive: riveInstance, RiveComponent }: RiveState = useRive({
    src: "/bear.riv",
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  const trigSuccessInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigSuccess"
  );
  const trigFailInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigFail"
  );

  const readFile = async (name: string) => {
    const markdown = await import(`@/data/${name}.d.ts`);
    return markdown.data;
  };

  const onNext = () => {
    if (!chosen) {
      toast.error("Please select an option");
      return;
    }

    const currentScore = parseInt(chosen.split("+")[1]);
    setScore(score + currentScore);
    setCount(count + 1);
    setProgress(((count + 1) / content?.questions.length) * 100);

    if (question?.correctOption === chosen.split("+")[0]) {
      trigSuccessInput.fire();
    } else {
      trigFailInput.fire();
    }

    if (count + 1 < content?.questions.length) {
      setQuestion(content?.questions[count + 1]);
    } else {
      onSubmit();
    }

    setChosen(undefined);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const content = await readFile(name);
        setContent(content);
        setQuestion(content?.questions[0]);
      } catch (error) {
        toast.error("Error reading file");
      }
    };
    fetchData();
  }, [name]);

  useEffect(() => {
    if (inputRef?.current && !inputLookMultiplier) {
      setInputLookMultiplier(inputRef.current.offsetWidth / 100);
    }
  }, [inputRef]);

  const celebrationVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const getMedalInfo = () => {
    if (score > 20) return { type: "Gold", color: "text-yellow-500", src: "/icons/goldmedal.svg" };
    if (score > 10) return { type: "Silver", color: "text-gray-400", src: "/icons/silvermedal.svg" };
    return { type: "Bronze", color: "text-amber-600", src: "/icons/bronzemedal.svg" };
  };

  return (
    <div className="around">
      <Toaster />
      {progress < 100 ? (
        <>
          <div className="rive-container">
            <div className="rive-wrapper">
              <RiveComponent className="rive-container" />
            </div>
          </div>
          <div className="flex flex-col mt-5 items-center min-h-screen gap-6">
            <Progress value={progress} className={cn("w-[60%]")} />
            {question && (
              <>
                <div className="w-[60%] flex justify-center">
                  <h1 className="text-2xl font-bold text-center">{question.question}</h1>
                </div>
                <RadioGroup value={chosen} onValueChange={setChosen}>
                  {question.options?.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`r${index}`} />
                      <Label htmlFor={`r${index}`}>{option.split("+")[0]}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button onClick={onNext}>
                  {count === content?.questions.length - 1 ? "Finish" : "Next"}
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center min-h-screen gap-6 py-10"
          initial="hidden"
          animate="visible"
          variants={celebrationVariants}
        >
          <Confetti />
          <motion.h1 variants={itemVariants} className="text-3xl mt-2 font-bold">
            You scored {score} out of 30
          </motion.h1>

          <motion.div variants={itemVariants} className="flex items-center flex-col gap-5">
            <h1 className="text-2xl font-bold">
              Congratulations! You earned a{" "}
              <span className={`font-black ${getMedalInfo().color}`}>
                {getMedalInfo().type} Medal
              </span>
            </h1>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Image
                src={getMedalInfo().src}
                width={150}
                height={150}
                alt={`${getMedalInfo().type} medal`}
              />
            </motion.div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-xl font-bold mt-1">
            Based on the personality test, here's your diagnosis for{" "}
            <span className="text-red-500">{name}</span>
          </motion.h1>
          <motion.div variants={itemVariants}>
            <Card className={cn("p-5 whitespace-normal min-w-[320px] sm:w-[500px] md:min-w-[600px]")}>
              <div className={styles.textwrapper}>
                <Markdown className={cn("w-full h-full ")}>{output}</Markdown>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              onClick={() => {
                setProgress(0);
                setScore(0);
                setCount(0);
                setQuestion(content?.questions[0]);
                setShowCelebration(false);
                setResponse("");
                setOutput("The response will appear here...");
              }}
            >
              Restart Quiz
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

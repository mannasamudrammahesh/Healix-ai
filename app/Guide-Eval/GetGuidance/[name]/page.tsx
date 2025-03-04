"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import styles from '@/styles/styles.module.css';
import "@/styles/LoginFormComponent.css";

const quizQuestions = [
  {
    question: "How often do you experience this fear?",
    options: ["Rarely", "Sometimes", "Often", "Always"],
  },
  {
    question: "How intense is your fear reaction?",
    options: ["Mild", "Moderate", "Strong", "Extreme"],
  },
  {
    question: "Does this fear impact your daily life?",
    options: ["Not at all", "Slightly", "Moderately", "Severely"],
  },
];

export default function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: string[]) => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: `Based on these answers about ${name} phobia:
          1. Frequency: ${finalAnswers[0]}
          2. Intensity: ${finalAnswers[1]}
          3. Impact: ${finalAnswers[2]}
          Provide an analysis and possible coping strategies.`,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (!data.text) {
        toast.error("No response received from the server!");
        return;
      }

      setResult(data.text);
      setShowResult(true);
    } catch (error) {
      setLoading(false);
      toast.error("Network error. Please try again!");
    }
  };

  // Animation variants
  const medalVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg mx-auto"
      >
        {!showResult ? (
          <Card className="p-6 bg-white shadow-xl rounded-xl">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 capitalize text-gray-800">
              {name} Phobia Quiz
            </h1>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                  {quizQuestions[currentQuestion].question}
                </h2>
                <div className="grid gap-3">
                  {quizQuestions[currentQuestion].options.map((option) => (
                    <motion.div
                      key={option}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        variant={answers[currentQuestion] === option ? "default" : "outline"}
                        className="w-full py-3 text-sm md:text-base transition-colors duration-200"
                        onClick={() => handleAnswer(option)}
                        disabled={loading}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {loading && (
              <div className="mt-4 flex justify-center">
                <BeatLoader color="#3b82f6" size={10} />
              </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-600">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-white shadow-xl rounded-xl">
            <motion.div
              variants={medalVariants}
              initial="hidden"
              animate="visible"
              className="text-center"
            >
              <div className="text-6xl md:text-7xl mb-4">🏅</div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                Quiz Completed!
              </h1>
            </motion.div>
            
            <div className={cn(styles.textwrapper, "mt-4")}>
              <Markdown className="prose max-w-none text-gray-700 text-sm md:text-base">
                {result}
              </Markdown>
            </div>
            
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="mt-6"
            >
              <Button
                className="w-full py-3 text-sm md:text-base"
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setShowResult(false);
                  setResult("");
                }}
              >
                Take Quiz Again
              </Button>
            </motion.div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

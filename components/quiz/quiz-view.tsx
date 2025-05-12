// components/quiz/quiz-view.tsx
"use client";

import { useState, useTransition } from "react";
import { QuizData, QuizQuestion, QuizOption } from "@/actions/content.actions"; // Import types
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  ChevronsRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  ThumbsUp,
  Award,
} from "lucide-react";
import { submitQuizAnswers } from "@/actions/quiz.actions"; // We'll create this action properly later
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface QuizViewProps {
  quiz: QuizData;
}

// Helper type
type SelectedAnswersMap = {
  [questionId: string]: string;
};

// Define structure for submission results
interface QuizSubmissionResult {
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  results: Array<{
    questionId: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    isCorrect: boolean;
    explanation?: string | null;
    questionText: string;
    options: QuizOption[];
  }>;
  passed?: boolean;
  message?: string;
}

export default function QuizView({ quiz }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswersMap>(
    {}
  );
  const [quizFinished, setQuizFinished] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<QuizSubmissionResult | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  // Optional: State for immediate feedback per question
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState<
    boolean | null
  >(null);

  const currentQuestion: QuizQuestion | undefined =
    quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setShowImmediateFeedback(false);
    setIsCurrentAnswerCorrect(null);
  };

  // Optional: Immediate Feedback Logic
  const checkCurrentAnswer = () => {
    if (!currentQuestion) return;
    const selectedOptionId = selectedAnswers[currentQuestion.id];
    if (selectedOptionId) {
      const correct = selectedOptionId === currentQuestion.correctOptionId;
      setIsCurrentAnswerCorrect(correct);
      setShowImmediateFeedback(true);
      if (correct) {
        toast.success("That's right!", { icon: <ThumbsUp />, duration: 1500 });
      } else {
        toast.error("Not quite, but good try!", {
          icon: <XCircle />,
          duration: 1500,
        });
      }
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowImmediateFeedback(false);
      setIsCurrentAnswerCorrect(null);
    }
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(selectedAnswers).length !== totalQuestions) {
      toast.warning("Please answer all questions before submitting.", {
        duration: 3000,
        description: "Make sure you've selected an answer for every question.",
      });
      return;
    }

    startSubmitTransition(async () => {
      toast.info("Submitting your answers...", {
        id: "submitting-toast",
        duration: 10000,
      });

      const serverResult = await submitQuizAnswers(quiz.id, selectedAnswers);

      if (serverResult.error || !serverResult.data) {
        toast.error(
          serverResult.error || "Failed to submit quiz. Please try again.",
          {
            id: "submitting-toast",
            duration: 5000,
          }
        );
        setSubmissionResult(null);
      } else {
        setSubmissionResult(serverResult.data);
        toast.success(serverResult.data.message || "Quiz results are in!", {
          id: "submitting-toast",
          duration: 4000,
        });

        if (serverResult.data.passed) {
          const confettiDefaults = {
            spread: 90,
            ticks: 50,
            gravity: 0.8,
            decay: 0.94,
            startVelocity: 30,
            colors: [
              "#6366f1",
              "#a855f7",
              "#ec4899",
              "#f59e0b",
              "#22c55e",
              "#ef4444",
            ],
          };

          function shootConfetti() {
            confetti({
              ...confettiDefaults,
              particleCount: 80,
              scalar: 1.2,
              shapes: ["star"],
            });

            confetti({
              ...confettiDefaults,
              particleCount: 30,
              scalar: 0.75,
              shapes: ["circle"],
            });
          }

          setTimeout(shootConfetti, 0);
          setTimeout(shootConfetti, 100);
          setTimeout(shootConfetti, 200);
        }
        setQuizFinished(true);
      }
    });
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setSubmissionResult(null);
    setShowImmediateFeedback(false);
    setIsCurrentAnswerCorrect(null);
  };

  const progressPercentage =
    totalQuestions > 0
      ? (Object.keys(selectedAnswers).length / totalQuestions) * 100
      : 0;

  if (!currentQuestion && !quizFinished) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-muted-foreground">
          Loading quiz question...
        </p>
        {/* Add a spinner here later */}
      </div>
    );
  }

  // --- QUIZ FINISHED - DISPLAY RESULTS ---
  if (quizFinished && submissionResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-4 md:p-8 w-full max-w-3xl mx-auto" // Increased max-width for results
      >
        <Card className="shadow-2xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-800 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl">
          <CardHeader className="text-center pb-6">
            {submissionResult.passed ? (
              <Award className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            ) : (
              <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            )}
            <CardTitle className="text-3xl md:text-4xl font-bold">
              {submissionResult.passed ? "Awesome Job!" : "Keep Practicing!"}
            </CardTitle>
            <CardDescription className="text-lg md:text-xl mt-2">
              You scored{" "}
              <span className="font-bold text-primary">
                {submissionResult.correctAnswers}/
                {submissionResult.totalQuestions}
              </span>{" "}
              ({submissionResult.scorePercentage}%)
            </CardDescription>
            {submissionResult.passed !== undefined && (
              <span
                className={`text-xl font-semibold mt-1 ${
                  submissionResult.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {submissionResult.passed ? "You Passed!" : "Needs Improvement"}
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-6 px-4 md:px-8 py-6 max-h-[60vh] overflow-y-auto">
            {" "}
            {/* Scrollable results */}
            {submissionResult.results.map((res, index) => (
              <motion.div
                key={res.questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`p-4 border-l-4 rounded-md shadow ${
                  res.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                    : "border-red-500 bg-red-50 dark:bg-red-900/30"
                }`}
              >
                <p className="font-medium text-lg mb-2 text-slate-800 dark:text-slate-100">
                  Q{index + 1}: {res.questionText}
                </p>
                <ul className="space-y-1 text-sm list-none pl-0">
                  {" "}
                  {/* Changed to list-none */}
                  {res.options.map((opt) => (
                    <li
                      key={opt.id}
                      className={`flex items-center p-2 rounded
                                                ${
                                                  opt.id === res.correctOptionId
                                                    ? "text-green-700 dark:text-green-300 font-semibold"
                                                    : "text-slate-600 dark:text-slate-300"
                                                }
                                                ${
                                                  opt.id ===
                                                    res.selectedOptionId &&
                                                  !res.isCorrect
                                                    ? "text-red-700 dark:text-red-400 line-through bg-red-100 dark:bg-red-900/40"
                                                    : ""
                                                }
                                                ${
                                                  opt.id ===
                                                    res.selectedOptionId &&
                                                  res.isCorrect
                                                    ? "bg-green-100 dark:bg-green-900/40"
                                                    : ""
                                                }
                                                `}
                    >
                      {opt.id === res.selectedOptionId && res.isCorrect && (
                        <CheckCircle className="inline-block mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {opt.id === res.selectedOptionId && !res.isCorrect && (
                        <XCircle className="inline-block mr-2 h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      {
                        !selectedAnswers[res.questionId] &&
                          opt.id === res.correctOptionId && (
                            <CheckCircle className="inline-block mr-2 h-5 w-5 text-green-500 opacity-50 flex-shrink-0" />
                          ) /* Show correct if unanswered */
                      }
                      {
                        selectedAnswers[res.questionId] !== opt.id &&
                          opt.id === res.correctOptionId && (
                            <CheckCircle className="inline-block mr-2 h-5 w-5 text-green-500 opacity-50 flex-shrink-0" />
                          ) /* Show correct if answered wrong */
                      }
                      <span className="ml-1">{opt.text}</span>
                    </li>
                  ))}
                </ul>
                {res.explanation && !res.isCorrect && (
                  <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900/30 rounded italic">
                    💡 Explanation: {res.explanation}
                  </p>
                )}
                {res.explanation && res.isCorrect && (
                  <p className="mt-3 text-xs text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/30 rounded italic">
                    👍 Explanation: {res.explanation}
                  </p>
                )}
              </motion.div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 p-6 mt-4">
            <Button
              onClick={resetQuiz}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-3"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Link href="/kid/quizzes" passHref className="w-full sm:w-auto">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700 px-8 py-3"
              >
                <BookOpen className="mr-2 h-4 w-4" /> More Quizzes
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // --- QUIZ IN PROGRESS - DISPLAY CURRENT QUESTION ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 md:p-8 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{
            opacity: 0,
            x: currentQuestionIndex > 0 ? 100 : -100,
            scale: 0.9,
          }} // Start further out for slide
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }} // Exit to left
          transition={{
            duration: 0.4,
            type: "spring",
            stiffness: 100,
            damping: 15,
          }} // Springier transition
          className="w-full"
        >
          <Card className="w-full max-w-xl shadow-2xl mx-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-800 dark:via-purple-900 dark:to-pink-900 border-2 border-purple-300 dark:border-purple-600 rounded-3xl">
            {" "}
            {/* More rounded, playful gradient */}
            <CardHeader className="pb-4 items-center">
              {" "}
              {/* Centered items */}
              <p className="text-md font-semibold text-purple-700 dark:text-purple-300">
                Question {currentQuestionIndex + 1}{" "}
                <span className="text-slate-500 dark:text-slate-400">
                  / {totalQuestions}
                </span>
              </p>
              <Progress
                value={progressPercentage}
                className="w-3/4 mt-2 h-4 rounded-full bg-purple-200 dark:bg-purple-800 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-purple-600 shadow-inner"
              />
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-8">
              {" "}
              {/* Increased spacing */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-center text-slate-800 dark:text-slate-100 min-h-[8rem] flex items-center justify-center p-2"
              >
                {currentQuestion?.text}
              </motion.p>
              <RadioGroup
                value={selectedAnswers[currentQuestion!.id] || ""}
                onValueChange={(optionId) =>
                  handleOptionSelect(currentQuestion!.id, optionId)
                }
                className="space-y-4"
              >
                {currentQuestion?.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.25 + index * 0.08,
                      type: "spring",
                      stiffness: 120,
                    }}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={`${currentQuestion!.id}-${option.id}`}
                      className="sr-only peer"
                    />
                    <Label
                      htmlFor={`${currentQuestion!.id}-${option.id}`}
                      className={`flex items-center justify-start p-4 md:p-5 border-2 rounded-xl text-md md:text-lg font-medium cursor-pointer transition-all duration-200 ease-in-out shadow-sm
                                 hover:border-purple-500 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                                 peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:dark:border-purple-400 peer-data-[state=checked]:ring-4 peer-data-[state=checked]:ring-purple-500/50 peer-data-[state=checked]:bg-purple-100 dark:peer-data-[state=checked]:bg-purple-700/30
                                 dark:border-slate-700 dark:hover:border-purple-500 text-slate-700 dark:text-slate-200 
                                 bg-white dark:bg-slate-800/80 
                                 `}
                    >
                      <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">
                        {String.fromCharCode(65 + index)} {/* A, B, C labels */}
                      </span>
                      {option.text}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 border-t mt-4 space-y-3 sm:space-y-0">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => alert("Previous Question: Not implemented yet")}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                className="w-full sm:w-auto text-muted-foreground hover:text-primary"
              >
                Back
              </Button>
              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  size="lg"
                  onClick={goToNextQuestion}
                  disabled={
                    !selectedAnswers[currentQuestion!.id] || isSubmitting
                  }
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/50"
                >
                  Next Question <ChevronsRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleSubmitQuiz}
                  disabled={
                    isSubmitting ||
                    Object.keys(selectedAnswers).length !== totalQuestions
                  }
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/50"
                >
                  {isSubmitting ? "Submitting..." : "Finish & See Score"}{" "}
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

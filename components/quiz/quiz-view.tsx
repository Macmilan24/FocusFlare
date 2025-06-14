// FILE: components/quiz/quiz-view.tsx

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Award,
  ThumbsUp,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";

import type { QuizData, QuizQuestion } from "@/actions/content.actions";
import type { QuizSubmissionResult } from "@/actions/quiz.actions";
import { submitQuizAnswers } from "@/actions/quiz.actions";
import { refreshClientSession } from "@/actions/auth.actions";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Define the letter badges for answer options
const letterBadges = ["A", "B", "C", "D", "E"];

interface QuizViewProps {
  quiz: QuizData;
  courseId?: string | null;
}

export default function QuizView({ quiz, courseId }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<QuizSubmissionResult | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  const totalQuestions = quiz.questions.length;
  const currentQuestion: QuizQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (showFeedback || isSubmitting) return;

    const newSelectedAnswers = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(newSelectedAnswers);
    setShowFeedback(true);

    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    setTimeout(() => {
      if (isLastQuestion) {
        // --- SUBMIT THE QUIZ ---
        startSubmitTransition(async () => {
          toast.info("Submitting your answers...", { id: "submitting-toast" });
          const serverResult = await submitQuizAnswers(
            quiz.id,
            newSelectedAnswers
          );

          if (serverResult.error || !serverResult.data) {
            toast.error(serverResult.error || "Failed to submit quiz.", {
              id: "submitting-toast",
            });
            return;
          }

          setSubmissionResult(serverResult.data);
          setQuizCompleted(true);
          toast.success(serverResult.data.message || "Quiz results are in!", {
            id: "submitting-toast",
          });

          if (serverResult.data.passed) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
          if (serverResult.data.awardedBadge) {
            toast.success(
              `🎉 Badge Unlocked: ${serverResult.data.awardedBadge.name}!`,
              {
                description: serverResult.data.awardedBadge.description,
                icon: <Award className="h-5 w-5 text-yellow-500" />,
              }
            );
          }
          if (serverResult.data.newTotalPoints !== undefined) {
            await refreshClientSession({
              points: serverResult.data.newTotalPoints,
            });
          }
        });
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowFeedback(false);
      }
    }, 1500); // Wait 1.5 seconds before moving on or submitting
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowFeedback(false);
    setQuizCompleted(false);
    setSubmissionResult(null);
  };

  const getResultMessage = (score: number) => {
    if (score >= 80) return "Amazing Job!";
    if (score >= 60) return "Great Work!";
    return "Good Effort!";
  };

  const backLinkHref = courseId ? `/kid/courses/${courseId}` : "/kid/quizzes";
  const backLinkText = courseId ? "Back to Course" : "More Quizzes";
  const backLinkTextInline = courseId ? "Back to Course" : "Back to Quizzes";

  // --- RESULTS VIEW ---
  if (quizCompleted && submissionResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 flex items-center justify-center"
      >
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                {submissionResult.passed ? (
                  <Award className="h-16 w-16 text-yellow-500" />
                ) : (
                  <ThumbsUp className="h-16 w-16 text-blue-500" />
                )}
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                {getResultMessage(submissionResult.scorePercentage)}
              </CardTitle>
              <p className="text-lg mt-2">
                You scored{" "}
                <span className="font-bold text-purple-600">
                  {submissionResult.correctAnswers}/
                  {submissionResult.totalQuestions}
                </span>{" "}
                ({submissionResult.scorePercentage}%)
              </p>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                {submissionResult.results.map((result, index) => (
                  <div
                    key={result.questionId}
                    className={`p-4 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } border-b last:border-b-0`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium mb-1">
                          {index + 1}. {result.questionText}
                        </p>
                        <p
                          className={`text-sm ${
                            result.isCorrect
                              ? "text-green-700"
                              : "text-red-700 line-through"
                          }`}
                        >
                          Your answer:{" "}
                          {result.options.find(
                            (o) => o.id === result.selectedOptionId
                          )?.text || "Not answered"}
                        </p>
                        {!result.isCorrect && (
                          <p className="text-sm text-green-700">
                            Correct:{" "}
                            {
                              result.options.find(
                                (o) => o.id === result.correctOptionId
                              )?.text
                            }
                          </p>
                        )}
                        {result.explanation && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
              <Button
                onClick={resetQuiz}
                className="w-full sm:w-1/2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Link href={backLinkHref} className="w-full sm:w-1/2">
                <Button className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white">
                  <BookOpen className="mr-2 h-4 w-4" /> {backLinkText}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    );
  }

  // --- QUESTION VIEW ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <>
            <CardHeader className="bg-white border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="pt-6 pb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-center mb-6 min-h-[6rem] flex items-center justify-center">
                    {currentQuestion.text}
                  </h2>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected =
                        selectedAnswers[currentQuestion.id] === option.id;
                      const isCorrect =
                        option.id === currentQuestion.correctOptionId;
                      const showCorrect = showFeedback && isCorrect;
                      const showIncorrect =
                        showFeedback && isSelected && !isCorrect;

                      return (
                        <Button
                          key={option.id}
                          variant="outline"
                          className={`w-full text-left justify-start h-auto py-4 px-4 text-base font-medium transition-all ${
                            showCorrect
                              ? "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500"
                              : showIncorrect
                              ? "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-500"
                              : isSelected
                              ? "ring-2 ring-purple-500"
                              : ""
                          }`}
                          onClick={() =>
                            handleAnswerSelect(currentQuestion.id, option.id)
                          }
                          disabled={showFeedback || isSubmitting}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                showCorrect
                                  ? "bg-green-500 text-white"
                                  : showIncorrect
                                  ? "bg-red-500 text-white"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {letterBadges[index]}
                            </div>
                            <span>{option.text}</span>
                            {showCorrect && (
                              <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                            )}
                            {showIncorrect && (
                              <XCircle className="ml-auto h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  {isSubmitting && (
                    <div className="mt-4 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Submitting...
                    </div>
                  )}
                </CardContent>
              </motion.div>
            </AnimatePresence>
          </>
        </Card>
        <div className="mt-6 text-center">
          <Link
            href={backLinkHref}
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />{" "}
            {backLinkTextInline}
          </Link>
        </div>
      </div>
    </div>
  );
}

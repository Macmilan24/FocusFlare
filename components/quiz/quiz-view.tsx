"use client";
import { useState, useEffect, useTransition, useCallback } from "react";
import { QuizData, QuizQuestion, QuizOption } from "@/actions/content.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  ChevronsRight,
  Send,
  RotateCcw,
  BookOpen,
  Sparkles,
  ThumbsUp,
  Award,
  HelpCircle,
} from "lucide-react";
import { submitQuizAnswers } from "@/actions/quiz.actions";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface QuizViewProps {
  quiz: QuizData;
}

type SelectedAnswersMap = {
  [questionId: string]: string;
};

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
  quizTitle?: string;
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

  const [feedbackForQuestionId, setFeedbackForQuestionId] = useState<
    string | null
  >(null); // Track which question's feedback is active
  const [feedbackOptionId, setFeedbackOptionId] = useState<string | null>(null);
  const [isCorrectForFeedback, setIsCorrectForFeedback] = useState<
    boolean | null
  >(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const currentQuestion: QuizQuestion | undefined =
    quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const performSubmitQuiz = useCallback(() => {
    startSubmitTransition(async () => {
      toast.info("Calculating your score...", {
        id: "submitting-toast",
        duration: 10000,
      });
      const serverResult = await submitQuizAnswers(quiz.id, selectedAnswers);
      if (serverResult.error || !serverResult.data) {
        toast.error(
          serverResult.error || "Failed to submit quiz. Please try again.",
          { id: "submitting-toast", duration: 5000 }
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
            spread: 120,
            ticks: 70,
            gravity: 0.9,
            decay: 0.92,
            startVelocity: 35,
            origin: { y: 0.6 },
            colors: [
              "#6366f1",
              "#a855f7",
              "#ec4899",
              "#f59e0b",
              "#22c55e",
              "#ef4444",
            ],
          };
          const shootConfetti = () => {
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
          };
          setTimeout(shootConfetti, 0);
          setTimeout(shootConfetti, 150);
          setTimeout(shootConfetti, 300);
        }
        setQuizFinished(true);
      }
    });
  }, [quiz.id, selectedAnswers, startSubmitTransition]); // Added dependencies for useCallback

  const goToNextQuestion = useCallback(() => {
    // Always clear feedback states for the *previous* question before advancing or submitting
    setFeedbackOptionId(null);
    setIsCorrectForFeedback(null);
    setFeedbackForQuestionId(null);
    setIsAdvancing(false); // Mark advancing as complete

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // This is the last question.
      // The answer for the current (last) question would have just been set in selectedAnswers
      // by handleOptionSelect before this function was called via setTimeout.
      if (selectedAnswers[currentQuestion!.id]) {
        performSubmitQuiz(); // Call the submission logic
      } else {
        // This should not happen if handleOptionSelect forces a selection
        // but as a fallback, if somehow the last question wasn't answered.
        setIsAdvancing(false); // Re-enable interaction if submission doesn't happen
        toast.error("Please select an answer for the last question.", {
          duration: 3000,
        });
      }
    }
  }, [
    currentQuestionIndex,
    totalQuestions,
    performSubmitQuiz,
    selectedAnswers,
    currentQuestion,
  ]);

  const handleOptionSelect = useCallback(
    (questionId: string, optionId: string) => {
      if (isAdvancing || quizFinished || feedbackForQuestionId === questionId)
        return;

      // Update selectedAnswers FIRST so it's available for goToNextQuestion's logic
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));

      const correct = optionId === currentQuestion?.correctOptionId;
      setIsCorrectForFeedback(correct);
      setFeedbackOptionId(optionId);
      setFeedbackForQuestionId(questionId);

      if (correct) {
        toast.success("That's right!", {
          icon: <ThumbsUp className="text-green-500" />,
          duration: 1200,
        });
      } else {
        toast.error("Not quite!", {
          icon: <XCircle className="text-red-500" />,
          duration: 1800,
        });
      }

      setIsAdvancing(true); // Set advancing flag
      setTimeout(
        () => {
          goToNextQuestion();
        },
        correct ? 1500 : 2200
      );
    },
    [
      isAdvancing,
      quizFinished,
      feedbackForQuestionId,
      currentQuestion,
      goToNextQuestion,
    ]
  ); // Added currentQuestion to deps

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setSubmissionResult(null);
    setFeedbackOptionId(null);
    setIsAdvancing(false);
  };

  // Progress based on questions *attempted* or *current index*
  const questionsAttempted = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  if (!currentQuestion && !quizFinished) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-muted-foreground">Loading quiz...</p>
        {/* Add a spinner here later: e.g. <Spinner size="lg" /> */}
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
        className="p-4 md:p-8 w-full max-w-3xl mx-auto"
      >
        <Card className="shadow-2xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950 rounded-2xl">
          <CardHeader className="text-center pb-6 items-center">
            {submissionResult.passed ? (
              <Award className="h-20 w-20 mx-auto text-yellow-400 mb-3 animate-pulse" />
            ) : (
              <HelpCircle className="h-20 w-20 mx-auto text-blue-400 mb-3" />
            )}
            <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
              {submissionResult.quizTitle || quiz.title}:{" "}
              {submissionResult.passed ? "Amazing Job!" : "Good Effort!"}
            </CardTitle>
            <CardDescription className="text-lg md:text-xl mt-2 text-slate-700 dark:text-slate-300">
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
                  submissionResult.passed ? "text-green-500" : "text-orange-500"
                }`}
              >
                {submissionResult.passed ? "You Passed!" : "Keep Practicing!"}
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-6 px-4 md:px-8 py-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {submissionResult.results.map((res, index) => (
              <motion.div
                key={res.questionId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.15,
                  duration: 0.4,
                  ease: "circOut",
                }}
                className={`p-4 border-l-4 rounded-lg shadow-md ${
                  res.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/40"
                    : "border-red-500 bg-red-50 dark:bg-red-900/40"
                }`}
              >
                <p className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-100">
                  Q{index + 1}: {res.questionText}
                </p>
                <ul className="space-y-2 text-sm list-none pl-0">
                  {res.options.map((opt) => (
                    <li
                      key={opt.id}
                      className={`flex items-center p-2.5 rounded-md transition-colors
                                                ${
                                                  opt.id === res.correctOptionId
                                                    ? "text-green-700 dark:text-green-300 font-bold bg-green-100 dark:bg-green-800/50"
                                                    : "text-slate-600 dark:text-slate-300"
                                                }
                                                ${
                                                  opt.id ===
                                                    res.selectedOptionId &&
                                                  !res.isCorrect
                                                    ? "text-red-700 dark:text-red-400 line-through bg-red-100 dark:bg-red-800/50"
                                                    : ""
                                                }
                                                ${
                                                  opt.id ===
                                                    res.selectedOptionId &&
                                                  res.isCorrect
                                                    ? "bg-green-100 dark:bg-green-800/50"
                                                    : ""
                                                }
                                                `}
                    >
                      {opt.id === res.correctOptionId && (
                        <CheckCircle className="inline-block mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {opt.id === res.selectedOptionId && !res.isCorrect && (
                        <XCircle className="inline-block mr-2 h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      {opt.id === res.correctOptionId &&
                        opt.id !== res.selectedOptionId && (
                          <CheckCircle className="inline-block mr-2 h-5 w-5 text-green-500 opacity-60 flex-shrink-0" />
                        )}
                      <span className="ml-1">{opt.text}</span>
                    </li>
                  ))}
                </ul>
                {res.explanation && (
                  <p
                    className={`mt-3 text-xs p-2 rounded italic ${
                      res.isCorrect
                        ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/30"
                        : "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30"
                    }`}
                  >
                    💡 Explanation: {res.explanation}
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
              className="w-full sm:w-auto px-8 py-3 text-lg hover:bg-muted/50"
            >
              <RotateCcw className="mr-2 h-5 w-5" /> Try Again
            </Button>
            <Link href="/kid/quizzes" passHref className="w-full sm:w-auto">
              <Button
                variant="default"
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
              >
                <BookOpen className="mr-2 h-5 w-5" /> More Quizzes
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // --- QUIZ IN PROGRESS - DISPLAY CURRENT QUESTION ---
  return (
    <div className="flex flex-col items-center justify-start pt-10 md:pt-16 min-h-[calc(100vh-100px)] p-4 md:p-8 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex} // Key change triggers animation
          initial={{
            opacity: 0,
            x: currentQuestionIndex > 0 ? 100 : -100,
            scale: 0.95,
          }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.95 }}
          transition={{
            duration: 0.35,
            type: "spring",
            stiffness: 90,
            damping: 16,
          }}
          className="w-full"
        >
          <Card className="w-full max-w-xl lg:max-w-2xl shadow-2xl mx-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-purple-900/50 dark:to-pink-900/50 border-2 border-purple-200 dark:border-purple-700 rounded-3xl">
            <CardHeader className="pb-4 pt-6 items-center">
              <p className="text-md font-semibold text-purple-700 dark:text-purple-300 tracking-wider">
                QUESTION {currentQuestionIndex + 1}{" "}
                <span className="text-slate-500 dark:text-slate-400">
                  OF {totalQuestions}
                </span>
              </p>
              <Progress
                value={((currentQuestionIndex + 1) / totalQuestions) * 100}
                className="w-3/4 mt-3 h-4 rounded-full bg-purple-100 dark:bg-purple-800/70 [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-purple-600 shadow-inner"
              />
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6 md:space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-center text-slate-800 dark:text-slate-100 min-h-[6rem] sm:min-h-[8rem] flex items-center justify-center p-2"
              >
                {currentQuestion?.text}
              </motion.p>

              <div className="space-y-3 md:space-y-4">
                {currentQuestion?.options.map((option, index) => {
                  // Determine if this specific option is the one for which feedback is being shown
                  const isThisOptionShowingFeedback =
                    feedbackForQuestionId === currentQuestion.id &&
                    feedbackOptionId === option.id;
                  // Determine if this option was the selected one for the current question
                  const isThisOptionSelected =
                    selectedAnswers[currentQuestion.id] === option.id;

                  return (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.3 + index * 0.08,
                        type: "spring",
                        stiffness: 100,
                        damping: 12,
                      }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() =>
                          handleOptionSelect(currentQuestion!.id, option.id)
                        }
                        // Disable if advancing, or if quiz is finished, or if feedback is shown for THIS question (meaning an answer was already processed)
                        disabled={
                          isAdvancing ||
                          quizFinished ||
                          feedbackForQuestionId === currentQuestion.id
                        }
                        className={`w-full flex items-center justify-start p-4 md:p-5 border-2 rounded-xl text-md md:text-lg font-medium cursor-pointer transition-all duration-150 ease-in-out shadow hover:shadow-md
                                   active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
                                   ${
                                     isThisOptionShowingFeedback // If feedback is active for this option
                                       ? isCorrectForFeedback
                                         ? "!bg-green-100 dark:!bg-green-600/40 !border-green-500 !ring-2 !ring-green-500 dark:!text-green-100 !text-green-700"
                                         : "!bg-red-100 dark:!bg-red-600/40 !border-red-500 !ring-2 !ring-red-500 dark:!text-red-100 !text-red-700"
                                       : isThisOptionSelected &&
                                         feedbackForQuestionId !==
                                           currentQuestion.id // If selected, but feedback is not for this question (i.e., fresh question)
                                       ? "border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/70 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200"
                                       : "bg-card hover:bg-muted/30 dark:border-slate-700 dark:hover:border-purple-600 text-slate-700 dark:text-slate-200"
                                   }`}
                      >
                        <span
                          className={`mr-3 flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold transition-colors
                                        ${
                                          isThisOptionShowingFeedback &&
                                          isCorrectForFeedback
                                            ? "border-green-600 bg-green-600 text-white dark:border-green-400 dark:bg-green-400 dark:text-slate-900"
                                            : isThisOptionShowingFeedback &&
                                              !isCorrectForFeedback
                                            ? "border-red-500 bg-red-500 text-white dark:border-red-400 dark:bg-red-400 dark:text-slate-900"
                                            : isThisOptionSelected &&
                                              feedbackForQuestionId !==
                                                currentQuestion.id
                                            ? "border-purple-600 bg-purple-600 text-white dark:border-purple-400 dark:bg-purple-400 dark:text-slate-900"
                                            : "border-muted-foreground text-muted-foreground"
                                        }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-left">{option.text}</span>
                        {isThisOptionShowingFeedback &&
                          (isCorrectForFeedback ? (
                            <CheckCircle className="ml-auto h-7 w-7 text-green-500" />
                          ) : (
                            <XCircle className="ml-auto h-7 w-7 text-red-500" />
                          ))}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>

            <CardFooter className="flex justify-center p-6 border-t mt-6">
              <p className="text-xs text-muted-foreground">
                {currentQuestionIndex === totalQuestions - 1 &&
                !feedbackForQuestionId &&
                selectedAnswers[currentQuestion!.id]
                  ? "This is the last question! Your answer will submit the quiz."
                  : !feedbackForQuestionId &&
                    !selectedAnswers[currentQuestion!.id]
                  ? "Select an answer."
                  : isAdvancing
                  ? "Moving to next question..."
                  : "Select an answer."}
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

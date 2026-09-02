"use client";

import { useEffect, useState, useRef } from "react";
import { generatePracticeQuiz, type GeneratePracticeQuizOutput } from "@/ai/flows/generate-practice-quiz";
import { useTutorContent, type Content } from "./tutor-content-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ClipboardCheck, Timer, CheckCircle, XCircle, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type QuizState = "setup" | "loading" | "active" | "finished";
type Question = GeneratePracticeQuizOutput["quiz"][0];

export function PracticeTab() {
  const { content: availableContent } = useTutorContent();
  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [numQuestions, setNumQuestions] = useState("10");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContentId) return;

    setQuizState("loading");
    setError(null);
    const content = availableContent.find((c) => c.id === selectedContentId);
    if (!content) {
      setError("Content not found.");
      setQuizState("setup");
      return;
    }
    setSelectedContent(content);

    try {
      const result = await generatePracticeQuiz({
        content: content.fullText,
        numQuestions: numQuestions as "10" | "20" | "30",
      });
      const quizQuestions = result.quiz || [];
      setQuestions(quizQuestions);
      setUserAnswers(new Array(quizQuestions.length).fill(null));
      setTimeLeft(quizQuestions.length * 60);
      setCurrentQuestionIndex(0);
      setQuizState("active");
    } catch (e) {
      console.error(e);
      setError("Failed to generate quiz. Please try again.");
      setQuizState("setup");
    }
  };

  useEffect(() => {
    if (quizState === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft <= 0 && quizState === "active") {
      if (timerRef.current) clearInterval(timerRef.current);
      finishQuiz();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState, timeLeft]);

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const finishQuiz = () => {
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (q.answer === userAnswers[index]) correctAnswers++;
    });
    setScore(correctAnswers);
    setQuizState("finished");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const restartQuiz = () => {
    setQuizState("setup");
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(0);
  };

  if (quizState === "setup" || quizState === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <Card className="max-w-2xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Quiz Setup</CardTitle>
            <CardDescription>Select your content and number of questions to start.</CardDescription>
          </CardHeader>
          <form onSubmit={handleStartQuiz}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentId">Content</Label>
                <Select onValueChange={setSelectedContentId} disabled={availableContent.length === 0}>
                  <SelectTrigger id="contentId">
                    <SelectValue placeholder="Select content..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContent.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <RadioGroup value={numQuestions} onValueChange={setNumQuestions} className="flex gap-4">
                  {["10", "20", "30"].map((val) => (
                    <div key={val} className="flex items-center space-x-2">
                      <RadioGroupItem value={val} id={`q-${val}`} />
                      <Label htmlFor={`q-${val}`}>{val}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {availableContent.length === 0 && (
                <p className="text-sm text-muted-foreground">Your library is empty. Add content in the "Library" tab first.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={quizState === "loading" || !selectedContentId} className="w-full">
                {quizState === "loading" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                )}
                Start Quiz
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  if (quizState === "active" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = (userAnswers.filter((a) => a !== null).length / questions.length) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
        <aside className="w-full space-y-4">
          <h3 className="font-semibold text-lg">Questions</h3>
          <ScrollArea className="h-96 pr-4">
            <div className="flex flex-col gap-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? "default" : userAnswers[index] !== null ? "secondary" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setCurrentQuestionIndex(index)}
                  type="button"
                >
                  Question {index + 1}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <main className="max-w-4xl mx-auto w-full space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quiz in Progress</CardTitle>
                <CardDescription>{selectedContent?.title}</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Timer className="h-5 w-5" />
                <span>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-6" />
              <div className="space-y-4">
                <p className="font-semibold text-lg">
                  {currentQuestionIndex + 1}. {currentQuestion.question}
                </p>
                <RadioGroup value={userAnswers[currentQuestionIndex] ?? undefined} onValueChange={handleAnswerChange} className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted has-[[data-state=checked]]:border-primary transition-colors"
                    >
                      <RadioGroupItem value={option} id={`q-${currentQuestionIndex}-o-${index}`} />
                      <Label htmlFor={`q-${currentQuestionIndex}-o-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNextQuestion} className="ml-auto" type="button">
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (quizState === "finished") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col gap-6 items-center">
        <div className="grid md:grid-cols-2 gap-6 w-full">
          <Card className="w-full text-center h-fit">
            <CardHeader>
              <CardTitle>Your Score</CardTitle>
              <CardDescription>Results for "{selectedContent?.title}"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={cn(
                  "text-6xl font-bold",
                  percentage >= 70 ? "text-chart-2" : percentage >= 40 ? "text-accent" : "text-destructive"
                )}
              >
                {percentage}%
              </div>
              <div className="flex justify-around">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-chart-2" /> Correct: {score}
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" /> Incorrect: {questions.length - score}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={restartQuiz} className="w-full" type="button">
                <CornerDownLeft className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Review Your Answers</h3>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {questions.map((q, index) => {
                  const userAnswer = userAnswers[index];
                  const isCorrect = q.answer === userAnswer;
                  return (
                    <Card key={index} className={cn("w-full", isCorrect ? "border-chart-2" : "border-destructive")}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-start gap-2">
                          <span>
                            {index + 1}. {q.question}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-chart-2 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive shrink-0" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>
                          Your answer: <span className={cn("font-semibold", !isCorrect && "text-destructive")}>{userAnswer || "Not answered"}</span>
                        </p>
                        {!isCorrect && (
                          <p>
                            Correct answer: <span className="font-semibold text-chart-2">{q.answer}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-[400px]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading quiz...</p>
    </div>
  );
}

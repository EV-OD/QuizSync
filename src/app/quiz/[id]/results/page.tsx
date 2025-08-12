
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, Award, FileText, Check, X } from "lucide-react";
import Header from "@/components/header";
import { useQuizState } from "@/hooks/use-quiz-state";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResultsPage() {
  const { lastResult } = useQuizState();
  const router = useRouter();

  // If the user navigates directly to this page without a result, redirect them.
  useEffect(() => {
    if (lastResult === null) {
      router.replace('/');
    }
  }, [lastResult, router]);


  if (!lastResult) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  const { score, total, questions, answers } = lastResult;
  const percentage = total > 0 ? (score / total) * 100 : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
              <Award className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="font-headline text-3xl mt-4">Quiz Completed!</CardTitle>
            <CardDescription>
              You have successfully submitted the quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">Your Score</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-bold font-headline text-primary">{score}</span>
              <span className="text-2xl text-muted-foreground">/ {total}</span>
            </div>
             <div className="w-full bg-muted rounded-full h-4 dark:bg-zinc-800">
                <div className="bg-primary h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <p className="text-xl font-medium">{percentage.toFixed(0)}% Correct</p>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="flex w-full gap-2">
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                   <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Review Answers
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Your Answers</DialogTitle>
                    <DialogDescription>
                      Review your performance on each question.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                     <div className="space-y-6">
                        {questions.map((q, index) => {
                            const userAnswerIndex = answers[q.id];
                            const isAnswered = userAnswerIndex !== undefined;
                            const userAnswerText = isAnswered ? q.options[userAnswerIndex] : "Not Answered";
                            const correctAnswerText = q.options[q.correctAnswer];
                            const isCorrect = isAnswered && userAnswerIndex === q.correctAnswer;
                            
                            return (
                               <div key={q.id} className="p-4 border rounded-lg select-none">
                                 <p className="font-semibold mb-2">{index + 1}. {q.text}</p>
                                 <div className="space-y-2">
                                    <p className="text-sm">Correct Answer: <span className="font-medium text-green-600">{correctAnswerText}</span></p>
                                    <div className="flex items-center text-sm">
                                      Your Answer: 
                                      <span className={`ml-2 font-medium flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCorrect ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                                        {userAnswerText}
                                      </span>
                                    </div>
                                 </div>
                               </div>
                            )
                        })}
                     </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center justify-center text-xs text-muted-foreground pt-2 gap-1">
               <span>Organized by IEEE Computer Society Pulchowk Student Branch Chapter</span>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

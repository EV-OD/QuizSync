"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuizState } from "@/hooks/use-quiz-state";
import { store } from "@/lib/quiz-store";
import { Play, Square, RefreshCw, BarChart2 } from "lucide-react";

export default function QuizControlPage() {
  const { status, users } = useQuizState();

  const getStatusBadge = () => {
    switch (status) {
      case 'not-started':
        return <Badge variant="secondary">Not Started</Badge>;
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'finished':
        return <Badge variant="destructive">Finished</Badge>;
    }
  };

  return (
    <div className="space-y-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Quiz Control
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6"/> Manage Quiz State
            </CardTitle>
            <CardDescription>
              Use these controls to manage the lifecycle of the quiz for all users.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Current Status:</span>
              {getStatusBadge()}
            </div>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => store.startQuiz()} disabled={status !== 'not-started' || users.length === 0} size="lg">
                <Play className="mr-2 h-4 w-4" /> Start Quiz
              </Button>
               <Button variant="destructive" onClick={() => store.endQuiz()} disabled={status !== 'active'} size="lg">
                <Square className="mr-2 h-4 w-4" /> End Quiz
              </Button>
              <Button variant="outline" onClick={() => store.resetQuiz()} size="lg">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Quiz
              </Button>
            </div>
            {users.length === 0 && status === 'not-started' && (
                 <p className="text-sm text-muted-foreground">
                    You must upload users before you can start the quiz.
                </p>
            )}
          </CardContent>
        </Card>
    </div>
  );
}


"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizState } from '@/hooks/use-quiz-state';
import { store } from '@/lib/quiz-store';
import AntiCheatWrapper from '@/components/quiz/anti-cheat-wrapper';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Timer, CheckSquare, XCircle, ShieldCheck, PlayCircle, Send, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const TIME_PER_QUESTION = 15; // 15 seconds per question

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { status, questions, userAssignments, users } = useQuizState();
  const [isUserValid, setIsUserValid] = useState<boolean | null>(null);

  const currentUser = useMemo(() => users.find(u => u.quizId === quizId), [users, quizId]);
  const userId = currentUser?.id;

  useEffect(() => {
    if (users.length > 0) {
      setIsUserValid(!!currentUser);
    }
  }, [users, currentUser]);

  const userQuestions = useMemo(() => {
    if (!userId || !userAssignments[userId] || questions.length === 0) return [];
    const questionIds = new Set(userAssignments[userId]);
    return questions.filter(q => questionIds.has(q.id));
  }, [userId, questions, userAssignments]);
  

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // questionId -> selected option index
  const [quizScreen, setQuizScreen] = useState<'welcome' | 'playing' | 'submitting' | 'finished'>('welcome');
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  
  const quizDuration = useMemo(() => userQuestions.length * TIME_PER_QUESTION, [userQuestions.length]);
  const [totalTimeLeft, setTotalTimeLeft] = useState(quizDuration);

  // Set total time when questions are loaded
  useEffect(() => {
    if (userQuestions.length > 0 && quizScreen !== 'finished') {
        setTotalTimeLeft(quizDuration);
    }
  }, [userQuestions.length, quizDuration, quizScreen]);


  const finishQuiz = useCallback(async () => {
    if (quizScreen === 'finished' || !userId || !currentUser || userQuestions.length === 0) return;
    
    setQuizScreen('submitting');

    let score = 0;
    userQuestions.forEach(q => {
      // Check if the stored answer index matches the correct answer index
      if (answers[q.id] !== undefined && answers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    await store.submitScore(userId, score, userQuestions.length);
    store.setLastResult({ 
        score, 
        total: userQuestions.length,
        questions: userQuestions,
        answers: answers
    });
    
    router.push(`/quiz/${currentUser.quizId}/results`);

  }, [quizScreen, userId, currentUser, userQuestions, answers, router]);

  // Main quiz timer
  useEffect(() => {
    if (status !== 'active' || quizScreen !== 'playing' || userQuestions.length === 0) {
      if(quizStartTime) setQuizStartTime(null);
      return;
    }
    
    if(!quizStartTime) setQuizStartTime(Date.now());

    const timer = setInterval(() => {
        if(quizStartTime) {
             const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
             const remaining = quizDuration - elapsed;
             setTotalTimeLeft(remaining > 0 ? remaining : 0);
             if (remaining <= 0) {
                finishQuiz();
             }
        }
    }, 1000);

    return () => clearInterval(timer);
  }, [status, quizScreen, userQuestions.length, quizStartTime, quizDuration, finishQuiz]);
  
  const handleNextQuestion = useCallback(() => {
     if (currentQuestionIndex < userQuestions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
    } else {
        // This is the final question, trigger submission.
        finishQuiz();
    }
  }, [currentQuestionIndex, userQuestions.length, finishQuiz])
  
  // Per-question timer and advancement
  useEffect(() => {
    if (status !== 'active' || quizScreen !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
            handleNextQuestion();
            return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, quizScreen, handleNextQuestion]);
  
  
  // Effect to automatically advance to next question after answering
  useEffect(() => {
      if (quizScreen !== 'playing' || userQuestions.length === 0) return;
      
      const answeredQuestions = Object.keys(answers).length;
      if (answeredQuestions === 0 || answeredQuestions <= currentQuestionIndex) return;

      // If the current question has been answered, move to the next one after a delay.
      if (answers[userQuestions[currentQuestionIndex].id] !== undefined) {
         const timeoutId = setTimeout(() => {
              handleNextQuestion();
         }, 300);
         return () => clearTimeout(timeoutId);
      }
  }, [answers, currentQuestionIndex, userQuestions, quizScreen, handleNextQuestion]);


  // Reset question timer on new question
  useEffect(() => {
      setTimeLeft(TIME_PER_QUESTION);
  }, [currentQuestionIndex]);


  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (quizScreen !== 'playing' || answers[questionId] !== undefined) return;
    
    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);

    // If this is the last question, immediately trigger the submission process.
    if (Object.keys(newAnswers).length === userQuestions.length) {
      finishQuiz();
    }
  };
  
  const currentQuestion = userQuestions[currentQuestionIndex];

   if (isUserValid === null) {
     return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-headline">Verifying User...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Please wait while we verify your quiz link.</p>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isUserValid === false) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="items-center">
               <XCircle className="h-12 w-12 text-destructive" />
              <CardTitle className="font-headline text-2xl">Invalid Quiz Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>This quiz link is invalid or has expired. Please check the URL and try again.</p>
              <Button onClick={() => router.push('/')}>Go to Homepage</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (quizScreen === 'submitting') {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center text-center p-4">
                <div className="flex flex-col items-center gap-4">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                   <h2 className="text-xl font-semibold text-muted-foreground">Checking your answers...</h2>
                </div>
            </main>
        </div>
    );
  }
  
  if (currentUser?.completed && quizScreen !== 'submitting') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="items-center">
              <Award className="h-12 w-12 text-primary" />
              <CardTitle className="font-headline text-2xl">Quiz Already Completed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have already completed this quiz. You cannot take it again.</p>
            </CardContent>
             <CardFooter className="flex flex-col justify-center text-xs text-muted-foreground pt-4">
               <span>Organized by IEEE Computer Society Pulchowk Student Branch Chapter</span>
             </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (status === 'not-started') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-headline">Quiz Not Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The quiz has not been started by the administrator yet. Please wait.</p>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </CardContent>
            <CardFooter className="flex flex-col justify-center text-xs text-muted-foreground pt-4">
               <span>Organized by IEEE Computer Society Pulchowk Student Branch Chapter</span>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  if (status === 'finished' && quizScreen !== 'finished' && quizScreen !== 'submitting') {
     finishQuiz();
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        </div>
     );
  }

  if (userQuestions.length === 0 && status === 'active') {
     return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-headline">Loading Quiz...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Preparing your questions. This may take a moment.</p>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </CardContent>
             <CardFooter className="flex flex-col justify-center text-xs text-muted-foreground pt-4">
               <span>Organized by IEEE Computer Society Pulchowk Student Branch Chapter</span>
             </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (quizScreen === 'welcome') {
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center text-center p-4">
              <Card className="w-full max-w-lg">
                <CardHeader>
                    <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
                    <CardTitle className="font-headline text-3xl mt-4">Welcome to the Quiz</CardTitle>
                    <CardDescription>
                        Please read the instructions carefully before you begin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-left space-y-4">
                    <div className="bg-muted p-4 rounded-lg border">
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <CheckSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>You will be asked <span className="font-bold text-primary">{userQuestions.length} questions</span>.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Timer className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>The total time for the quiz is <span className="font-bold text-primary">{Math.floor(quizDuration / 60)} minutes</span>.</span>
                            </li>
                             <li className="flex items-start gap-2">
                                <XCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>Once you start, you cannot go back. The quiz will be submitted automatically when the time is up.</span>
                            </li>
                        </ul>
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                        Ensure you have a stable internet connection.
                    </p>
                </CardContent>
                <CardFooter>
                   <Button size="lg" className="w-full" onClick={() => setQuizScreen('playing')}>
                     <PlayCircle className="mr-2 h-5 w-5" />
                     Start Quiz
                   </Button>
                </CardFooter>
              </Card>
            </main>
        </div>
     );
  }
  
  if (!currentQuestion) {
       return (
         <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        </div>
       )
  }

  return (
    <AntiCheatWrapper>
       <div className="flex flex-col min-h-screen bg-muted/40">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 md:pt-32">
          <div className="w-full max-w-2xl space-y-4 md:space-y-6">
            <div className="flex justify-between items-center font-mono text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <span>Question {currentQuestionIndex + 1} of {userQuestions.length}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <span>Total Time: {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>
            <Progress value={((currentQuestionIndex + 1) / userQuestions.length) * 100} className="w-full h-2 bg-muted [&>*]:bg-primary" />

            <AnimatePresence mode="wait">
                 <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                 >
                    <Card className="shadow-lg">
                      <CardHeader className="relative border-b p-4 md:p-6">
                        <CardTitle className="font-headline text-xl md:text-2xl pr-16 md:pr-20">{currentQuestion.text}</CardTitle>
                         <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-primary text-primary-foreground rounded-full h-12 w-12 md:h-16 md:w-16 flex items-center justify-center font-bold text-xl md:text-2xl font-mono shadow-inner">
                            {timeLeft}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <RadioGroup 
                            onValueChange={(val) => handleAnswerSelect(currentQuestion.id, parseInt(val))} 
                            className="space-y-3"
                            value={answers[currentQuestion.id]?.toString() || ""}
                            key={currentQuestion.id}
                        >
                          {currentQuestion.options.map((option, index) => (
                             <Label 
                                htmlFor={`option-${index}`} 
                                key={index}
                                className="flex items-center space-x-4 p-3 md:p-4 rounded-lg border bg-background hover:bg-accent/50 has-[input:checked]:bg-accent has-[input:checked]:border-accent-foreground cursor-pointer transition-colors"
                            >
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-5 w-5"/>
                                <span className="text-sm md:text-base font-medium">{option}</span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </CardContent>
                    </Card>
                 </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AntiCheatWrapper>
  );
}

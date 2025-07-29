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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuizState } from "@/hooks/use-quiz-state";
import { store } from "@/lib/quiz-store";
import { FileUp, BookMarked } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuestionsPage() {
  const { questions } = useQuizState();
  const { toast } = useToast();
  const questionsFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
            await store.loadQuestionsFromCsv(text);
            toast({
              title: "Success",
              description: "Questions uploaded to Firestore.",
            });
        } catch (error) {
            console.error("Upload failed:", error)
            toast({
                title: "Error",
                description: "Failed to upload questions CSV.",
                variant: "destructive"
            })
        }
      };
      reader.readAsText(file);
    }
  };
  
  const triggerFileSelect = () => questionsFileInputRef.current?.click();

  return (
    <div className="space-y-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Manage Questions
        </h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-6 w-6"/> Upload Questions
            </CardTitle>
            <CardDescription>
              Upload a CSV with the quiz questions. The file should have columns: `id`, `text`, `option1`, `option2`, `option3`, `option4`, `correctAnswer`, `researchPaperId`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={questionsFileInputRef} />
            <Button onClick={triggerFileSelect} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <FileUp className="mr-2 h-4 w-4" /> Upload Questions CSV
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Questions</CardTitle>
            <CardDescription>
              A list of all questions currently in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Research Paper</TableHead>
                  <TableHead>Question Text</TableHead>
                  <TableHead>Correct Answer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>{q.id}</TableCell>
                      <TableCell>{q.researchPaperId}</TableCell>
                      <TableCell>{q.text}</TableCell>
                      <TableCell>{q.correctAnswer}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No questions found. Upload a questions CSV to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}

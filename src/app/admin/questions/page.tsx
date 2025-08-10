
"use client";

import React, { useState, useEffect } from "react";
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
import { FileUp, BookMarked, PlusCircle, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question } from "@/lib/types";

const questionSchema = z.object({
  id: z.coerce.number().min(1, "ID is required"),
  text: z.string().min(1, "Question text is required"),
  researchPaperId: z.string().min(1, "Research Paper ID is required"),
  option1: z.string().min(1, "Option 1 is required"),
  option2: z.string().min(1, "Option 2 is required"),
  option3: z.string().min(1, "Option 3 is required"),
  option4: z.string().min(1, "Option 4 is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
});

export default function QuestionsPage() {
  const { questions } = useQuizState();
  const { toast } = useToast();
  const questionsFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isAddQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  
  const researchPapers = React.useMemo(() => {
    const papers = new Set(questions.map(q => q.researchPaperId).filter(Boolean));
    return Array.from(papers);
  }, [questions]);

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
  });
  
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

  async function onSubmit(values: z.infer<typeof questionSchema>) {
    try {
      const newQuestion: Question = {
        id: values.id,
        text: values.text,
        researchPaperId: values.researchPaperId,
        options: [values.option1, values.option2, values.option3, values.option4],
        correctAnswer: values.correctAnswer,
      };
      await store.addQuestion(newQuestion);
      toast({
        title: "Success",
        description: "Question added successfully.",
      });
      setAddQuestionDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add question:", error);
      toast({
        title: "Error",
        description: "Failed to add question.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await store.deleteQuestion(questionId);
      toast({
        title: "Success",
        description: "Question deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllQuestions = async () => {
    try {
      await store.clearAllQuestions();
      toast({
        title: "Success",
        description: "All questions have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear questions.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Manage Questions
            </h1>

            <Dialog open={isAddQuestionDialogOpen} onOpenChange={setAddQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new question.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question ID</FormLabel>
                          <FormControl>
                            <Input placeholder="101" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Input placeholder="What is the capital of Nepal?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="researchPaperId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Research Paper</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a research paper" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {researchPapers.map(paper => (
                                <SelectItem key={paper} value={paper}>{paper}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="option1" render={({ field }) => ( <FormItem><FormLabel>Option 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="option2" render={({ field }) => ( <FormItem><FormLabel>Option 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="option3" render={({ field }) => ( <FormItem><FormLabel>Option 3</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="option4" render={({ field }) => ( <FormItem><FormLabel>Option 4</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                    <FormField
                      control={form.control}
                      name="correctAnswer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correct Answer</FormLabel>
                          <FormControl>
                            <Input placeholder="Must match one of the options" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Save Question</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-6 w-6"/> Upload via CSV
            </CardTitle>
            <CardDescription>
              Or, upload a CSV with the quiz questions. The file should have columns: `id`, `text`, `option1`, `option2`, `option3`, `option4`, `correctAnswer`, `researchPaperId`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={questionsFileInputRef} />
            <Button onClick={triggerFileSelect} variant="secondary">
              <FileUp className="mr-2 h-4 w-4" /> Upload Questions CSV
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Uploaded Questions</CardTitle>
                <CardDescription>
                A list of all questions currently in the database.
                </CardDescription>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={questions.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all
                        questions from the database.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllQuestions}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Research Paper</TableHead>
                  <TableHead>Question Text</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                       <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this question.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
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

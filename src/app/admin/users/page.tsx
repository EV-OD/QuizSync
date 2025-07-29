
"use client";

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useQuizState } from "@/hooks/use-quiz-state";
import { store } from "@/lib/quiz-store";
import { FileUp, Users, Copy, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User as UserType } from "@/lib/types";


const userSchema = z.object({
  id: z.string().email("Please enter a valid email address."),
  name: z.string().min(1, "User name is required"),
  researchPaperId: z.string().min(1, "Research Paper ID is required"),
  questionIds: z.string().min(1, "Question IDs are required").regex(/^[0-9]+(;[0-9]+)*$/, "Must be semicolon-separated numbers (e.g., 1;2;3)"),
});

export default function UsersPage() {
  const { users, questions } = useQuizState();
  const { toast } = useToast();
  const usersFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  
  const researchPapers = React.useMemo(() => {
    const papers = new Set(questions.map(q => q.researchPaperId).filter(Boolean));
    return Array.from(papers);
  }, [questions]);
  
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
            await store.loadUsersFromCsv(text);
             toast({
              title: "Success",
              description: "Users and assignments uploaded to Firestore.",
            });
        } catch (error) {
            console.error("Upload failed:", error)
            toast({
                title: "Error",
                description: "Failed to upload users CSV.",
                variant: "destructive"
            })
        }
      };
      reader.readAsText(file);
    }
  };
  
  const triggerFileSelect = () => usersFileInputRef.current?.click();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text);
    toast({
      title: "Copied!",
      description: "Quiz URL copied to clipboard.",
    });
  };

  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      const newUser: Omit<UserType, 'quizUrl' | 'score' | 'completed' | 'totalQuestions'> = {
        id: values.id,
        name: values.name,
        researchPaperId: values.researchPaperId,
      };
      const questionIds = values.questionIds.split(';').map(id => parseInt(id.trim(), 10));
      
      await store.addUser(newUser, questionIds);
      
      toast({
        title: "Success",
        description: "User added successfully.",
      });
      setAddUserDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add user:", error);
      toast({
        title: "Error",
        description: "Failed to add user.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Manage Users
        </h1>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={questions.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Fill in the details for the new user and assign them questions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID (Email)</FormLabel>
                      <FormControl>
                        <Input placeholder="participant@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                <FormField
                  control={form.control}
                  name="questionIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question IDs</FormLabel>
                      <FormControl>
                        <Input placeholder="1;2;3;4;5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Semicolon-separated list of question IDs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save User</Button>
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
            Or, upload a CSV with user assignments. The file should have columns: `userId`, `userName`, `researchPaperId`, `questionIds` (semicolon-separated).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={usersFileInputRef} />
          <Button onClick={triggerFileSelect} variant="secondary" disabled={questions.length === 0}>
            <FileUp className="mr-2 h-4 w-4" /> Upload Users CSV
          </Button>
          {questions.length === 0 && <p className="text-sm text-muted-foreground mt-2">Please upload questions before uploading users.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users & Links</CardTitle>
          <CardDescription>
            Personalized quiz links for each registered user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Quiz URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="font-mono">{user.quizUrl}</TableCell>
                    <TableCell>
                      {user.completed ? (
                        <Badge className="bg-blue-500 text-white">Completed</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                     <TableCell>{user.score != null ? `${user.score} / ${user.totalQuestions}` : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(user.quizUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No users found. Upload a users CSV to get started.
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

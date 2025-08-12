
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
import { FileUp, Users, Copy, PlusCircle, Trash2, AlertTriangle, Download, TestTube2, CheckCircle, XCircle } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";


const userSchema = z.object({
  id: z.string().email("Please enter a valid email address."),
  name: z.string().min(1, "User name is required"),
  researchPaperId: z.string().min(1, "Research Paper ID is required"),
});

interface TestResult {
    userName: string;
    researchPaperId: string;
    hasQuestions: boolean;
}

export default function UsersPage() {
  const { users, questions } = useQuizState();
  const { toast } = useToast();
  const usersFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isTestResultDialogOpen, setTestResultDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
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
      const newUser: Omit<UserType, 'quizUrl' | 'score' | 'completed' | 'totalQuestions' | 'quizId'> = {
        id: values.id,
        name: values.name,
        researchPaperId: values.researchPaperId,
      };
      
      await store.addUser(newUser);
      
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await store.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllUsers = async () => {
    try {
      await store.clearAllUsers();
      toast({
        title: "Success",
        description: "All users have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear users.",
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = () => {
    if (users.length === 0) {
      toast({
        title: "No Users",
        description: "There are no users to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["User Name", "User ID (Email)", "Quiz URL", "Research Paper ID"];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `"${user.name}"`,
        user.id,
        `"${window.location.origin}${user.quizUrl}"`,
        `"${user.researchPaperId}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'quiz_users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "User data has been exported.",
    });
  };

  const handleTestAssignments = () => {
    if (users.length === 0) {
      toast({
        title: "No Users",
        description: "There are no users to test.",
        variant: "destructive",
      });
      return;
    }
    
    const questionPaperIds = new Set(questions.map(q => q.researchPaperId));

    const results = users.map(user => ({
      userName: user.name,
      researchPaperId: user.researchPaperId,
      hasQuestions: questionPaperIds.has(user.researchPaperId),
    }));

    setTestResults(results);
    setTestResultDialogOpen(true);
  };


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
                A unique quiz URL will be generated automatically.
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
            Or, upload a CSV with user assignments. The file should have columns: `userId`, `userName`, and `researchPaperId`. A unique URL will be generated for each user.
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
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Users & Links</CardTitle>
                <CardDescription>
                    Personalized, secure quiz links for each registered user.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Dialog open={isTestResultDialogOpen} onOpenChange={setTestResultDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" onClick={handleTestAssignments} disabled={users.length === 0}>
                            <TestTube2 className="mr-2 h-4 w-4" /> Test User Assignments
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                        <DialogTitle>User Assignment Test Results</DialogTitle>
                        <DialogDescription>
                            This report shows if questions are available for each user's assigned research paper.
                        </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>User Name</TableHead>
                                    <TableHead>Research Paper</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {testResults.map((result, index) => (
                                    <TableRow key={index}>
                                    <TableCell>{result.userName}</TableCell>
                                    <TableCell>{result.researchPaperId}</TableCell>
                                    <TableCell className="text-right">
                                        {result.hasQuestions ? (
                                        <Badge className="bg-green-500 text-white"><CheckCircle className="mr-2 h-4 w-4"/>Ready</Badge>
                                        ) : (
                                        <Badge variant="destructive"><XCircle className="mr-2 h-4 w-4"/>No Questions</Badge>
                                        )}
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>

               <Button variant="outline" onClick={handleExportUsers} disabled={users.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> Export Users
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={users.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear All
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all
                            users and their quiz assignments.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllUsers}>
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Research Paper</TableHead>
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
                    <TableCell>{user.researchPaperId}</TableCell>
                    <TableCell className="font-mono">{user.quizUrl}</TableCell>
                    <TableCell>
                      {user.completed ? (
                        <Badge className="bg-blue-500 text-white">Completed</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                     <TableCell>{user.score != null ? `${user.score} / ${user.totalQuestions}` : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(user.quizUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user and their quiz assignment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
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
                  <TableCell colSpan={6} className="text-center h-24">
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

    
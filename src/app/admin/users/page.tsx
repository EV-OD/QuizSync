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
import { Badge } from "@/components/ui/badge";
import { useQuizState } from "@/hooks/use-quiz-state";
import { store } from "@/lib/quiz-store";
import { FileUp, Users, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { users, questions } = useQuizState();
  const { toast } = useToast();
  const usersFileInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Manage Users
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6"/> Upload Users
          </CardTitle>
          <CardDescription>
            Upload a CSV with user assignments. The file should have columns: `userId`, `userName`, `researchPaperId`, `questionIds` (semicolon-separated).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={usersFileInputRef} />
          <Button onClick={triggerFileSelect} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={questions.length === 0}>
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

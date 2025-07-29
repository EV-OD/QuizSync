"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuizState } from "@/hooks/use-quiz-state";
import { Badge } from "@/components/ui/badge";
import { Users, BookMarked, BarChart2, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";


export default function AdminPage() {
  const { status, users, questions } = useQuizState();
  const { user } = useAuth();

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
        <div className="flex justify-between items-start">
            <div>
                 <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">Welcome back, {user?.displayName || 'Admin'}.</p>
            </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6"/> Quiz Status
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-2xl font-bold">
                    {getStatusBadge()}
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="h-6 w-6"/> Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{questions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6"/> Registered Users
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
           <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/questions" className="p-4 bg-muted hover:bg-muted/80 rounded-lg flex flex-col items-center gap-2">
                    <BookMarked className="h-8 w-8 text-primary"/>
                    <span className="font-semibold">Manage Questions</span>
                </Link>
                <Link href="/admin/users" className="p-4 bg-muted hover:bg-muted/80 rounded-lg flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-primary"/>
                    <span className="font-semibold">Manage Users</span>
                </Link>
                <Link href="/admin/quiz-control" className="p-4 bg-muted hover:bg-muted/80 rounded-lg flex flex-col items-center gap-2">
                    <BarChart2 className="h-8 w-8 text-primary"/>
                    <span className="font-semibold">Manage Quiz</span>
                </Link>
            </CardContent>
           </Card>
        </div>
      </div>
  );
}

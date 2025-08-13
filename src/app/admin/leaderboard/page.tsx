
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuizState } from "@/hooks/use-quiz-state";
import { Trophy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";


interface UserWithRanks extends User {
    overallRank?: number;
    researchPaperRank?: number;
}


export default function LeaderboardPage() {
  const { users } = useQuizState();
  const [selectedPaper, setSelectedPaper] = useState("all");
  const { toast } = useToast();

  const researchPapers = useMemo(() => {
    const papers = new Set(users.map(u => u.researchPaperId).filter(Boolean));
    return ["all", ...Array.from(papers)];
  }, [users]);

  const rankedUsers = useMemo(() => {
      const completed = users.filter((u) => u.completed);

      // Sort for overall rank
      const overallSorted = [...completed].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      const usersWithOverallRank: UserWithRanks[] = overallSorted.map((user, index) => ({
          ...user,
          overallRank: index + 1
      }));

      // Group by paper for paper-specific rank
      const byPaper: Record<string, UserWithRanks[]> = {};
      usersWithOverallRank.forEach(user => {
          if (!byPaper[user.researchPaperId]) {
              byPaper[user.researchPaperId] = [];
          }
          byPaper[user.researchPaperId].push(user);
      });

      // Sort within each paper group and assign rank
      Object.keys(byPaper).forEach(paperId => {
          byPaper[paperId].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
          byPaper[paperId].forEach((user, index) => {
              user.researchPaperRank = index + 1;
          });
      });
      
      const finalUsers = Object.values(byPaper).flat();
      
      const userMap = new Map(finalUsers.map(u => [u.id, u]));

      // Combine with non-completed users
      const nonCompleted = users.filter(u => !u.completed);
      
      const allUsers = [...nonCompleted, ...finalUsers];

      return allUsers;

  }, [users]);


  const filteredAndSortedUsers = useMemo(() => {
    const filtered =
      selectedPaper === "all"
        ? rankedUsers
        : rankedUsers.filter((u) => u.researchPaperId === selectedPaper);

    return filtered.sort((a, b) => {
      // Sort by completed status first (completed users on top)
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;

      // Then sort by score (higher score is better)
      const scoreA = a.score ?? -1;
      const scoreB = b.score ?? -1;
      if(scoreB !== scoreA) return scoreB - scoreA;

      // If scores are same, use overall rank
      return (a.overallRank ?? Infinity) - (b.overallRank ?? Infinity)
    });
  }, [rankedUsers, selectedPaper]);
  
  const handleExportResults = () => {
    const completedUsers = rankedUsers.filter(u => u.completed);

    if (completedUsers.length === 0) {
      toast({
        title: "No Results",
        description: "There are no completed quizzes to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["userName", "researchPaperId", "score", "totalQuestions", "overallRank", "researchPaperRank"];
    const csvContent = [
      headers.join(','),
      ...completedUsers.map(user => [
        `"${user.name}"`,
        `"${user.researchPaperId}"`,
        user.score,
        user.totalQuestions,
        user.overallRank,
        user.researchPaperRank
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'quiz_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Quiz results have been exported.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
            Leaderboard
            </h1>
            <p className="text-muted-foreground">
                Real-time user scores and rankings.
            </p>
        </div>
        <div className="flex w-full md:w-auto flex-col md:flex-row gap-2">
            <Select value={selectedPaper} onValueChange={setSelectedPaper}>
            <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by Research Paper" />
            </SelectTrigger>
            <SelectContent>
                {researchPapers.map((paper) => (
                <SelectItem key={paper} value={paper}>
                    {paper === "all" ? "All Research Papers" : paper}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
            <Button onClick={handleExportResults} className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" /> Export Results
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" /> Rankings
          </CardTitle>
          <CardDescription>
            Users are ranked by score. Updates will appear in real-time as quizzes are completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Research Paper</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user, index) => (
                  <TableRow key={user.id} className={user.completed ? "bg-green-500/10" : ""}>
                    <TableCell className="font-bold text-lg">
                      {user.completed ? (selectedPaper === 'all' ? user.overallRank : user.researchPaperRank) : "-"}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.researchPaperId}</TableCell>
                    <TableCell className="text-right font-mono">
                      {user.score != null
                        ? `${user.score} / ${user.totalQuestions}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.completed ? (
                        <Badge className="bg-green-500 text-white">Completed</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No users found for this filter.
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


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
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { users } = useQuizState();
  const [selectedPaper, setSelectedPaper] = useState("all");

  const researchPapers = useMemo(() => {
    const papers = new Set(users.map(u => u.researchPaperId).filter(Boolean));
    return ["all", ...Array.from(papers)];
  }, [users]);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered =
      selectedPaper === "all"
        ? users
        : users.filter((u) => u.researchPaperId === selectedPaper);

    return filtered.sort((a, b) => {
      // Sort by completed status first (completed users on top)
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;

      // Then sort by score (higher score is better)
      const scoreA = a.score ?? -1;
      const scoreB = b.score ?? -1;
      return scoreB - scoreA;
    });
  }, [users, selectedPaper]);

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
                      {user.completed ? index + 1 : "-"}
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


"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/header";
import { useQuizState } from "@/hooks/use-quiz-state";
import { User } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Medal, Award } from 'lucide-react';
import { motion } from "framer-motion";
import { DotBackground } from "@/components/ui/dot-background";
import { cn } from "@/lib/utils";

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return "border-yellow-400/80 bg-yellow-400/10 hover:bg-yellow-400/20";
    case 2: return "border-gray-400/80 bg-gray-400/10 hover:bg-gray-400/20";
    case 3: return "border-orange-400/80 bg-orange-400/10 hover:bg-orange-400/20";
    default: return "border-border bg-card hover:bg-muted/50";
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="h-8 w-8 text-yellow-400" />;
    case 2: return <Medal className="h-8 w-8 text-gray-400" />;
    case 3: return <Award className="h-8 w-8 text-orange-400" />;
    default: return <span className="text-2xl font-bold text-muted-foreground">{rank}</span>;
  }
};

export default function PublicLeaderboardPage() {
  const { users } = useQuizState();
  const [selectedPaper, setSelectedPaper] = useState("all");

  const researchPapers = useMemo(() => {
    const papers = new Set<string>();
    users.forEach(u => {
      if (u.researchPaperId) papers.add(u.researchPaperId);
    });
    return ["all", ...Array.from(papers)];
  }, [users]);

  const topUsers = useMemo(() => {
    const completedUsers = users.filter(u => u.completed);
    
    const filtered =
      selectedPaper === "all"
        ? completedUsers
        : completedUsers.filter((u) => u.researchPaperId === selectedPaper);

    return filtered
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5);
  }, [users, selectedPaper]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <DotBackground>
      <div className="flex flex-col min-h-screen bg-transparent text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-28 md:py-32">
          <div className="flex flex-col items-center text-center mb-12">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-headline text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400"
            >
              Top Scholars
            </motion.h1>
            <motion.p 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-lg text-muted-foreground max-w-2xl"
            >
              Celebrating the brightest minds in our research community. See who's leading the way.
            </motion.p>
          </div>

          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center mb-12"
          >
            <Select value={selectedPaper} onValueChange={setSelectedPaper}>
              <SelectTrigger className="w-full md:w-[350px] bg-background/50 backdrop-blur-sm border-border">
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
          </motion.div>

          {topUsers.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 max-w-3xl mx-auto"
            >
              {topUsers.map((user, index) => (
                <motion.div key={user.id} variants={itemVariants}               initial="hidden"
                animate="visible">
                  <div className={cn(
                    "relative p-6 rounded-xl border-2 transition-all duration-300 shadow-lg",
                    getRankColor(index + 1)
                  )}>
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex-grow">
                        <p className="text-xl font-bold text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.researchPaperId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold font-mono text-primary">{user.score}</p>
                        <p className="text-xs text-muted-foreground">/{user.totalQuestions} Points</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center py-12"
            >
              <p className="text-muted-foreground text-lg">No completed quizzes yet for this filter.</p>
              <p className="text-sm text-muted-foreground">Rankings will appear here in real-time as participants finish.</p>
            </motion.div>
          )}

        </main>
      </div>
    </DotBackground>
  );
}

import Link from "next/link";
import { ArrowRight, BookUser, CheckCircle, UploadCloud, Wallet, Repeat, Zap, Trophy } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import WorldMap from "@/components/ui/world-map";
import { Timeline } from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";

const timelineData = [
    {
      title: "Research Discussions",
      content: (
        <div>
          <p className="mb-4 text-sm md:text-base text-muted-foreground">
            Engage with experts and peers to refine your research ideas. This initial phase is all about exploration and finding your academic voice.
          </p>
          <div className="p-4 rounded-lg bg-muted/70 border">
            <p className="font-bold text-primary">Prize Pool: NPR 5,000</p>
            <p className="text-xs text-muted-foreground">For the best presentation and idea.</p>
          </div>
        </div>
      ),
    },
     {
      title: "Review Paper",
      content: (
        <div>
          <p className="mb-4 text-sm md:text-base text-muted-foreground">
            Learn the fundamentals of academic writing by composing a comprehensive review paper. This will build a strong foundation for your final research.
          </p>
           <div className="p-4 rounded-lg bg-muted/70 border">
            <p className="font-bold text-primary">Prize Pool: NPR 5,000</p>
            <p className="text-xs text-muted-foreground">Revealed after phase completion.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Ideathon",
      content: (
        <div>
           <p className="mb-4 text-sm md:text-base text-muted-foreground">
            Brainstorm and develop innovative research concepts in a competitive, collaborative environment. Let your best ideas shine.
          </p>
           <div className="p-4 rounded-lg bg-muted/70 border">
            <p className="font-bold text-primary">Prize Pool: NPR 5,000</p>
            <p className="text-xs text-muted-foreground">Revealed after phase completion.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Final Paper & Publication",
      content: (
        <div>
          <p className="mb-4 text-sm md:text-base text-muted-foreground">
            Culminate your year-long journey by writing a polished, final research paper. With expert guidance, you'll submit your work to a globally recognized IEEE journal and become a published author.
          </p>
           <div className="p-4 rounded-lg bg-muted/70 border">
            <p className="font-bold text-primary">Prize Pool: NPR 5,000</p>
            <p className="text-xs text-muted-foreground">Revealed after phase completion.</p>
          </div>
        </div>
      ),
    },
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full flex items-center min-h-dvh pt-20 text-foreground overflow-hidden">
           <WorldMap
            pins={[
                { lat: 27.7172, lng: 85.3240, label: "Nepal" } 
            ]}
            logo={{
              imageUrl: "/logos/IEEE-CS_LogoTM-orange.png",
              lat: 25.5,
              lng: 85.3240,
            }}
          />
           <div className="absolute inset-0 [mask-image:radial-gradient(at_40%_50%,white_0%,transparent_40%)] md:[mask-image:radial-gradient(at_40%_50%,white_0%,transparent_40%)] backdrop-blur-md"></div>
           <div className="container px-4 md:px-6 text-left relative z-10">
            <div className="max-w-3xl">
                <div className="inline-block rounded-lg bg-primary/20 border border-primary/50 px-3 py-1 text-sm font-semibold text-primary mb-4">
                    Phase 1: Research Discussions
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                 Join "Scholars in the <span className="bg-primary/20 px-2 text-primary">Making</span>"
                </h1>
                <p className="mt-6 max-w-[700px] text-muted-foreground md:text-xl">
                  A year-long <span className="text-primary font-semibold">journey</span> by IEEE Computer Society, Pulchowk Student Branch Chapter – where your ideas transform into a published research paper in a globally recognized IEEE journal.
                </p>
                <div className="mt-8 flex flex-col gap-4 min-[400px]:flex-row justify-start">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                    <a href="#features">
                      Explore the Journey <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                   <Button asChild size="lg" variant="outline" className="rounded-full">
                      <Link href="/public-leaderboard">
                        View Leaderboard <Trophy className="ml-2 h-5 w-5" />
                      </Link>
                   </Button>
                </div>
            </div>
          </div>
        </section>

                  {/* How it Works Section / Timeline */}
                  <section className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">The Research Journey</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            A clear path from discussion to a published paper.
                        </p>
                    </div>
                </div>
              </div>
              <Timeline data={timelineData} />
          </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 text-foreground">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                    💡 What’s waiting for you?
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                    From Idea to Publication
                  </h2>
                   <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                     🔥 This is the 1st out of 4 exciting events – Research Paper Discussions starting on July 28. <br/> Your research journey begins here. Don’t miss out! 🚀
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
                <div className="grid gap-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                        <UploadCloud className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">Research Discussions</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Engage with experts and peers to refine your research ideas.
                  </p>
                </div>
                <div className="grid gap-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <BookUser className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">Review Paper</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Learn the fundamentals by composing a comprehensive review paper.
                  </p>
                </div>
                <div className="grid gap-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <Zap className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">Ideathon</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Brainstorm and develop innovative research concepts in a competitive environment.
                  </p>
                </div>
                 <div className="grid gap-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                     <div className="bg-primary text-primary-foreground p-3 rounded-full">
                       <CheckCircle className="h-6 w-6" />
                     </div>
                    <h3 className="text-xl font-bold font-headline">Final Paper</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Culminate your work into a final, polished research paper ready for publication.
                  </p>
                </div>
                <div className="grid gap-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">NPR 20,000 Prize Pool</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Compete for a prize pool rewarding the most outstanding research.
                  </p>
                </div>
                 <div className="grid gap-4 p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <Repeat className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">Registration Refund</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Get 100% of your registration fee returned upon successful completion.
                  </p>
                </div>
              </div>
            </div>
          </section>



        </main>
        <footer className="flex items-center justify-center py-6 border-t border-border bg-muted/40 text-muted-foreground">
          <p className="text-xs">&copy; 2024 Scholars in the Making. All rights reserved.</p>
        </footer>
      </div>
  );
}

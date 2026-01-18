'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BrainCircuit,
  Code,
  LayoutDashboard,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Learning Paths',
    description:
      'Our AI analyzes your skills and goals to create a unique learning journey just for you.',
  },
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: 'Interactive Code Editor',
    description:
      'Learn by doing with a real-time code editor that provides instant feedback.',
  },
  {
    icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
    title: 'Personalized Dashboard',
    description:
      'Track your progress, view achievements, and stay motivated on your path to mastery.',
  },
];

export default function LandingPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/login"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Login
              </Link>
              <Button asChild>
                <Link href="/signup">
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
            <div className="mb-4">
                <div
                    className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}
                >
                    Powered by Generative AI
                </div>
            </div>
            <h1
              className="font-headline text-3xl font-bold leading-tight tracking-tighter md:text-6xl animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              The Future of Learning to Code is Here.
            </h1>
            <p
              className="max-w-[700px] text-lg text-muted-foreground animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              CodeGenius combines personalized learning paths with an
              interactive, AI-enhanced environment to help you master programming
              faster than ever before.
            </p>
          </div>
          <div
            className="flex w-full items-center justify-center space-x-4 py-4 md:py-6 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <Button asChild size="lg">
              <Link href="/dashboard">
                Start Learning For Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          id="features"
          className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Why CodeGenius?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Discover the features that make CodeGenius the ultimate platform for aspiring developers.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <h2 className="font-headline text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Ready to Start Your Journey?</h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Join thousands of learners and take your coding skills to the next level. It's free to get started.
                </p>
                <div className="flex w-full items-center justify-center space-x-4 py-4 md:py-6">
                    <Button asChild size="lg">
                        <Link href="/dashboard">
                            Create Your Free Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by AI. Styled by Humans. &copy; {year} CodeGenius.
          </p>
        </div>
      </footer>
    </div>
  );
}

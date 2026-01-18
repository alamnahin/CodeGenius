'use client';
import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BarChart,
  LineChart,
  Activity,
  ArrowUpRight,
  BookOpen,
  Target,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { useUser, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Define the shape of a performance record based on backend.json
interface PerformanceRecord {
  id: string;
  userId: string;
  lessonId?: string;
  quizId?: string;
  score: number;
  completionDate: Timestamp; // Assume it's a Firestore Timestamp for querying
}

interface LearningPath {
  id: string;
  lessonCount: number;
}

const chartConfig = {
  lessons: {
    label: 'Lessons',
    color: 'hsl(var(--primary))',
  },
};

function calculateActiveStreak(records: PerformanceRecord[] | null): number {
  if (!records || records.length === 0) {
    return 0;
  }
  
  // Get unique dates (normalized to start of day) from timestamps
  const uniqueCompletionTimestamps = [...new Set(records.map(r => {
    const d = r.completionDate.toDate();
    d.setHours(0,0,0,0);
    return d.getTime();
  }))].sort((a,b) => b-a);
  
  if (uniqueCompletionTimestamps.length === 0) return 0;

  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date();
  yesterday.setHours(0,0,0,0);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastCompletionTime = uniqueCompletionTimestamps[0];

  // Streak is broken if no activity today or yesterday
  if (lastCompletionTime !== today.getTime() && lastCompletionTime !== yesterday.getTime()) {
      return 0;
  }

  let streak = 1;
  for (let i = 0; i < uniqueCompletionTimestamps.length - 1; i++) {
      const currentDay = uniqueCompletionTimestamps[i];
      const nextDay = uniqueCompletionTimestamps[i+1];
      
      const expectedPreviousDay = new Date(currentDay);
      expectedPreviousDay.setDate(expectedPreviousDay.getDate() - 1);

      if (nextDay === expectedPreviousDay.getTime()) {
          streak++;
      } else {
          break; // Streak is broken
      }
  }
  return streak;
}


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const performanceRecordsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'performanceRecords');
  }, [firestore, user]);

  const { data: performanceRecords, isLoading: isLoadingRecords } = useCollection<PerformanceRecord>(performanceRecordsQuery);
  
  const learningPathsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'learningPaths');
  }, [firestore, user]);

  const { data: learningPaths, isLoading: isLoadingPaths } = useCollection<LearningPath>(learningPathsQuery);

  const lessonsCompleted = performanceRecords?.length ?? 0;
  
  const pointsEarned = useMemo(() => {
    return performanceRecords?.reduce((acc, record) => acc + (record.score || 0), 0) ?? 0;
  }, [performanceRecords]);
  
  const totalLessons = useMemo(() => {
    return learningPaths?.reduce((acc, path) => acc + (path.lessonCount || 0), 0) ?? 0;
  }, [learningPaths]);
  
  const overallProgress = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  
  const activeStreak = useMemo(() => {
    if (!isClient) return 0;
    return calculateActiveStreak(performanceRecords)
  }, [isClient, performanceRecords]);

  const weeklyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({ day, lessons: 0 }));

    if (!performanceRecords || !isClient) {
      return data;
    }
    
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentRecords = performanceRecords.filter(record => {
        const recordDate = record.completionDate.toDate();
        return recordDate >= sevenDaysAgo;
    });

    recentRecords.forEach(record => {
      // getDay() is Sun=0, ..., Sat=6. We want Mon=0, ..., Sun=6 for our array.
      const dayIndex = (record.completionDate.toDate().getDay() + 6) % 7;
      if (data[dayIndex]) {
        data[dayIndex].lessons++;
      }
    });

    return data;
  }, [isClient, performanceRecords]);

  const isLoading = isLoadingRecords || isLoadingPaths;

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}!
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-16" />
            ) : (
                <div className="text-2xl font-bold">{overallProgress}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              You're doing great, keep it up!
            </p>
          </CardContent>
          <CardFooter>
            {isLoading ? <Skeleton className="h-4 w-full" /> : <Progress value={overallProgress} className="w-full" />}
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lessons Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingRecords ? (
                <Skeleton className="h-8 w-20" />
            ) : (
                <div className="text-2xl font-bold">{lessonsCompleted}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Across all learning paths
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingRecords ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <div className="text-2xl font-bold">{activeStreak} {activeStreak === 1 ? 'day' : 'days'}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Your longest streak is 25 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingRecords ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <div className="text-2xl font-bold">{pointsEarned.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Top 10% of learners
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Number of lessons completed this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            { isLoadingRecords ? (
                <div className="flex h-[300px] w-full items-center justify-center p-4">
                    <Skeleton className="h-full w-full" />
                </div>
            ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <RechartsBarChart
                accessibilityLayer
                data={weeklyChartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="lessons" fill="var(--color-lessons)" radius={4} />
              </RechartsBarChart>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>
              Pick up where you left off.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-md bg-primary/10 p-2">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">JavaScript Fundamentals</p>
                <p className="text-sm text-muted-foreground">
                  Module 3: Functions and Scope
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="#">
                  Resume <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
             <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-md bg-accent/10 p-2">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">React State Management</p>
                <p className="text-sm text-muted-foreground">
                  Module 1: Introduction to Redux
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="#">
                  Start <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/learning-path">View Full Path</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  generatePersonalizedLearningPath,
  type GeneratePersonalizedLearningPathOutput,
} from '@/ai/flows/generate-personalized-learning-path';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, BookOpen, Clock, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';

const formSchema = z.object({
  skillLevel: z.string().min(1, 'Please select your skill level.'),
  interests: z.string().min(3, 'Please tell us your interests.'),
  learningGoals: z.string().min(10, 'Please describe your learning goals.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LearningPathPage() {
  const [learningPath, setLearningPath] =
    useState<GeneratePersonalizedLearningPathOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillLevel: '',
      interests: '',
      learningGoals: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setLearningPath(null);
    try {
      const result = await generatePersonalizedLearningPath(values);
      setLearningPath(result);
      
      if (user && firestore) {
        const learningPathData = {
          name: values.interests,
          description: values.learningGoals,
          userId: user.uid,
          creationDate: Timestamp.now(),
          lessonCount: result.learningPath.length,
        };

        const learningPathsCollection = collection(firestore, 'users', user.uid, 'learningPaths');
        
        addDocumentNonBlocking(learningPathsCollection, learningPathData)
          .then(learningPathRef => {
            if (learningPathRef) {
              const lessonsCollection = collection(learningPathRef, 'lessons');

              result.learningPath.forEach((step, index) => {
                const lessonData = {
                  learningPathId: learningPathRef.id,
                  title: step.topic,
                  content: `## ${step.topic}\n\n${step.description}\n\n**Estimated Time:** ${step.estimatedTime}\n\n**Resources:**\n${step.resources.map(r => `- [${r}](${r})`).join('\n')}`,
                  order: index + 1,
                };
                addDocumentNonBlocking(lessonsCollection, lessonData);
              });

              toast({
                title: "Learning Path Saved!",
                description: "Your new path has been saved to your profile.",
              });
            } else {
              toast({
                variant: "destructive",
                title: "Could not save path",
                description: "There was an error saving your learning path. You may lack permissions.",
              });
            }
          })
          .catch((error) => {
             console.error("Error creating learning path document:", error);
             toast({
              variant: "destructive",
              title: "Could not save path",
              description: "An unexpected network error occurred.",
            });
          });
      }

    } catch (error) {
      console.error('Failed to generate learning path:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'There was an error generating your learning path. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI-Powered Learning Path
        </h1>
        <p className="text-muted-foreground">
          Tell us about yourself, and our AI will craft a personalized learning
          path to guide your coding journey.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Fill out the details below to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="skillLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Skill Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="e.g., Beginner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Web Development, AI"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="learningGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Get a job, build a SaaS product"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Path
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle>Your Custom Learning Path</CardTitle>
              <CardDescription>
                Follow these steps to achieve your goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 pt-10 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="font-semibold">Crafting your journey...</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is analyzing your profile to build the perfect path.
                  </p>
                </div>
              )}
              {!isLoading && !learningPath && (
                <div className="flex flex-col items-center justify-center space-y-4 pt-10 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                  <p className="font-semibold">Your path awaits</p>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form to generate your personalized learning
                    path.
                  </p>
                </div>
              )}
              {learningPath && (
                <Accordion type="single" collapsible className="w-full">
                  {learningPath.learningPath.map((step, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-4 text-left">
                          <div className="rounded-full bg-primary/10 p-2 text-primary">{index + 1}</div>
                          <span className="font-medium">{step.topic}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-8">
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                          <Badge variant="outline" className="flex w-fit items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {step.estimatedTime}
                          </Badge>
                          <div>
                            <h4 className="font-semibold mb-2">Resources:</h4>
                            <ul className="list-disc space-y-2 pl-5">
                              {step.resources.map((resource, rIndex) => (
                                <li key={rIndex}>
                                  <a href={resource} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                                    {resource} <ExternalLink className="h-3 w-3" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

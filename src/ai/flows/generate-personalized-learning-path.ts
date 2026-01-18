'use server';

/**
 * @fileOverview Generates a personalized learning path based on user's skill level, interests, and learning goals.
 *
 * - generatePersonalizedLearningPath - A function that generates the learning path.
 * - GeneratePersonalizedLearningPathInput - The input type for the generatePersonalizedLearningPath function.
 * - GeneratePersonalizedLearningPathOutput - The return type for the generatePersonalizedLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedLearningPathInputSchema = z.object({
  skillLevel: z
    .string()
    .describe('The user\s current skill level (e.g., beginner, intermediate, advanced).'),
  interests: z.string().describe('The user\s interests (e.g., web development, data science, mobile apps).'),
  learningGoals:
    z.string().describe('The user\s learning goals (e.g., build a portfolio, get a job, learn a new technology).'),
});
export type GeneratePersonalizedLearningPathInput = z.infer<typeof GeneratePersonalizedLearningPathInputSchema>;

const GeneratePersonalizedLearningPathOutputSchema = z.object({
  learningPath: z.array(
    z.object({
      topic: z.string().describe('The topic to learn.'),
      description: z.string().describe('A brief description of the topic.'),
      estimatedTime: z.string().describe('The estimated time to complete the topic.'),
      resources: z.array(z.string().url()).describe('A list of URL resources for the topic. These should be real, publicly accessible URLs.'),
    })
  ).describe('A list of learning path steps.'),
});
export type GeneratePersonalizedLearningPathOutput = z.infer<typeof GeneratePersonalizedLearningPathOutputSchema>;

export async function generatePersonalizedLearningPath(
  input: GeneratePersonalizedLearningPathInput
): Promise<GeneratePersonalizedLearningPathOutput> {
  return generatePersonalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedLearningPathPrompt',
  input: {schema: GeneratePersonalizedLearningPathInputSchema},
  output: {schema: GeneratePersonalizedLearningPathOutputSchema},
  prompt: `You are an AI learning path generator. Generate a personalized learning path based on the user's skill level, interests, and learning goals.

Skill Level: {{{skillLevel}}}
Interests: {{{interests}}}
Learning Goals: {{{learningGoals}}}

Consider these factors when generating the learning path:

*   Start with the basics and gradually increase the complexity.
*   Include a variety of real, publicly accessible learning resources, such as articles, tutorials, and videos. Provide direct, valid URLs to these resources.
*   Provide hands-on exercises and projects to reinforce learning.
*   Offer personalized recommendations based on the user's progress.
*   Consider the time it will take to complete each lesson.

Output the learning path in JSON format. The "estimatedTime" field should be in a human-readable format, such as "1 hour", "2 days", or "1 week". The "resources" field must be an array of valid, publicly accessible URLs.

Here's the generated learning path:`,
});

const generatePersonalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedLearningPathFlow',
    inputSchema: GeneratePersonalizedLearningPathInputSchema,
    outputSchema: GeneratePersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

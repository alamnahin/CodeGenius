'use server';

/**
 * @fileOverview An AI agent that generates code from a description.
 *
 * - generateCodeFromDescription - A function that generates code from a description.
 * - GenerateCodeFromDescriptionInput - The input type for the generateCodeFromDescription function.
 * - GenerateCodeFromDescriptionOutput - The return type for the generateCodeFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromDescriptionInputSchema = z.object({
  description: z.string().describe('The description of the code to generate.'),
  language: z.string().describe('The programming language for the code.'),
});
export type GenerateCodeFromDescriptionInput = z.infer<typeof GenerateCodeFromDescriptionInputSchema>;

const GenerateCodeFromDescriptionOutputSchema = z.object({
  code: z.string().describe('The generated code.'),
});
export type GenerateCodeFromDescriptionOutput = z.infer<typeof GenerateCodeFromDescriptionOutputSchema>;

export async function generateCodeFromDescription(
  input: GenerateCodeFromDescriptionInput
): Promise<GenerateCodeFromDescriptionOutput> {
  return generateCodeFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromDescriptionPrompt',
  input: {schema: GenerateCodeFromDescriptionInputSchema},
  output: {schema: GenerateCodeFromDescriptionOutputSchema},
  prompt: `You are an expert software developer that can generate code snippets in any language.

  Given a description of the code to generate and the desired programming language, generate the code.

  Description: {{{description}}}
  Language: {{{language}}}

  Here is the code:`,
});

const generateCodeFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCodeFromDescriptionFlow',
    inputSchema: GenerateCodeFromDescriptionInputSchema,
    outputSchema: GenerateCodeFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating AI responses to user queries.
 *
 * generateResponse - An async function that takes a user query and returns an AI-generated response.
 * GenerateResponseInput - The input type for the generateResponse function, which is a string representing the user's query.
 * GenerateResponseOutput - The output type for the generateResponse function, which is a string representing the AI's response.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateResponseInputSchema = z.object({
  query: z.string().describe('The user query to generate a response for.'),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The AI generated response to the query.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

const generateResponsePrompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {
    schema: z.object({
      query: z.string().describe('The user query to generate a response for.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI generated response to the query.'),
    }),
  },
  prompt: `You are an AI assistant designed to provide helpful and informative responses to user queries.

  User Query: {{{query}}}

  Please generate a response to the above query. Make the response helpful and relevant. If asked to provide code, use markdown formatting to wrap the code in triple backticks. If asked to create lists, use markdown formatting to create the lists.`,
});

const generateResponseFlow = ai.defineFlow<
  typeof GenerateResponseInputSchema,
  typeof GenerateResponseOutputSchema
>({
  name: 'generateResponseFlow',
  inputSchema: GenerateResponseInputSchema,
  outputSchema: GenerateResponseOutputSchema,
}, async input => {
  const {output} = await generateResponsePrompt(input);
  return output!;
});




'use server';
/**
 * @fileOverview This file defines a Genkit flow to summarize chat history.
 *
 * summarizeChat - An async function that takes chat history and returns a summary.
 * SummarizeChatInput - The input type for the summarizeChat function, an array of messages.
 * SummarizeChatOutput - The output type for the summarizeChat function, a string summary.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeChatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).describe('The chat history to summarize.'),
});
export type SummarizeChatInput = z.infer<typeof SummarizeChatInputSchema>;

const SummarizeChatOutputSchema = z.object({
  summary: z.string().describe('A summary of the chat history.'),
});
export type SummarizeChatOutput = z.infer<typeof SummarizeChatOutputSchema>;

export async function summarizeChat(input: SummarizeChatInput): Promise<SummarizeChatOutput> {
  return summarizeChatFlow(input);
}

const summarizeChatPrompt = ai.definePrompt({
  name: 'summarizeChatPrompt',
  input: {
    schema: z.object({
      messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
      })).describe('The chat history to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the chat history.'),
    }),
  },
  prompt: `You are an AI assistant designed to summarize chat histories. Please provide a concise summary of the following conversation.  Focus on the key discussion points, decisions made, and any important information exchanged.\n\nChat History:\n{{#each messages}}\n{{role}}: {{content}}\n{{/each}}\n\nSummary: `,
});

const summarizeChatFlow = ai.defineFlow<
  typeof SummarizeChatInputSchema,
  typeof SummarizeChatOutputSchema
>({
  name: 'summarizeChatFlow',
  inputSchema: SummarizeChatInputSchema,
  outputSchema: SummarizeChatOutputSchema,
}, async input => {
  const {output} = await summarizeChatPrompt(input);
  return output!;
});

// A Genkit flow for analyzing past trades and providing personalized suggestions for better decision-making.

'use server';

/**
 * @fileOverview An AI agent that analyzes past trades to identify patterns and potential areas for improvement.
 *
 * - analyzeTrades - A function that analyzes the trades.
 * - AnalyzeTradesInput - The input type for the analyzeTrades function.
 * - AnalyzeTradesOutput - The return type for the analyzeTrades function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTradesInputSchema = z.object({
  tradeData: z.string().describe('A JSON string containing an array of trade objects, each with details like currency pair, entry and exit prices, lot size, and date.'),
});
export type AnalyzeTradesInput = z.infer<typeof AnalyzeTradesInputSchema>;

const AnalyzeTradesOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the trade data, identifying patterns, areas for improvement, and personalized suggestions for better decision-making.'),
});
export type AnalyzeTradesOutput = z.infer<typeof AnalyzeTradesOutputSchema>;

export async function analyzeTrades(input: AnalyzeTradesInput): Promise<AnalyzeTradesOutput> {
  return analyzeTradesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTradesPrompt',
  input: {schema: AnalyzeTradesInputSchema},
  output: {schema: AnalyzeTradesOutputSchema},
  prompt: `You are an expert trading analyst. Analyze the following trade data and provide a detailed analysis, identifying patterns, areas for improvement, and personalized suggestions for better decision-making.

Trade Data:
{{{tradeData}}}`,
});

const analyzeTradesFlow = ai.defineFlow(
  {
    name: 'analyzeTradesFlow',
    inputSchema: AnalyzeTradesInputSchema,
    outputSchema: AnalyzeTradesOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.tradeData);
    } catch (e) {
      throw new Error('Invalid JSON format for trade data.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview An AI agent that provides a weekly trading review and personalized advice.
 *
 * - generateWeeklyReview - A function that analyzes the last week's trades.
 * - WeeklyReviewInput - The input type for the generateWeeklyReview function.
 * - WeeklyReviewOutput - The return type for the generateWeeklyReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeeklyReviewInputSchema = z.object({
  tradeData: z.string().describe('A JSON string containing an array of trade objects from the last 7 days, each with details like currency pair, entry and exit prices, lot size, and date.'),
});
export type WeeklyReviewInput = z.infer<typeof WeeklyReviewInputSchema>;

const WeeklyReviewOutputSchema = z.object({
  analysis: z.string().describe('A detailed weekly analysis of the trade data, identifying performance summary, patterns, areas for improvement, and personalized suggestions for better decision-making for the next week.'),
});
export type WeeklyReviewOutput = z.infer<typeof WeeklyReviewOutputSchema>;

export async function generateWeeklyReview(input: WeeklyReviewInput): Promise<WeeklyReviewOutput> {
  return weeklyReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weeklyReviewPrompt',
  input: {schema: WeeklyReviewInputSchema},
  output: {schema: WeeklyReviewOutputSchema},
  prompt: `You are an expert trading coach. Analyze the following trade data from the last week and provide a concise weekly review.

Your analysis should include:
1.  **Performance Summary:** Briefly summarize the net profit/loss, win rate, and total trades.
2.  **Key Observations:** Identify 1-2 notable patterns (e.g., "You excel with the '1G' strategy," or "Most losses occurred in the morning").
3.  **Actionable Advice:** Provide 2-3 clear, personalized suggestions for the upcoming week based on the data. Focus on improving discipline, strategy execution, or risk management.

Keep the tone encouraging and constructive.

Weekly Trade Data:
{{{tradeData}}}`,
});

const weeklyReviewFlow = ai.defineFlow(
  {
    name: 'weeklyReviewFlow',
    inputSchema: WeeklyReviewInputSchema,
    outputSchema: WeeklyReviewOutputSchema,
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

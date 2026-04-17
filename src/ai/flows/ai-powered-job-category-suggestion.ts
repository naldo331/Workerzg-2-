'use server';
/**
 * @fileOverview An AI agent that suggests job categories based on a job description.
 *
 * - suggestJobCategories - A function that handles the job category suggestion process.
 * - JobDescriptionInput - The input type for the suggestJobCategories function.
 * - JobCategorySuggestionOutput - The return type for the suggestJobCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('A detailed description of the job request.'),
});
export type JobDescriptionInput = z.infer<typeof JobDescriptionInputSchema>;

const JobCategorySuggestionOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('A list of suggested job categories.'),
});
export type JobCategorySuggestionOutput = z.infer<
  typeof JobCategorySuggestionOutputSchema
>;

export async function suggestJobCategories(
  input: JobDescriptionInput
): Promise<JobCategorySuggestionOutput> {
  return aiPoweredJobCategorySuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredJobCategorySuggestionPrompt',
  input: {schema: JobDescriptionInputSchema},
  output: {schema: JobCategorySuggestionOutputSchema},
  prompt: `You are an AI assistant specialized in categorizing job requests for a marketplace called 'Workers Guild'.

Based on the provided job description, suggest up to 3 relevant job categories. Choose from general categories like 'Yard Work', 'House Cleaning', 'Construction', 'Repairs', 'Babysitting', 'Moving Help', 'Entertainment', or other similar common service categories. If no specific category from the provided list fits, suggest the most appropriate general service category.

Job Description: {{{jobDescription}}}

Provide only the category names in a JSON array, as per the output schema.`,
});

const aiPoweredJobCategorySuggestionFlow = ai.defineFlow(
  {
    name: 'aiPoweredJobCategorySuggestionFlow',
    inputSchema: JobDescriptionInputSchema,
    outputSchema: JobCategorySuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

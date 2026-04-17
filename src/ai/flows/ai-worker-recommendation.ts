'use server';
/**
 * @fileOverview An AI agent that recommends suitable workers for a given job request.
 *
 * - recommendWorkers - A function that handles the worker recommendation process.
 * - AIWorkerRecommendationInput - The input type for the recommendWorkers function.
 * - AIWorkerRecommendationOutput - The return type for the recommendWorkers function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIWorkerRecommendationInputSchema = z.object({
  jobDescription: z.string().describe('The detailed description of the job.'),
  requiredSkills: z.array(z.string()).describe('A list of skills required for the job.'),
  jobLocation: z.string().describe('The geographical location where the job needs to be performed.'),
  budget: z.number().describe('The budget allocated for the job.'),
  date: z.string().describe('The preferred date for the job (e.g., "YYYY-MM-DD").'),
  time: z.string().describe('The preferred time for the job (e.g., "HH:MM").'),
  availableWorkers: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the worker.'),
      name: z.string().describe('The name of the worker.'),
      skills: z.array(z.string()).describe('A list of skills the worker possesses.'),
      location: z.string().describe('The primary working location of the worker.'),
      rating: z.number().min(1).max(5).describe('The average rating of the worker (1-5 stars).'),
      rank: z.enum(['Bronze', 'Silver', 'Gold', 'Platinum', 'Elite']).describe('The Guild rank of the worker.'),
      availability: z.string().describe('A description of the worker\'s general availability (e.g., "weekdays", "weekends", "Mondays and Tuesdays").'),
    })
  ).describe('A list of workers available for recommendation.'),
});
export type AIWorkerRecommendationInput = z.infer<typeof AIWorkerRecommendationInputSchema>;

const AIWorkerRecommendationOutputSchema = z.object({
  recommendedWorkers: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the recommended worker.'),
      reason: z.string().describe('A brief explanation why this worker is recommended for the job.'),
    })
  ).describe('A list of workers recommended for the job, with reasons.'),
});
export type AIWorkerRecommendationOutput = z.infer<typeof AIWorkerRecommendationOutputSchema>;

export async function recommendWorkers(input: AIWorkerRecommendationInput): Promise<AIWorkerRecommendationOutput> {
  return aiWorkerRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWorkerRecommendationPrompt',
  input: { schema: AIWorkerRecommendationInputSchema },
  output: { schema: AIWorkerRecommendationOutputSchema },
  prompt: `You are an intelligent assistant for the 'Workers Guild' platform, specializing in recommending suitable workers for job requests.

Here is a detailed description of the job:
Job Description: {{{jobDescription}}}
Required Skills: {{#each requiredSkills}}- {{{this}}}{{/each}}
Job Location: {{{jobLocation}}}
Budget: {{{budget}}}
Date: {{{date}}}
Time: {{{time}}}

Here is a list of available workers and their profiles:
{{#each availableWorkers}}
Worker ID: {{{this.id}}}
Name: {{{this.name}}}
Skills: {{#each this.skills}}- {{{this}}}{{/each}}
Location: {{{this.location}}}
Rating: {{{this.rating}}} stars
Rank: {{{this.rank}}}
Availability: {{{this.availability}}}
---
{{/each}}

Your task is to review the job details and the available workers. Recommend the top 1-3 most suitable workers for this job based on their skills, location, rating, rank, and general availability. Provide a concise reason for each recommendation.

If no workers are suitable, return an empty array for recommendedWorkers.`,
});

const aiWorkerRecommendationFlow = ai.defineFlow(
  {
    name: 'aiWorkerRecommendationFlow',
    inputSchema: AIWorkerRecommendationInputSchema,
    outputSchema: AIWorkerRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

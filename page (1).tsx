'use server';
/**
 * @fileOverview A flow for chatting about tournament posts.
 *
 * - tournamentChat - A function that handles the AI chat logic for a tournament post.
 * - TournamentChatInput - The input type for the tournamentChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { type TournamentPost } from '@/lib/types';

const TournamentChatInputSchema = z.object({
  postText: z.string().describe('The text content of the tournament post.'),
  postImage: z.string().nullable().describe("A relevant image for the post, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation so far.'),
});

export type TournamentChatInput = z.infer<typeof TournamentChatInputSchema>;

export async function tournamentChat(input: TournamentChatInput): Promise<string> {
    const response = await tournamentChatFlow(input);
    return response;
}

const systemPrompt = `Eres un Analista de Trading Experto y un coach. Tu tarea es analizar la publicación de un torneo de trading que te proporcionará un usuario y conversar con él al respecto. La publicación puede contener texto y una imagen.

Debes analizar el contenido (texto e imagen) y el historial del chat para proporcionar respuestas perspicaces, hacer preguntas relevantes y ofrecer consejos constructivos. Ayuda al usuario a reflexionar sobre su rendimiento, estrategia y estado emocional.

Adopta un tono de apoyo pero profesional. Sé directo pero constructivo en tus críticas. Tu objetivo es ayudar al usuario a aprender y mejorar.`;

const tournamentChatFlow = ai.defineFlow(
  {
    name: 'tournamentChatFlow',
    inputSchema: TournamentChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    
    const prompt: any[] = [
        { role: 'system', content: systemPrompt }
    ];

    // Add context from the post
    const postContext: any[] = [];
    if(input.postImage) {
        postContext.push({ media: { url: input.postImage } });
    }
    if(input.postText) {
        postContext.push({ text: `Aquí está el texto de mi publicación para analizar:\n\n---\n${input.postText}\n---` });
    }
    
    prompt.push({ role: 'user', content: postContext });
    prompt.push({ role: 'model', content: "Entendido. He analizado la publicación. ¿Sobre qué te gustaría que habláramos?" });
    
    // Add chat history
    input.chatHistory.forEach(msg => {
        prompt.push({ role: msg.role, content: msg.content });
    });

    const { output } = await ai.generate({
      prompt: prompt,
    });
    
    return output?.text ?? 'No he podido generar una respuesta.';
  }
);

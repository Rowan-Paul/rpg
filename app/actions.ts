'use server';

import { env } from '@/env';
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Generative AI SDK
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function generateContent(topic: string) {
  try {
    // Generate script using Gemini
    const scriptPrompt = `
        Write a script about ${topic}.
        The script should be engaging and informative, suitable for a YouTube Short video.
        Keep the script concise and to the point, focusing on key details and interesting facts.
        Aim for a script that is approximately 60 seconds long when read aloud.
        I want to read the script using TTS so do NOT include any visual cues or instructions.  
    `;

    const scriptResult = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: scriptPrompt
    });
    const script = scriptResult.text;

    // Generate image prompts based on the script
    const imagePromptRequest = `
      Generate 10 images about ${topic}.
      The images should be visually appealing and relevant to the content of the script.
      Do NOT include any text in the images, focusing solely on visual content.
      Use a 9:16 aspect ratio for the images to fit the vertical format of a YouTube Short.
      The images should be in a vertical format.
      Always return at least 10 images about ${topic}.
    `;

    const imagePromptsResult = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: imagePromptRequest,
      config: {
        responseModalities: ['Text', 'Image']
      }
    });

    const generatedImages: string[] = [];

    if (
      !imagePromptsResult.candidates ||
      !imagePromptsResult.candidates[0].content ||
      !imagePromptsResult.candidates[0].content.parts
    )
      throw new Error('Failed to generate image prompts');

    for (const part of imagePromptsResult.candidates[0].content.parts) {
      if (part.inlineData) {
        // Store the base64 string directly instead of converting to Buffer
        generatedImages.push(part.inlineData.data as string);
      }
    }

    return {
      script: script || '',
      imagePrompts: generatedImages.length ? generatedImages : [],
      rawData: imagePromptsResult.candidates
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again later.');
  }
}

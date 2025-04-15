import OpenAI from "openai";
import * as dotenv from "dotenv";
import { signNearLoginMessage } from "./near";


const nonce = String(Date.now());
const recipient = 'unreal.near';
const callbackUrl = 'https://your.app/auth/callback';

 const auth = await signNearLoginMessage({
    message: 'Login to NEAR AI',
    nonce,
    recipient,
    callbackUrl
  });


console.log('Auth response:', auth);

process.env.OPENAI_BASE_URL = "https://api.near.ai/v1"; // Set the base URL for the OpenAI API
process.env.OPENAI_API_KEY = `Bearer ${JSON.stringify(auth)}`

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in the .env file
});



async function generateImage(prompt: string): Promise<void> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3", // Use DALL-E 3 for high-quality images
      prompt: prompt,    // The text prompt for image generation
      n: 1,              // Number of images to generate
      size: "1024x1024", // Image resolution (can be 256x256, 512x512, or 1024x1024)
    });

    console.log("Generated Image URL:", response.data[0].url);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

// Example usage
const prompt = "A futuristic cityscape with flying cars and neon lights";

console.log("Prompt is "+prompt)
generateImage(prompt);

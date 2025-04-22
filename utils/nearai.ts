import OpenAI from "openai";
import * as dotenv from "dotenv";
import { signNearLoginMessage } from "./near";
import { saveImageToFile } from "./same-image";


const nonce = String(Date.now());
const recipient = 'unreal.near';
const callbackUrl = 'https://your.app/auth/callback';

//  const auth = await signNearLoginMessage({
//     message: 'Login to NEAR AI',
//     nonce,
//     recipient,
//     callbackUrl
//   });

const auth =  {
        "account_id": "hirocoin.near",
        "signature": "syCVwqm03oTk5CTHc/btmNX4Rtb59VTV8r3pmSniSFyY98t0oqLY7FLC8QWlPPzv4pbm7crdxc49MwHH2bNMBA==",
        "public_key": "ed25519:GSawU7vtBcUCq3m9VyETsp9xzUz1L5XBf9H4JkdngfyX",
        "callback_url": "http://localhost:63580/capture",
        "nonce": "1744849079161",
        "recipient": "ai.near",
        "message": "Welcome to NEAR AI",
        "on_behalf_of": null
  }


// console.log('Auth response:', auth);

process.env.OPENAI_BASE_URL = "https://api.near.ai/v1"; // Set the base URL for the OpenAI API
process.env.OPENAI_API_KEY = `Bearer ${JSON.stringify(auth)}`

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored in the .env file
  // apiKey: auth.signature, // Ensure your API key is stored in the .env file
});



async function generateImage(prompt: string): Promise<String | void> {
  try {
    const response = await openai.images.generate({
      prompt: prompt,    // The text prompt for image generation
      // n: 1,              // Number of images to generate
      // size: "1024x1024", // Image resolution (can be 256x256, 512x512, or 1024x1024)
    });

    // console.log(response)

    if (response.data && response.data[0] && response.data[0].b64_json) {
      const filePath = await saveImageToFile(response.data[0].b64_json, prompt);
      console.log(`Image successfully saved to: ${filePath}`);
      return filePath;
    } else {
      throw new Error('No image data found in the API response');
    }
    // console.log("Generated Image URL:", response.data[0].url);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

// Example usage
const prompt = "A futuristic cityscape with flying cars and neon lights";

console.log("Prompt : "+prompt)
await generateImage(prompt);

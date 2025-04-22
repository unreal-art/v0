import * as fs from 'fs';
import * as path from 'path';

// Function to save base64 image to a file
export async function saveImageToFile(base64Image: string, promptText: string): Promise<string> {
  try {
    // Remove any potential data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Create a buffer from the base64 data
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a safe filename from the prompt
    const safePrompt = promptText
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace non-alphanumeric chars with underscore
      .substring(0, 100); // Limit length to avoid extremely long filenames
    
    const filename = `${safePrompt}.png`;
    const filepath = path.resolve(process.cwd(), filename);
    
    // Write the buffer to file
    await fs.promises.writeFile(filepath, buffer);
    
    return filepath;
  } catch (error) {
    console.error('Error saving image to file:', error);
    throw error;
  }
}
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Pet Astronaut Inpainting App - Environment Setup');
console.log('==============================================');
console.log('This script will help you set up your .env file with your Replicate API token.');
console.log('You can get a token by signing up at https://replicate.com');
console.log('');

rl.question('Enter your Replicate API token: ', (token) => {
  if (!token) {
    console.log('No token provided. Setup cancelled.');
    rl.close();
    return;
  }

  const envContent = `REPLICATE_API_TOKEN=${token}`;
  const envPath = path.join(__dirname, '.env');

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\nSuccess! .env file created with your Replicate API token.');
    console.log('You can now run the application with: npm run dev');
  } catch (error) {
    console.error('Error creating .env file:', error.message);
  }

  rl.close();
});

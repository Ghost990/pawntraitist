import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Pet Astronaut Inpainting App - Image Setup');
console.log('=========================================');
console.log('This script will create placeholder images for the application.');
console.log('');

// Create directories if they don't exist
const publicDir = path.join(__dirname, 'public');
const sourceDir = path.join(__dirname, 'src', 'image-styles', 'example');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`Created directory: ${publicDir}`);
}

if (!fs.existsSync(sourceDir)) {
  fs.mkdirSync(sourceDir, { recursive: true });
  console.log(`Created directory: ${sourceDir}`);
}

// Create placeholder images with SVG content
const createPlaceholderImage = (filePath, type) => {
  let svgContent;
  
  if (type === 'astronaut') {
    // Astronaut suit placeholder
    svgContent = `<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1200" fill="#f0f0f0"/>
      <rect x="250" y="300" width="300" height="400" fill="#d0d0d0" stroke="#808080" stroke-width="2"/>
      <circle cx="400" cy="250" r="150" fill="#f0f0f0" stroke="#808080" stroke-width="2"/>
      <text x="400" y="600" font-family="Arial" font-size="24" text-anchor="middle" fill="#404040">Astronaut Suit Placeholder</text>
      <text x="400" y="650" font-family="Arial" font-size="18" text-anchor="middle" fill="#404040">(Replace with actual astronaut image)</text>
    </svg>`;
  } else if (type === 'mask') {
    // Mask placeholder
    svgContent = `<svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1200" fill="#000000"/>
      <circle cx="400" cy="250" r="150" fill="#ffffff"/>
      <text x="400" y="600" font-family="Arial" font-size="24" text-anchor="middle" fill="#ffffff">Mask Placeholder</text>
      <text x="400" y="650" font-family="Arial" font-size="18" text-anchor="middle" fill="#ffffff">(Replace with actual mask image)</text>
    </svg>`;
  }

  fs.writeFileSync(filePath, svgContent);
  console.log(`Created placeholder image: ${filePath}`);
};

// Create placeholder images in both directories
const astronautPublicPath = path.join(publicDir, 'nasa_ref.jpg');
const maskPublicPath = path.join(publicDir, 'nasa_ref_mask.png');
const astronautSourcePath = path.join(sourceDir, 'nasa_ref.jpg');
const maskSourcePath = path.join(sourceDir, 'nasa_ref_mask.png');

createPlaceholderImage(astronautPublicPath, 'astronaut');
createPlaceholderImage(maskPublicPath, 'mask');
createPlaceholderImage(astronautSourcePath, 'astronaut');
createPlaceholderImage(maskSourcePath, 'mask');

console.log('\nPlaceholder images have been created successfully!');
console.log('Replace these with your actual astronaut and mask images before using the application.');
console.log('\nNext steps:');
console.log('1. Run "npm run setup" to configure your Replicate API token');
console.log('2. Run "npm run dev" to start the development server');

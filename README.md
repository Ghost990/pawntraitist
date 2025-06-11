# Pet Astronaut Inpainting Application

This is a [Next.js](https://nextjs.org) project that performs photorealistic inpainting using ControlNet and reference-based guidance through the Replicate API. The application allows users to upload a pet image and blend it realistically into an astronaut suit.

## Features

- Upload a pet image as a reference
- Automatically inpaint the pet's head onto an astronaut suit
- Seamless blending with no visible edges or distortions
- Preserves the pet's identity, including shape, eyes, fur texture, colors, and facial expression
- Download the resulting image

## Quick Setup

```bash
# Install dependencies
npm install

# Set up placeholder images
npm run setup-images

# Configure your Replicate API token
npm run setup

# Start the development server
npm run dev
```

## Detailed Setup Instructions

### Prerequisites

- Node.js (version 18 or higher)
- Replicate API token (get one at [replicate.com](https://replicate.com))

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Images

The application requires two specific images:

1. **Astronaut Image**: A high-resolution portrait-oriented photo of an astronaut suit with the head region removed
2. **Mask Image**: A black-and-white mask where the head area is white (to be inpainted)

Run the following command to create placeholder images:

```bash
npm run setup-images
```

This will create SVG placeholders in both the source directory and the public directory. For the best results, replace these placeholders with actual images before using the application.

### Step 3: Configure Replicate API Token

Run the setup script to configure your Replicate API token:

```bash
npm run setup
```

This will prompt you to enter your Replicate API token and create a `.env` file.

### Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000) (or another port if 3000 is already in use).

## How to Use

1. Open the application in your browser
2. Upload a pet image using the file upload area
3. Click the "Create Pet Astronaut" button
4. Wait for the processing to complete
5. View and download your generated image

## Technical Details

This application uses:

- **Next.js 15.3.3**: For the frontend and API routes
- **Replicate API**: To call the lucataco/sdxl-inpainting model
- **ControlNet**: For precise inpainting
- **IP-Adapter**: For reference-based guidance
- **React Dropzone**: For file uploads

### How It Works

1. The user uploads a pet image as a reference
2. The application sends the astronaut image, mask, and reference image to the Replicate API
3. The API processes the images using ControlNet for inpainting and IP-Adapter for reference-based guidance
4. The result is returned to the user as a photorealistic image

## Input Images

- **Astronaut Image**: A high-resolution portrait-oriented photo of an astronaut suit with the head region removed
- **Mask Image**: A black-and-white mask where the head area is white (to be inpainted)
- **Reference Image**: User-uploaded photo of a pet (e.g., a cat or dog), clearly showing the pet's head

## Troubleshooting

- **API Token Issues**: Make sure your Replicate API token is correctly set in the `.env` file
- **Image Loading Problems**: Ensure that the astronaut and mask images exist in the public directory
- **Processing Errors**: Check the browser console for detailed error messages

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

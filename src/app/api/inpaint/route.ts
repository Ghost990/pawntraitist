import Replicate from 'replicate';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Ensure REPLICATE_API_TOKEN is loaded
if (!process.env.REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN is not set. Please check your .env file.');
  // Optionally, throw an error during server startup or handle gracefully
  // For now, we'll let the Replicate client constructor handle it, which might throw an error.
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Define a type for potential Replicate error objects within the response body
type ReplicateErrorOutput = {
  error?: string | object; // Replicate often returns error as a string
  title?: string; // Sometimes it's an object with title/detail/status
  detail?: string;
  status?: number;
};

export const maxDuration = 300; // Set max duration to 5 minutes for long-running API calls

export async function POST(request: NextRequest) {
  console.log('IP-Adapter Face-Inpaint API route hit');

  const data = await request.formData();
  const referenceImageFile = data.get('reference_image') as File | null;

  if (!referenceImageFile) {
    console.error('Missing reference_image in form data');
    return NextResponse.json({ error: 'Missing reference_image (pet head)' }, { status: 400 });
  }

  // Define paths for predefined local images
  const astronautImagePath = path.join(process.cwd(), 'public', 'nasa.jpg');
  const maskImagePath = path.join(process.cwd(), 'public', 'mask.png');

  // Check if predefined images exist
  if (!fs.existsSync(astronautImagePath)) {
    console.error(`Astronaut image (expected nasa.jpg) not found at: ${astronautImagePath}`);
    return NextResponse.json({ error: 'Server configuration error: Astronaut image (nasa.jpg) missing.' }, { status: 500 });
  }
  if (!fs.existsSync(maskImagePath)) {
    console.error(`Mask image not found at: ${maskImagePath}`);
    return NextResponse.json({ error: 'Server configuration error: Mask image missing.' }, { status: 500 });
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'replicate-ip-adapter-'));
  const tempReferenceImagePath = path.join(tempDir, `ref-${Date.now()}-${referenceImageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);

  let output: string | ReplicateErrorOutput | undefined | null; // Replicate's ip-adapter-face-inpaint returns a single string URL

  try {
    // Write uploaded reference image to a temporary file
    const referenceImageBuffer = await referenceImageFile.arrayBuffer();
    await fs.promises.writeFile(tempReferenceImagePath, Buffer.from(referenceImageBuffer));

    console.log('Sending request to Replicate API (lucataco/ip_adapter-face-inpaint)...');

    // Inputs will be file streams, letting Replicate client handle them.
    // mask.png is not used as the model generates its own mask.

    const modelInput = {
      source_image: fs.createReadStream(astronautImagePath), // Astronaut suit image as a stream
      face_image: fs.createReadStream(tempReferenceImagePath), // Pet head image as a stream
      prompt: "Precisely copy the exact head from the pet reference image onto the astronaut suit image, ensuring seamless blending, realistic lighting, perfect alignment, and preservation of the pet's features.",
      strength: 0.9, // Model default is 0.7. This matches a defined input in predict.py.
      // negative_prompt, guidance_scale, num_inference_steps removed as they are not direct inputs in predict.py
      // Mask is also not sent, as the model generates it internally.
    };

    console.log('Replicate input (logging paths for streams):', {
        ...modelInput,
        source_image: astronautImagePath, // Log path instead of stream object
        face_image: tempReferenceImagePath // Log path instead of stream object
        // Mask is not logged as it's not an input
    });

    output = await replicate.run(
      "lucataco/ip-adapter-face-inpaint:b199f118e2133894551cc59ff0777276e275cf64e9e8e0369ca6c4c599097890", // Updated model ID
      {
        input: modelInput
      }
    );

  } catch (apiError: unknown) {
    let errorMessage = 'Replicate API call failed';
    if (apiError instanceof Error) {
      errorMessage = apiError.message;
    } else if (typeof apiError === 'string') {
      errorMessage = apiError;
    } else if (typeof apiError === 'object' && apiError !== null) {
        // Attempt to stringify if it's an object, common for Replicate errors
        errorMessage = JSON.stringify(apiError);
    }
    console.error('Error calling Replicate API (lucataco/ip_adapter-face-inpaint):', apiError);
    // Store error in a way that the response handling logic can process it
    output = { error: `API Error: ${errorMessage}` };
  } finally {
    // Clean up temporary reference image file and directory
    try {
      if (fs.existsSync(tempReferenceImagePath)) {
        await fs.promises.unlink(tempReferenceImagePath);
      }
    } catch (e) {
      console.warn(`Failed to delete temp reference image file: ${tempReferenceImagePath}`, e);
    }
    try {
      if (fs.existsSync(tempDir)){
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn(`Failed to delete temp directory: ${tempDir}`, e);
    }
  }

  // Process the output from the Replicate API call
  try {
    console.log('Received response from Replicate API. Raw output:', JSON.stringify(output, null, 2));
    let imageUrl: string | undefined;

    if (!output) {
      console.error('Replicate API call resulted in undefined or null output.');
      throw new Error('Model call failed: No output received from Replicate.');
    }

    if (typeof output === 'string') {
      imageUrl = output;
    } else if (typeof output === 'object' && output !== null && ('error' in output || 'title' in output || 'detail' in output)) {
      const replicateError = output as ReplicateErrorOutput;
      const errorDetails = typeof replicateError.error === 'string' ? replicateError.error : JSON.stringify(replicateError.error) || replicateError.detail || JSON.stringify(replicateError);
      console.error('Replicate API returned an error object:', errorDetails);
      throw new Error(`Model execution failed: ${errorDetails}`);
    } else {
      // This case handles unexpected output formats, including arrays if the model were to return one.
      // The target model lucataco/ip-adapter-face-inpaint is expected to return a single string URL.
      console.error('Replicate API returned an unexpected result format. Output:', output);
      throw new Error('Model returned an unexpected result format.');
    }

    if (!imageUrl) {
      console.error('Failed to extract imageUrl from model output. Output:', output);
      throw new Error('Internal server error: Failed to process model output.');
    }

    console.log('Extracted image URL:', imageUrl);
    return NextResponse.json({ result: imageUrl });

  } catch (processingError: unknown) {
    let errorMessage = 'Unknown error during API response processing';
    if (processingError instanceof Error) {
      errorMessage = processingError.message;
    } else if (typeof processingError === 'string') {
      errorMessage = processingError;
    }
    console.error('Error processing Replicate API response:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } // Closes catch (processingError: unknown)
}
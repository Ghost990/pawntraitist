"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string>("");
  const [resultImage, setResultImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [astronautImage, setAstronautImage] = useState<string>("");
  const [maskImage, setMaskImage] = useState<string>("");

  // Load the astronaut and mask images on component mount
  useEffect(() => {
    // Set paths to the static images
    const astronautPath = "/nasa.jpg";
    const maskPath = "/mask.png";
    
    // Check if images exist by preloading them
    const preloadAstronaut = new window.Image();
    const preloadMask = new window.Image();
    
    preloadAstronaut.onload = () => setAstronautImage(astronautPath);
    preloadAstronaut.onerror = () => {
      console.error("Failed to load astronaut image");
      setError("Failed to load astronaut image. Please check that the image exists in the public directory.");
    };
    
    preloadMask.onload = () => setMaskImage(maskPath);
    preloadMask.onerror = () => {
      console.error("Failed to load mask image");
      setError("Failed to load mask image. Please check that the image exists in the public directory.");
    };
    
    preloadAstronaut.src = astronautPath;
    preloadMask.src = maskPath;
    
    // Clean up function to prevent memory leaks
    return () => {
      preloadAstronaut.onload = null;
      preloadAstronaut.onerror = null;
      preloadMask.onload = null;
      preloadMask.onerror = null;
    };
  }, []);

  // Dropzone configuration for reference image upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": []
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setReferenceImage(file);
      
      // Create preview URL for the uploaded image
      const previewUrl = URL.createObjectURL(file);
      setReferencePreview(previewUrl);
    }
  });

  // Handle the inpainting process
  const handleInpaint = async () => {
    if (!referenceImage) {
      setError("Please upload a reference image first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("reference_image", referenceImage); // Backend expects 'reference_image'

      console.log('Sending request to /api/inpaint with reference_image...');
      const response = await fetch("/api/inpaint", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          // Keep the original errorMsg if parsing fails
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (!data.result || typeof data.result !== 'string') {
        console.error('Invalid or missing result URL in API response:', data.result);
        throw new Error('Failed to get a valid image URL from the API.');
      }

      const imageUrl = data.result.trim();
      if (!imageUrl) {
        throw new Error('Empty image URL received from the API');
      }

      // Validate that the URL is properly formatted
      try {
        new URL(imageUrl); // This will throw if the URL is invalid
        console.log('Setting valid result image URL:', imageUrl);
        setResultImage(imageUrl);
      } catch (urlError) {
        console.error('Invalid URL format:', imageUrl, urlError);
        throw new Error('Invalid URL format received from the API.');
      }
    } catch (err) {
      console.error("Error during inpainting:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Pet Astronaut Inpainting</h1>
        <p className="text-gray-600">Upload a pet image to create a photorealistic pet astronaut</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Astronaut Image</h2>
            {astronautImage ? (
              <div className="relative h-80 w-full">
                <Image 
                  src={astronautImage} 
                  alt="Astronaut suit with head area removed" 
                  fill 
                  className="object-contain rounded-md" 
                />
              </div>
            ) : (
              <div className="h-80 bg-gray-200 rounded-md flex items-center justify-center">
                <p>Loading astronaut image...</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Mask Image</h2>
            {maskImage ? (
              <div className="relative h-80 w-full">
                <Image 
                  src={maskImage} 
                  alt="Mask for inpainting" 
                  fill 
                  className="object-contain rounded-md" 
                />
              </div>
            ) : (
              <div className="h-80 bg-gray-200 rounded-md flex items-center justify-center">
                <p>Loading mask image...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload Pet Reference Image</h2>
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input {...getInputProps()} />
              {referencePreview ? (
                <div className="relative h-80 w-full">
                  <Image 
                    src={referencePreview} 
                    alt="Uploaded pet reference" 
                    fill 
                    className="object-contain rounded-md" 
                  />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">Drag & drop a pet image here, or click to select one</p>
                  <p className="text-sm text-gray-400 mt-2">The pet&apos;s head will be used for the inpainting</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <button
              onClick={handleInpaint}
              disabled={!referenceImage || isLoading}
              className={`w-full py-3 rounded-md font-medium text-white ${!referenceImage || isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isLoading ? "Processing..." : "Create Pet Astronaut"}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          {resultImage && resultImage.trim() !== '' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Result</h2>
              <div className="relative h-96 w-full">
                <Image 
                  src={resultImage} 
                  alt="Generated pet astronaut" 
                  fill 
                  className="object-contain rounded-md" 
                  unoptimized // Add this to avoid optimization issues with external URLs
                />
              </div>
              <a 
                href={resultImage} 
                download="pet-astronaut.png"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-center py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Download Image
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

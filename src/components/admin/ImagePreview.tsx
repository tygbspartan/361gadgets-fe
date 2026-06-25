"use client";

import { useState, useEffect } from "react";
import { Package, AlertCircle } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({
  url,
  alt = "Preview",
  className = "",
}: ImagePreviewProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || url.trim() === "") {
      setIsValid(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setIsValid(null);
    setError(null);

    const img = document.createElement("img");

    const timeout = setTimeout(() => {
      setIsValid(false);
      setIsLoading(false);
      setError("Image load timeout");
      img.onload = null;
      img.onerror = null;
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      setIsValid(true);
      setIsLoading(false);
      setError(null);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      setIsValid(false);
      setIsLoading(false);
      setError("Failed to load image");
    };

    try {
      img.src = url;
    } catch (err) {
      clearTimeout(timeout);
      setIsValid(false);
      setIsLoading(false);
      setError("Invalid image URL");
    }

    return () => {
      clearTimeout(timeout);
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  if (!url || url.trim() === "") {
    return (
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
      >
        <Package className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isValid === false || error) {
    return (
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center p-4 ${className}`}
      >
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-xs text-red-600 text-center font-medium">
          {error || "Invalid image URL"}
        </p>
        <p className="text-xs text-red-500 text-center mt-1">
          Check the URL and try again
        </p>
      </div>
    );
  }

  if (isValid === true) {
    return (
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 ${className}`}
      >
        <img
          src={url}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            setIsValid(false);
            setError("Image failed to render");
          }}
        />
      </div>
    );
  }

  return null;
}

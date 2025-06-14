"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import Image from "next/image";

interface MediaInputProps {
  value: { images: string[]; videos: string[] };
  onChange: (value: { images: string[]; videos: string[] }) => void;
}

export function MediaInput({ value, onChange }: MediaInputProps) {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convertUnsplashUrl = (url: string): string => {
    // If it's already a direct Unsplash image URL, return as is
    if (url.includes("images.unsplash.com")) {
      return url;
    }

    // If it's an Unsplash page URL, convert to direct image URL
    if (url.includes("unsplash.com/photos/")) {
      const photoId = url.split("/photos/")[1].split("?")[0];
      return `https://images.unsplash.com/photo-${photoId}?w=800&auto=format&fit=crop&q=60`;
    }

    return url;
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      try {
        const url = new URL(newImageUrl.trim());
        const convertedUrl = convertUnsplashUrl(newImageUrl.trim());
        onChange({
          ...value,
          images: [...value.images, convertedUrl],
        });
        setNewImageUrl("");
        setError(null);
      } catch (e) {
        setError("Please enter a valid URL");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange({
      ...value,
      images: value.images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Images</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter image URL (supports Unsplash page URLs)"
            value={newImageUrl}
            onChange={(e) => {
              setNewImageUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImage();
              }
            }}
            className={error ? "border-red-500" : ""}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddImage}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {value.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  unoptimized={url.includes("unsplash.com")}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

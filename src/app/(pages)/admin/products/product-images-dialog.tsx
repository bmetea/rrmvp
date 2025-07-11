"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Plus, X, GripVertical } from "lucide-react";
import Image from "next/image";
import { updateProductAction } from "./actions";
import { toast } from "sonner";

interface ProductImagesDialogProps {
  productId: string;
  initialImages?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductImagesDialog({
  productId,
  initialImages = [],
  open,
  onOpenChange,
  onSuccess,
}: ProductImagesDialogProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
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
        new URL(newImageUrl.trim());
        const convertedUrl = convertUnsplashUrl(newImageUrl.trim());
        setImages([...images, convertedUrl]);
        setNewImageUrl("");
        setError(null);
      } catch {
        setError("Please enter a valid URL");
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProductAction(productId, {
        name: "", // These will be ignored by the server
        market_value: 0,
        is_wallet_credit: false,
        media_info: { images },
      });

      if (result.success) {
        onSuccess?.();
        onOpenChange(false);
        toast.success("Product images updated successfully");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to update product images:", error);
      toast.error("Failed to update product images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Product Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new image */}
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
            <Button onClick={handleAddImage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Image list */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="group relative"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", index.toString());
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(
                      e.dataTransfer.getData("text/plain")
                    );
                    moveImage(fromIndex, index);
                  }}
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg border">
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized={url.includes("unsplash.com")}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                      <GripVertical className="h-4 w-4 text-white drop-shadow-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No images added yet. Add some images using the input above.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

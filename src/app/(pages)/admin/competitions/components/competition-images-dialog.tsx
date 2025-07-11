"use client";

import { useState, useEffect } from "react";
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
import { updateCompetitionMediaAction } from "../actions";

interface CompetitionImagesDialogProps {
  competitionId: string;
  initialImages?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompetitionImagesDialog({
  competitionId,
  initialImages = [],
  open,
  onOpenChange,
  onSuccess,
}: CompetitionImagesDialogProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
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
      const result = await updateCompetitionMediaAction(competitionId, {
        images,
      });
      if (result.success) {
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update competition images:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Competition Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new image */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter image URL (supports Unsplash page URLs)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
            <Button onClick={handleAddImage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Image list */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {images.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted rounded-md group"
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
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <div className="relative h-16 w-16 flex-shrink-0">
                  <Image
                    src={url}
                    alt={`Competition image ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 text-sm truncate">{url}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export chunk retry utilities
export {
  ChunkErrorBoundary,
  useChunkRetry,
  withChunkErrorBoundary,
} from "./utils/chunk-retry";

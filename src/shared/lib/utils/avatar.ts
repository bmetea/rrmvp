import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

export function generateAvatar(seed: string, size: number = 24) {
  return createAvatar(bottts, {
    seed,
    size,
  }).toDataUri();
}

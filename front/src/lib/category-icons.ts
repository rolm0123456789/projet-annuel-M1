import {
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Tablet,
  Watch,
  Tv,
  Camera,
  Home,
  Cable,
  HardDrive,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

// Mapping purement visuel : associe une icône au slug d'une catégorie
// renvoyée par l'API (GET /api/products/Category).
export const categoryIcons: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  computers: Laptop,
  audio: Headphones,
  gaming: Gamepad2,
  tablets: Tablet,
  wearables: Watch,
  'tv-video': Tv,
  photo: Camera,
  'smart-home': Home,
  accessories: Cable,
  storage: HardDrive,
  network: Wifi,
};

export const getCategoryIcon = (categorySlug: string): LucideIcon => {
  return categoryIcons[categorySlug] || Cable; // Cable comme fallback
};

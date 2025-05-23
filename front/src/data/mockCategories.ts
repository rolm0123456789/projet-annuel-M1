import type { ProductCategory } from '@/types';
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
  type LucideIcon
} from 'lucide-react';

// Mapping des icônes par catégorie
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

// Fonction utilitaire pour récupérer l'icône d'une catégorie
export const getCategoryIcon = (categoryId: string): LucideIcon => {
  return categoryIcons[categoryId] || Cable; // Cable comme fallback
};

export const mockCategories: ProductCategory[] = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Découvrez notre sélection de smartphones dernière génération',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=400&fit=crop'
  },
  {
    id: 'computers',
    name: 'Ordinateurs',
    slug: 'ordinateurs',
    description: 'Ordinateurs portables et de bureau pour tous vos besoins',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop'
  },
  {
    id: 'audio',
    name: 'Audio',
    slug: 'audio',
    description: 'Écouteurs, casques et systèmes audio haute qualité',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=400&fit=crop'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Consoles, jeux et accessoires gaming',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=400&fit=crop'
  },
  {
    id: 'tablets',
    name: 'Tablettes',
    slug: 'tablettes',
    description: 'Tablettes pour le travail et le divertissement',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=400&fit=crop'
  },
  {
    id: 'wearables',
    name: 'Wearables',
    slug: 'wearables',
    description: 'Montres connectées et accessoires intelligents',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=400&fit=crop'
  },
  {
    id: 'tv-video',
    name: 'TV & Vidéo',
    slug: 'tv-video',
    description: 'Téléviseurs, projecteurs et équipements vidéo',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=400&fit=crop'
  },
  {
    id: 'photo',
    name: 'Photo',
    slug: 'photo',
    description: 'Appareils photo, objectifs et accessoires photo',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=400&fit=crop'
  },
  {
    id: 'smart-home',
    name: 'Maison connectée',
    slug: 'maison-connectee',
    description: 'Objets connectés et domotique pour votre maison',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'
  },
  {
    id: 'accessories',
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Coques, chargeurs, câbles et autres accessoires',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=400&fit=crop'
  },
  {
    id: 'storage',
    name: 'Stockage',
    slug: 'stockage',
    description: 'Disques durs, SSD et solutions de stockage',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=400&fit=crop'
  },
  {
    id: 'network',
    name: 'Réseau',
    slug: 'reseau',
    description: 'Routeurs, switches et équipements réseau',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=400&fit=crop'
  }
]; 
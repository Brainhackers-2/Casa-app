export type Region = 'Basse-Casamance' | 'Moyenne-Casamance' | 'Haute-Casamance';

export interface User {
  id: string; // UUID (Supabase)
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  birth_date?: string;
  birth_place?: string;
  created_at?: string;
}

export interface Location {
  id: string;
  name: string;
  region: Region;
  city: string;
  description: string;
  image: string;
  category: 'Nature' | 'Culture' | 'Plage' | 'Historique';
}

export interface Activity {
  id: string;
  name: string;
  region: Region;
  description: string;
  image: string;
  price: number;
  duration: string;
  type: 'Sport' | 'Culture' | 'Nature' | 'Gastronomie';
}

export interface Guide {
  id: string;
  name: string;
  region: Region;
  languages: string[];
  specialty: string[];
  image: string;
  experience: string;
  bio: string;
  rating: number;
  reviewCount: number;
}

export interface Accommodation {
  id: string;
  name: string;
  region: Region;
  type: 'Hôtel' | 'Campement' | 'Éco-Lodge';
  priceRange: string;
  images: string[];
  features: string[];
  rating: number;
  description: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  recipe: string[];
  price: string;
  image: string;
  region: Region;
  isVegetarian: boolean;
}

export interface Drink {
  id: string;
  name: string;
  description: string;
  recipe: string[];
  price: string;
  image: string;
  benefits: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  region: Region;
  description: string;
  image: string;
  isMajorEvent: boolean;
  price: string;
  googleMapsUrl: string;
}

export interface RegionDiscovery {
  id: string;
  dbName: Region;
  title: string;
  subtitle: string;
  mainDescription: string;
  mainImages: string[];
  iconName: 'Waves' | 'TreePine' | 'Mountain';
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface Booking {
  id: string; // UUID
  user_id: string;
  name: string;
  email: string;
  booking_date: string;
  type: 'Guide' | 'Hébergement' | 'Activité' | 'Gastronomie' | 'Découverte';
  region: Region;
  message?: string;
  status: 'en_attente' | 'confirme' | 'annule';
  refusal_reason?: string;
  payment_method?: 'wave' | 'orange_money' | 'card';
  created_at: string;
}

export interface Review {
  id: number;
  user_id?: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  rating: number;
  created_at: string;
}

export interface SiteConfigs {
  hero_video?: string;
  video_basse?: string;
  video_moyenne?: string;
  video_haute?: string;
}

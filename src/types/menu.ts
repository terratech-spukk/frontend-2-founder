export interface MenuItem {
  id: string;
  name: string;
  name_en: string;
  category_id: string;
  price: number; // float value
  description: string;
  image: string; // URL string
  spice_level: number;
  is_popular: boolean;
  ingredients: string[];
  allergens: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

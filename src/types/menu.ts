export interface MenuItem {
    id: string;
    name: string;
    name_en: string;
    category_id: string;
    price: number;
    description: string;
    image: string;
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
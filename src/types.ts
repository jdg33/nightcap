import type { Session } from '@supabase/supabase-js';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export interface IngredientBrand {
  id: string;
  ingredient_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Cocktail {
  id: string;
  name: string;
  description: string | null;
  instructions: string;
  is_jesse_original: boolean;
  is_hall_of_fame: boolean;
  created_at: string;
  created_by: string | null;
  author: string | null;
  /** Set by the iOS app when a shared cocktail is un-shared. Hidden everywhere. */
  is_private?: boolean | null;
}

export interface CocktailIngredient {
  id: string;
  cocktail_id: string;
  ingredient_id: string;
  amount: number;
  unit: string;
  ingredient?: Ingredient;
}

export interface CocktailLog {
  id: string;
  cocktail_id: string;
  user_id: string;
  notes: string | null;
  rating: number;
  created_at: string;
}

export interface UserIngredient {
  id: string;
  user_id: string;
  ingredient_id: string;
  ingredient?: Ingredient;
}
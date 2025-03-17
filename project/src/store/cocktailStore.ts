import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Cocktail, Ingredient, CocktailIngredient, UserIngredient } from '../types';

interface CocktailStore {
  cocktails: Cocktail[];
  ingredients: Ingredient[];
  userIngredients: UserIngredient[];
  cocktailIngredients: CocktailIngredient[];
  loading: boolean;
  error: string | null;
  fetchCocktails: () => Promise<void>;
  fetchIngredients: () => Promise<void>;
  fetchUserIngredients: () => Promise<void>;
  toggleUserIngredient: (ingredientId: string) => Promise<void>;
  getAvailableCocktails: () => Cocktail[];
  scaleCocktailRecipe: (cocktailId: string, servings: number) => CocktailIngredient[];
}

export const useCocktailStore = create<CocktailStore>((set, get) => ({
  cocktails: [],
  ingredients: [],
  userIngredients: [],
  cocktailIngredients: [],
  loading: false,
  error: null,

  fetchCocktails: async () => {
    try {
      set({ loading: true, error: null });
      
      const [cocktailsResponse, cocktailIngredientsResponse] = await Promise.all([
        supabase.from('cocktails').select('*'),
        supabase.from('cocktail_ingredients').select('*, ingredient:ingredients(*)')
      ]);

      if (cocktailsResponse.error) throw cocktailsResponse.error;
      if (cocktailIngredientsResponse.error) throw cocktailIngredientsResponse.error;
      
      set({ 
        cocktails: cocktailsResponse.data || [],
        cocktailIngredients: cocktailIngredientsResponse.data || [],
        loading: false
      });
    } catch (error) {
      console.error('Error fetching cocktails:', error);
      set({ 
        error: 'Failed to fetch cocktails',
        loading: false 
      });
    }
  },

  fetchIngredients: async () => {
    try {
      set({ error: null });
      const { data, error } = await supabase.from('ingredients').select('*');
      
      if (error) throw error;
      
      set({ ingredients: data || [] });
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      set({ error: 'Failed to fetch ingredients' });
    }
  },

  fetchUserIngredients: async () => {
    try {
      set({ error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ userIngredients: [] });
        return;
      }

      const { data, error } = await supabase
        .from('user_ingredients')
        .select('*, ingredient:ingredients(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ userIngredients: data || [] });
    } catch (error) {
      console.error('Error fetching user ingredients:', error);
      set({ 
        error: 'Failed to fetch user ingredients',
        userIngredients: []
      });
    }
  },

  toggleUserIngredient: async (ingredientId: string) => {
    try {
      set({ error: null });
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const { userIngredients } = get();
      const exists = userIngredients.find(ui => ui.ingredient_id === ingredientId);

      if (exists) {
        const { error } = await supabase
          .from('user_ingredients')
          .delete()
          .eq('ingredient_id', ingredientId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_ingredients')
          .insert([{ 
            ingredient_id: ingredientId,
            user_id: user.id
          }]);

        if (error) throw error;
      }

      await get().fetchUserIngredients();
    } catch (error) {
      console.error('Error toggling ingredient:', error);
      set({ error: 'Failed to update ingredient' });
    }
  },

  getAvailableCocktails: () => {
    const { cocktails, cocktailIngredients, userIngredients } = get();
    const userIngredientIds = new Set(userIngredients.map(ui => ui.ingredient_id));

    return cocktails.filter(cocktail => {
      const requiredIngredients = cocktailIngredients.filter(
        ci => ci.cocktail_id === cocktail.id
      );
      return requiredIngredients.every(ri => userIngredientIds.has(ri.ingredient_id));
    });
  },

  scaleCocktailRecipe: (cocktailId: string, servings: number) => {
    const { cocktailIngredients } = get();
    const recipe = cocktailIngredients.filter(ci => ci.cocktail_id === cocktailId);
    return recipe.map(item => ({
      ...item,
      amount: item.amount * servings
    }));
  },
}));
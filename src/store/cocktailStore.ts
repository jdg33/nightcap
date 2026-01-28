import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { offlineCache } from '../lib/offlineCache';
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

      const cachedCocktails = await offlineCache.getCocktails();
      const cachedCocktailIngredients = await offlineCache.getCocktailIngredients();
      const isCacheValid = await offlineCache.isCacheValid();

      if (cachedCocktails && cachedCocktailIngredients && isCacheValid) {
        set({
          cocktails: cachedCocktails,
          cocktailIngredients: cachedCocktailIngredients,
          loading: false
        });
        return;
      }

      const [cocktailsResponse, cocktailIngredientsResponse] = await Promise.all([
        supabase.from('cocktails').select('*').order('name'),
        supabase.from('cocktail_ingredients').select('*, ingredient:ingredients(*)').order('cocktail_id')
      ]);

      if (cocktailsResponse.error) {
        console.error('Cocktails error:', cocktailsResponse.error);
        if (cachedCocktails && cachedCocktailIngredients) {
          set({
            cocktails: cachedCocktails,
            cocktailIngredients: cachedCocktailIngredients,
            loading: false
          });
          return;
        }
        throw cocktailsResponse.error;
      }
      if (cocktailIngredientsResponse.error) {
        console.error('Cocktail ingredients error:', cocktailIngredientsResponse.error);
        if (cachedCocktails && cachedCocktailIngredients) {
          set({
            cocktails: cachedCocktails,
            cocktailIngredients: cachedCocktailIngredients,
            loading: false
          });
          return;
        }
        throw cocktailIngredientsResponse.error;
      }

      console.log('Fetched cocktails:', cocktailsResponse.data?.length || 0);
      console.log('Fetched cocktail ingredients:', cocktailIngredientsResponse.data?.length || 0);

      const cocktails = cocktailsResponse.data || [];
      const cocktailIngredients = cocktailIngredientsResponse.data || [];

      await offlineCache.saveCocktails(cocktails);
      await offlineCache.saveCocktailIngredients(cocktailIngredients);

      set({
        cocktails,
        cocktailIngredients,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching cocktails:', error);
      set({
        error: `Failed to fetch cocktails: ${error.message || 'Unknown error'}`,
        loading: false
      });
    }
  },

  fetchIngredients: async () => {
    try {
      set({ error: null });

      const cachedIngredients = await offlineCache.getIngredients();
      const isCacheValid = await offlineCache.isCacheValid();

      if (cachedIngredients && isCacheValid) {
        set({ ingredients: cachedIngredients });
        return;
      }

      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Ingredients error:', error);
        if (cachedIngredients) {
          set({ ingredients: cachedIngredients });
          return;
        }
        throw error;
      }

      console.log('Fetched ingredients:', data?.length || 0);

      const ingredients = data || [];
      await offlineCache.saveIngredients(ingredients);

      set({ ingredients });
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      set({ error: `Failed to fetch ingredients: ${error.message || 'Unknown error'}` });
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

      if (error) {
        console.error('User ingredients error:', error);
        throw error;
      }

      console.log('Fetched user ingredients:', data?.length || 0);
      set({ userIngredients: data || [] });
    } catch (error) {
      console.error('Error fetching user ingredients:', error);
      set({ 
        error: `Failed to fetch user ingredients: ${error.message || 'Unknown error'}`,
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
      set({ error: `Failed to update ingredient: ${error.message || 'Unknown error'}` });
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
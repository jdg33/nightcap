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
  fetchCocktails: (forceRefresh?: boolean) => Promise<void>;
  fetchIngredients: (forceRefresh?: boolean) => Promise<void>;
  fetchUserIngredients: () => Promise<void>;
  toggleUserIngredient: (ingredientId: string) => Promise<void>;
  getAvailableCocktails: () => Cocktail[];
  scaleCocktailRecipe: (cocktailId: string, servings: number) => CocktailIngredient[];
}

const PAGE_SIZE = 1000;

/**
 * Supabase caps every response at a fixed number of rows (1000 by default), so
 * a single select silently drops the rest once a table outgrows it. Fetch big
 * tables page by page instead, until a page comes back empty.
 */
async function fetchAllRows<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<{ data: T[] | null; error: any }> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    if (!data || data.length === 0) break;
    rows.push(...data);
  }
  return { data: rows, error: null };
}

export const useCocktailStore = create<CocktailStore>((set, get) => ({
  cocktails: [],
  ingredients: [],
  userIngredients: [],
  cocktailIngredients: [],
  loading: false,
  error: null,

  fetchCocktails: async (forceRefresh = false) => {
    try {
      set({ loading: true, error: null });

      const cachedCocktails = await offlineCache.getCocktails();
      const cachedCocktailIngredients = await offlineCache.getCocktailIngredients();
      const isCacheValid = await offlineCache.isCacheValid();

      if (cachedCocktails && cachedCocktailIngredients && isCacheValid && !forceRefresh) {
        set({
          cocktails: cachedCocktails,
          cocktailIngredients: cachedCocktailIngredients,
          loading: false
        });
        return;
      }

      const [cocktailsResponse, cocktailIngredientsResponse] = await Promise.all([
        fetchAllRows<Cocktail>((from, to) =>
          supabase.from('cocktails').select('*').order('name').order('id').range(from, to)
        ),
        fetchAllRows<CocktailIngredient>((from, to) =>
          supabase
            .from('cocktail_ingredients')
            .select('*, ingredient:ingredients(*)')
            .order('cocktail_id')
            .order('id')
            .range(from, to)
        )
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

      // Cocktails hidden via is_private (e.g. one a user un-shared from the iOS app)
      // must not show up on the site.
      const cocktails = (cocktailsResponse.data || []).filter(cocktail => !cocktail.is_private);
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

  fetchIngredients: async (forceRefresh = false) => {
    try {
      set({ error: null });

      const cachedIngredients = await offlineCache.getIngredients();
      const isCacheValid = await offlineCache.isCacheValid();

      if (cachedIngredients && isCacheValid && !forceRefresh) {
        set({ ingredients: cachedIngredients });
        return;
      }

      const { data, error } = await fetchAllRows<Ingredient>((from, to) =>
        supabase.from('ingredients').select('*').order('name').order('id').range(from, to)
      );

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
import { storage } from './ios';
import type { Cocktail, Ingredient, CocktailIngredient } from '../types';

const CACHE_KEYS = {
  COCKTAILS: 'cache_cocktails',
  INGREDIENTS: 'cache_ingredients',
  COCKTAIL_INGREDIENTS: 'cache_cocktail_ingredients',
  LAST_SYNC: 'cache_last_sync',
};

const CACHE_DURATION = 1000 * 60 * 60 * 24;

export const offlineCache = {
  async saveCocktails(cocktails: Cocktail[]) {
    try {
      await storage.set(CACHE_KEYS.COCKTAILS, JSON.stringify(cocktails));
      await storage.set(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Error saving cocktails to cache:', error);
    }
  },

  async getCocktails(): Promise<Cocktail[] | null> {
    try {
      const data = await storage.get(CACHE_KEYS.COCKTAILS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cocktails from cache:', error);
      return null;
    }
  },

  async saveIngredients(ingredients: Ingredient[]) {
    try {
      await storage.set(CACHE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
    } catch (error) {
      console.error('Error saving ingredients to cache:', error);
    }
  },

  async getIngredients(): Promise<Ingredient[] | null> {
    try {
      const data = await storage.get(CACHE_KEYS.INGREDIENTS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting ingredients from cache:', error);
      return null;
    }
  },

  async saveCocktailIngredients(cocktailIngredients: CocktailIngredient[]) {
    try {
      await storage.set(CACHE_KEYS.COCKTAIL_INGREDIENTS, JSON.stringify(cocktailIngredients));
    } catch (error) {
      console.error('Error saving cocktail ingredients to cache:', error);
    }
  },

  async getCocktailIngredients(): Promise<CocktailIngredient[] | null> {
    try {
      const data = await storage.get(CACHE_KEYS.COCKTAIL_INGREDIENTS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cocktail ingredients from cache:', error);
      return null;
    }
  },

  async getLastSync(): Promise<number | null> {
    try {
      const data = await storage.get(CACHE_KEYS.LAST_SYNC);
      return data ? parseInt(data) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  },

  async isCacheValid(): Promise<boolean> {
    const lastSync = await this.getLastSync();
    if (!lastSync) return false;
    return Date.now() - lastSync < CACHE_DURATION;
  },

  async clearCache() {
    try {
      await storage.remove(CACHE_KEYS.COCKTAILS);
      await storage.remove(CACHE_KEYS.INGREDIENTS);
      await storage.remove(CACHE_KEYS.COCKTAIL_INGREDIENTS);
      await storage.remove(CACHE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};

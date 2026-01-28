import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Search, ArrowUpDown } from 'lucide-react';
import { useCocktailStore } from '../store/cocktailStore';
import { useAuthStore } from '../store/authStore';

type SortOption = 'name-asc' | 'name-desc';

interface Props {
  userOnly?: boolean;
}

export default function IngredientList({ userOnly = false }: Props) {
  const {
    ingredients,
    userIngredients,
    fetchIngredients,
    fetchUserIngredients,
    toggleUserIngredient
  } = useCocktailStore();

  const { session } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  useEffect(() => {
    fetchIngredients();
    if (session) {
      fetchUserIngredients();
    }
  }, [fetchIngredients, fetchUserIngredients, session]);

  const userIngredientIds = new Set(userIngredients.map(ui => ui.ingredient_id));
  
  // Get unique categories
  const categories = Array.from(new Set(ingredients.map(i => i.category))).sort();

  // Filter and sort ingredients
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(ingredient.category);
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return sortOption === 'name-asc' ? comparison : -comparison;
  });

  const displayIngredients = userOnly
    ? filteredIngredients.filter(i => userIngredientIds.has(i.id))
    : filteredIngredients;

  const handleToggleIngredient = async (ingredientId: string) => {
    if (!session) {
      return;
    }
    await toggleUserIngredient(ingredientId);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {userOnly ? 'My Bar Ingredients' : 'All Ingredients'}
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base w-full sm:w-auto"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategories(prev => {
                const next = new Set(prev);
                if (next.has(category)) {
                  next.delete(category);
                } else {
                  next.add(category);
                }
                return next;
              });
            }}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
              selectedCategories.has(category)
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
            } border`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {displayIngredients.map(ingredient => (
          <div
            key={ingredient.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 flex items-center justify-between gap-3"
          >
            <Link
              to={`/ingredient/${ingredient.id}`}
              className="flex-1 min-w-0"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 break-words">
                {ingredient.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{ingredient.category}</p>
              {ingredient.description && (
                <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{ingredient.description}</p>
              )}
            </Link>
            {session && (
              <button
                onClick={() => handleToggleIngredient(ingredient.id)}
                className={`p-2 rounded-full flex-shrink-0 ${
                  userIngredientIds.has(ingredient.id)
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
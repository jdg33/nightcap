import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Search, ArrowUpDown, Plus } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {userOnly ? 'My Bar Ingredients' : 'All Ingredients'}
        </h1>
        {!userOnly && (
          <Link
            to="/create-ingredient"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Ingredient
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
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
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategories.has(category)
                ? 'bg-purple-100 text-purple-700 border-purple-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            } border`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayIngredients.map(ingredient => (
          <div
            key={ingredient.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <Link 
              to={`/ingredient/${ingredient.id}`}
              className="flex-1"
            >
              <h3 className="text-lg font-medium text-gray-900 hover:text-purple-600">
                {ingredient.name}
              </h3>
              <p className="text-sm text-gray-500">{ingredient.category}</p>
              {ingredient.description && (
                <p className="mt-1 text-gray-600">{ingredient.description}</p>
              )}
            </Link>
            {session && (
              <button
                onClick={() => handleToggleIngredient(ingredient.id)}
                className={`p-2 rounded-full ${
                  userIngredientIds.has(ingredient.id)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
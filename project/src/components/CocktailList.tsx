import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowUpDown, Plus, Star, Trophy, Filter } from 'lucide-react';
import { useCocktailStore } from '../store/cocktailStore';
import { useAuthStore } from '../store/authStore';
import type { Ingredient, Cocktail } from '../types';

type SortOption = 'name-asc' | 'name-desc' | 'date-new' | 'date-old';

export default function CocktailList() {
  const { 
    cocktails, 
    ingredients, 
    cocktailIngredients,
    loading, 
    error, 
    fetchCocktails, 
    fetchIngredients,
  } = useCocktailStore();
  const { session } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showJesseOriginals, setShowJesseOriginals] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);

  useEffect(() => {
    fetchCocktails();
    fetchIngredients();
  }, [fetchCocktails, fetchIngredients]);

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIngredients(new Set());
    setSortOption('name-asc');
    setShowJesseOriginals(false);
    setShowHallOfFame(false);
    setShowFilters(false);
  };

  const sortCocktails = (cocktails: Cocktail[]) => {
    switch (sortOption) {
      case 'name-asc':
        return [...cocktails].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...cocktails].sort((a, b) => b.name.localeCompare(a.name));
      case 'date-new':
        return [...cocktails].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'date-old':
        return [...cocktails].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default:
        return cocktails;
    }
  };

  const filteredCocktails = sortCocktails(
    cocktails.filter(cocktail => {
      // Search filter
      const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cocktail.description?.toLowerCase().includes(searchTerm.toLowerCase()));

      // Ingredient filter
      const cocktailIngredientIds = new Set(
        cocktailIngredients
          .filter(ci => ci.cocktail_id === cocktail.id)
          .map(ci => ci.ingredient_id)
      );

      const matchesIngredients = selectedIngredients.size === 0 ||
        Array.from(selectedIngredients).every(id => cocktailIngredientIds.has(id));

      // Special filters
      const matchesJesseOriginal = !showJesseOriginals || cocktail.is_jesse_original;
      const matchesHallOfFame = !showHallOfFame || cocktail.is_hall_of_fame;

      return matchesSearch && matchesIngredients && matchesJesseOriginal && matchesHallOfFame;
    })
  );

  const ingredientsByCategory = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading cocktails...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || selectedIngredients.size > 0 || 
    sortOption !== 'name-asc' || showJesseOriginals || showHallOfFame;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cocktails</h1>
        <Link
          to="/create-cocktail"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Cocktail
        </Link>
      </div>

      <div className="flex gap-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cocktails..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            hasActiveFilters
              ? 'bg-purple-100 border-purple-300 text-purple-700'
              : 'border-gray-300 text-gray-700'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-purple-200 text-purple-800 rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="h-5 w-5 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sort options */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sort by</h3>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="date-new">Newest First</option>
                <option value="date-old">Oldest First</option>
              </select>
            </div>

            {/* Special filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Special filters</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showJesseOriginals}
                    onChange={(e) => setShowJesseOriginals(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700 flex items-center">
                    Original
                    <Star className={`h-4 w-4 ml-1 ${showJesseOriginals ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showHallOfFame}
                    onChange={(e) => setShowHallOfFame(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700 flex items-center">
                    Hall of Fame
                    <Trophy className={`h-4 w-4 ml-1 ${showHallOfFame ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Filter by ingredients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(ingredientsByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryIngredients]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="space-y-2">
                    {categoryIngredients.sort((a, b) => a.name.localeCompare(b.name)).map(ingredient => (
                      <label
                        key={ingredient.id}
                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIngredients.has(ingredient.id)}
                          onChange={() => toggleIngredient(ingredient.id)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>{ingredient.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-gray-600">
        {filteredCocktails.length} {filteredCocktails.length === 1 ? 'cocktail' : 'cocktails'} found
      </div>

      {/* Cocktail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCocktails.map(cocktail => (
          <Link
            key={cocktail.id}
            to={`/cocktail/${cocktail.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">{cocktail.name}</h2>
                <div className="flex gap-2">
                  {cocktail.is_jesse_original && (
                    <Star className="h-5 w-5 text-yellow-400 fill-current" title="Original" />
                  )}
                  {cocktail.is_hall_of_fame && (
                    <Trophy className="h-5 w-5 text-yellow-500 fill-current" title="Hall of Fame" />
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Added {new Date(cocktail.created_at).toLocaleDateString()}
              </div>
              {cocktail.description && (
                <p className="mt-2 text-gray-600">{cocktail.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {cocktailIngredients
                  .filter(ci => ci.cocktail_id === cocktail.id)
                  .map(ci => {
                    const ingredient = ingredients.find(i => i.id === ci.ingredient_id);
                    return ingredient ? (
                      <span
                        key={ci.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                      >
                        {ingredient.name}
                      </span>
                    ) : null;
                  })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
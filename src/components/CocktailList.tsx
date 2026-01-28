import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowUpDown, Star, Trophy, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCocktailStore } from '../store/cocktailStore';
import { useAuthStore } from '../store/authStore';
import { haptics } from '../lib/ios';
import CocktailModal from './CocktailModal';
import PullToRefresh from './PullToRefresh';
import type { Ingredient, Cocktail } from '../types';

type SortOption = 'name-asc' | 'name-desc' | 'date-new' | 'date-old';

const ITEMS_PER_PAGE = 25;

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
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showJesseOriginals, setShowJesseOriginals] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCocktailId, setSelectedCocktailId] = useState<string | null>(null);

  useEffect(() => {
    console.log('CocktailList: Starting data fetch...');
    fetchCocktails();
    fetchIngredients();
  }, [fetchCocktails, fetchIngredients]);

  const handleRefresh = async () => {
    await haptics.success();
    await Promise.all([fetchCocktails(), fetchIngredients()]);
  };

  useEffect(() => {
    console.log('CocktailList: Data updated', {
      cocktails: cocktails.length,
      ingredients: ingredients.length,
      cocktailIngredients: cocktailIngredients.length,
      loading,
      error
    });
  }, [cocktails, ingredients, cocktailIngredients, loading, error]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedIngredients.size, sortOption, showJesseOriginals, showHallOfFame]);

  useEffect(() => {
    // Close sort menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSortMenu && !target.closest('.sort-menu-container')) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortMenu]);

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
    setShowJesseOriginals(false);
    setShowHallOfFame(false);
    setShowFilters(false);
    setCurrentPage(1);
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

  const totalPages = Math.ceil(filteredCocktails.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCocktails = filteredCocktails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        <div className="text-gray-600 dark:text-gray-400">Loading cocktails...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px] space-y-4">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="font-semibold">Error loading cocktails</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => {
            fetchCocktails();
            fetchIngredients();
          }}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || selectedIngredients.size > 0 ||
    showJesseOriginals || showHallOfFame;

  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400">
        {filteredCocktails.length} {filteredCocktails.length === 1 ? 'cocktail' : 'cocktails'} found
      </div>
      {totalPages > 1 && (
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              await haptics.light();
              setCurrentPage(p => Math.max(1, p - 1));
            }}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={async () => {
              await haptics.light();
              setCurrentPage(p => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cocktails..."
            className="input-field pl-11"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>

        <div className="flex gap-2">
          {/* Sort button with dropdown */}
          <div className="relative sort-menu-container">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <ArrowUpDown className="h-5 w-5" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            {/* Sort dropdown menu */}
            {showSortMenu && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 min-w-[180px] overflow-hidden">
                <button
                  onClick={() => { setSortOption('name-asc'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortOption === 'name-asc' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => { setSortOption('name-desc'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortOption === 'name-desc' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Name (Z-A)
                </button>
                <button
                  onClick={() => { setSortOption('date-new'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortOption === 'date-new' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => { setSortOption('date-old'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortOption === 'date-old' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border font-medium whitespace-nowrap transition-all ${
              hasActiveFilters
                ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 shadow-md'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-amber-600 dark:bg-amber-700 text-white rounded-full font-semibold">
                Active
              </span>
            )}
          </button>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-3 sm:px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <X className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 md:p-8 space-y-6">
          {/* Special filters */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wide">Special filters</h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showJesseOriginals}
                  onChange={(e) => setShowJesseOriginals(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 focus:ring-offset-0 border-slate-300 dark:border-slate-600"
                />
                <span className="ml-3 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 flex items-center font-medium transition-colors">
                  Original
                  <Star className={`h-4 w-4 ml-2 transition-colors ${showJesseOriginals ? 'text-amber-500 fill-current' : 'text-slate-400 dark:text-slate-500'}`} />
                </span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showHallOfFame}
                  onChange={(e) => setShowHallOfFame(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 focus:ring-offset-0 border-slate-300 dark:border-slate-600"
                />
                <span className="ml-3 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 flex items-center font-medium transition-colors">
                  Hall of Fame
                  <Trophy className={`h-4 w-4 ml-2 transition-colors ${showHallOfFame ? 'text-amber-500 fill-current' : 'text-slate-400 dark:text-slate-500'}`} />
                </span>
              </label>
            </div>
          </div>

          {/* Ingredients filter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wide">Filter by ingredients</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(ingredientsByCategory).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryIngredients]) => (
                <div key={category}>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">{category}</h4>
                  <div className="space-y-2.5">
                    {categoryIngredients.sort((a, b) => a.name.localeCompare(b.name)).map(ingredient => (
                      <label
                        key={ingredient.id}
                        className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer group transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIngredients.has(ingredient.id)}
                          onChange={() => toggleIngredient(ingredient.id)}
                          className="rounded text-amber-600 focus:ring-amber-500 focus:ring-offset-0 border-slate-300 dark:border-slate-600"
                        />
                        <span className="text-sm">{ingredient.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top pagination */}
      <PaginationControls />

      {/* Cocktail grid */}
      {cocktails.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 md:p-12 text-center">
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">No cocktails found. Try adding some cocktails to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {paginatedCocktails.map(cocktail => (
            <button
              key={cocktail.id}
              onClick={async () => {
                await haptics.light();
                setSelectedCocktailId(cocktail.id);
              }}
              className="cocktail-card text-left w-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all duration-300" />
              <div className="relative p-5 md:p-6">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white break-words leading-tight">{cocktail.name}</h2>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {cocktail.is_jesse_original && (
                      <Star className="h-5 w-5 text-amber-500 fill-current drop-shadow-sm" title="Original" />
                    )}
                    {cocktail.is_hall_of_fame && (
                      <Trophy className="h-5 w-5 text-amber-600 fill-current drop-shadow-sm" title="Hall of Fame" />
                    )}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">
                  Added {new Date(cocktail.created_at).toLocaleDateString()}
                </div>
                {cocktail.description && (
                  <p className="mt-3 mb-4 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{cocktail.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {cocktailIngredients
                    .filter(ci => ci.cocktail_id === cocktail.id)
                    .slice(0, 5)
                    .map(ci => {
                      const ingredient = ingredients.find(i => i.id === ci.ingredient_id);
                      return ingredient ? (
                        <span
                          key={ci.id}
                          className="ingredient-badge"
                        >
                          {ingredient.name}
                        </span>
                      ) : null;
                    })}
                  {cocktailIngredients.filter(ci => ci.cocktail_id === cocktail.id).length > 5 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                      +{cocktailIngredients.filter(ci => ci.cocktail_id === cocktail.id).length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom pagination */}
      <PaginationControls />

      </div>
    </PullToRefresh>

    {/* Cocktail Modal - Outside PullToRefresh for proper z-index */}
    {selectedCocktailId && (
      <CocktailModal
        cocktailId={selectedCocktailId}
        onClose={() => setSelectedCocktailId(null)}
      />
    )}
    </>
  );
}
import React, { useEffect, useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { useCocktailStore } from '../store/cocktailStore';
import CocktailModal from './CocktailModal';
import type { Cocktail } from '../types';

type SortOption = 'name-asc' | 'name-desc' | 'date-new' | 'date-old';

export default function AvailableCocktails() {
  const { fetchCocktails, fetchUserIngredients, getAvailableCocktails } = useCocktailStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [selectedCocktailId, setSelectedCocktailId] = useState<string | null>(null);

  useEffect(() => {
    fetchCocktails();
    fetchUserIngredients();
  }, [fetchCocktails, fetchUserIngredients]);

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

  const availableCocktails = sortCocktails(getAvailableCocktails());

  const filteredCocktails = availableCocktails.filter(cocktail =>
    cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cocktail.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cocktails You Can Make</h1>
      
      <div className="flex gap-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cocktails..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-new">Newest First</option>
            <option value="date-old">Oldest First</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
      </div>

      {filteredCocktails.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? "No matching cocktails found"
              : "You don't have enough ingredients to make any cocktails yet. Visit the \"My Bar\" section to add ingredients!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCocktails.map(cocktail => (
            <button
              key={cocktail.id}
              onClick={() => setSelectedCocktailId(cocktail.id)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left w-full"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{cocktail.name}</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Added {new Date(cocktail.created_at).toLocaleDateString()}
                </div>
                {cocktail.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{cocktail.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Cocktail Modal */}
      {selectedCocktailId && (
        <CocktailModal
          cocktailId={selectedCocktailId}
          onClose={() => setSelectedCocktailId(null)}
        />
      )}
    </div>
  );
}
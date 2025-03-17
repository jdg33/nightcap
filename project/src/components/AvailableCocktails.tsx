import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpDown } from 'lucide-react';
import { useCocktailStore } from '../store/cocktailStore';
import type { Cocktail } from '../types';

type SortOption = 'name-asc' | 'name-desc' | 'date-new' | 'date-old';

export default function AvailableCocktails() {
  const { fetchCocktails, fetchUserIngredients, getAvailableCocktails } = useCocktailStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

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
      <h1 className="text-2xl font-bold text-gray-900">Cocktails You Can Make</h1>
      
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

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="appearance-none pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-new">Newest First</option>
            <option value="date-old">Oldest First</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {filteredCocktails.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">
            {searchTerm
              ? "No matching cocktails found"
              : "You don't have enough ingredients to make any cocktails yet. Visit the \"My Bar\" section to add ingredients!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCocktails.map(cocktail => (
            <Link
              key={cocktail.id}
              to={`/cocktail/${cocktail.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">{cocktail.name}</h2>
                <div className="text-sm text-gray-500 mt-1">
                  Added {new Date(cocktail.created_at).toLocaleDateString()}
                </div>
                {cocktail.description && (
                  <p className="mt-2 text-gray-600">{cocktail.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
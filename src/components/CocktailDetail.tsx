import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Edit, Trophy, Plus, Trash2, ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCocktailStore } from '../store/cocktailStore';
import { share, haptics } from '../lib/ios';
import type { CocktailLog } from '../types';

export default function CocktailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { 
    cocktails, 
    cocktailIngredients,
    fetchCocktails,
  } = useCocktailStore();
  const [servings, setServings] = useState(1);
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newLog, setNewLog] = useState({
    rating: 5,
    notes: ''
  });

  const cocktail = cocktails.find(c => c.id === id);
  const recipe = cocktailIngredients
    .filter(ci => ci.cocktail_id === id)
    .map(ci => ({
      ...ci,
      amount: ci.amount * servings
    }));

  const sortedCocktails = [...cocktails].sort((a, b) => a.name.localeCompare(b.name));
  const currentIndex = sortedCocktails.findIndex(c => c.id === id);
  const prevCocktail = currentIndex > 0 ? sortedCocktails[currentIndex - 1] : null;
  const nextCocktail = currentIndex < sortedCocktails.length - 1 ? sortedCocktails[currentIndex + 1] : null;

  useEffect(() => {
    fetchCocktails();
    if (session) {
      fetchLogs();
    }
  }, [id, fetchCocktails, session]);

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('cocktail_logs')
        .select('*')
        .eq('cocktail_id', id)
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }
      
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }

  async function handleAddLog() {
    try {
      const { error } = await supabase
        .from('cocktail_logs')
        .insert([{
          cocktail_id: id,
          user_id: session?.user.id,
          rating: newLog.rating,
          notes: newLog.notes || null
        }]);

      if (error) throw error;

      setIsAddingLog(false);
      setNewLog({ rating: 5, notes: '' });
      await fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
      alert('Failed to add log. Please try again.');
    }
  }

  async function handleDeleteLog(logId: string) {
    try {
      const { error } = await supabase
        .from('cocktail_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      await fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log. Please try again.');
    }
  }

  async function handleDeleteCocktail() {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('cocktails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/');
    } catch (error) {
      console.error('Error deleting cocktail:', error);
      alert('Failed to delete cocktail. Please try again.');
    }
  }

  async function handleShare() {
    await haptics.light();

    const ingredients = recipe
      .map(item => {
        const ingredientName = item.ingredient?.name || 'Unknown ingredient';
        return `${item.amount} ${item.unit || ''} ${ingredientName}`.trim();
      })
      .join('\n');

    const instructions = cocktail.instructions ? `\n\nInstructions:\n${cocktail.instructions}` : '';
    const description = cocktail.description ? `\n${cocktail.description}` : '';

    const text = `${cocktail.name}${description}\n\nIngredients:\n${ingredients}${instructions}`;

    const success = await share.content(
      `${cocktail.name} - Nightcap`,
      text,
      window.location.href
    );

    if (success) {
      await haptics.success();
    }
  }

  if (!cocktail) {
    return <div className="text-gray-600 dark:text-gray-400">Cocktail not found</div>;
  }

  const NavigationControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
        Back to List
      </button>
      <div className="flex gap-2 sm:gap-4 flex-wrap text-sm sm:text-base">
        {prevCocktail && (
          <Link
            to={`/cocktail/${prevCocktail.id}`}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 truncate max-w-[150px] sm:max-w-none"
          >
            ← {prevCocktail.name}
          </Link>
        )}
        {nextCocktail && (
          <Link
            to={`/cocktail/${nextCocktail.id}`}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 truncate max-w-[150px] sm:max-w-none"
          >
            {nextCocktail.name} →
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <NavigationControls />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
            <div className="flex-1">
              <div className="flex items-start gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{cocktail.name}</h1>
                <div className="flex gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-shrink-0">
                  {cocktail.is_jesse_original && (
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-current" title="Original" />
                  )}
                  {cocktail.is_hall_of_fame && (
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 fill-current" title="Hall of Fame" />
                  )}
                </div>
              </div>
              {cocktail.author && (
                <div className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Created by {cocktail.author}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleShare}
                className="flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-sm sm:text-base"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <Link
                to={`/cocktail/${id}/edit`}
                className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm sm:text-base"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {cocktail.description && (
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">{cocktail.description}</p>
          )}

          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            Added {new Date(cocktail.created_at).toLocaleDateString()}
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Delete Cocktail
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                  Are you sure you want to delete {cocktail.name}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCocktail}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 sm:mt-6">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
              <label className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Servings:</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-16 sm:w-20 px-2 py-1 text-sm sm:text-base border rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.map(item => (
                <li key={item.id} className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  {item.amount} {item.unit}{' '}
                  {item.ingredient && (
                    <Link
                      to={`/ingredient/${item.ingredient.id}`}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                    >
                      {item.ingredient.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">Instructions</h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">{cocktail.instructions}</p>
          </div>

          <div className="mt-6 sm:mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Drink Log</h2>
              {session && !isAddingLog && (
                <button
                  onClick={() => setIsAddingLog(true)}
                  className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  Add Entry
                </button>
              )}
            </div>

            {session ? (
              <div className="space-y-4">
                {isAddingLog && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => setNewLog(prev => ({ ...prev, rating }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 ${
                                rating <= newLog.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                      <textarea
                        value={newLog.notes}
                        onChange={e => setNewLog(prev => ({ ...prev, notes: e.target.value }))}
                        className="block w-full border rounded-md shadow-sm p-2 text-sm sm:text-base dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                        rows={3}
                        placeholder="How was it? Any modifications?"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button
                        onClick={handleAddLog}
                        className="bg-purple-600 text-white px-4 py-2 text-sm sm:text-base rounded-md hover:bg-purple-700 w-full sm:w-auto"
                      >
                        Add Log Entry
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingLog(false);
                          setNewLog({ rating: 5, notes: '' });
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm sm:text-base w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {logs.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {logs.map(log => (
                      <div key={log.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              {[...Array(log.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            {log.notes && (
                              <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">{log.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    No logs yet. Add an entry when you make this cocktail!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Sign in to log when you make this cocktail!
              </p>
            )}
          </div>
        </div>
      </div>

      <NavigationControls />
    </div>
  );
}
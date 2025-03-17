import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Edit, Trophy, Plus, Trash2 } from 'lucide-react';
import { useCocktailStore } from '../store/cocktailStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import type { CocktailLog } from '../types';

export default function CocktailDetail() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuthStore();
  const { 
    cocktails, 
    cocktailIngredients,
    fetchCocktails,
  } = useCocktailStore();
  const [servings, setServings] = useState(1);
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [isAddingLog, setIsAddingLog] = useState(false);
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

  if (!cocktail) {
    return <div>Cocktail not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{cocktail.name}</h1>
              <div className="flex gap-2 mt-1">
                {cocktail.is_jesse_original && (
                  <Star className="h-6 w-6 text-yellow-400 fill-current" title="Original" />
                )}
                {cocktail.is_hall_of_fame && (
                  <Trophy className="h-6 w-6 text-yellow-500 fill-current" title="Hall of Fame" />
                )}
              </div>
            </div>
            <Link
              to={`/cocktail/${id}/edit`}
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              <Edit className="w-5 h-5 mr-1" />
              Edit
            </Link>
          </div>
          
          {cocktail.description && (
            <p className="mt-2 text-gray-600">{cocktail.description}</p>
          )}

          <div className="text-sm text-gray-500 mt-2">
            Added {new Date(cocktail.created_at).toLocaleDateString()}
          </div>

          <div className="mt-6">
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-gray-700">Servings:</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>

            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.map(item => (
                <li key={item.id} className="text-gray-700">
                  {item.amount} {item.unit}{' '}
                  {item.ingredient && (
                    <Link
                      to={`/ingredient/${item.ingredient.id}`}
                      className="text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      {item.ingredient.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2">Instructions</h2>
            <p className="text-gray-700 whitespace-pre-line">{cocktail.instructions}</p>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Drink Log</h2>
              {session && !isAddingLog && (
                <button
                  onClick={() => setIsAddingLog(true)}
                  className="flex items-center text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add Entry
                </button>
              )}
            </div>

            {session ? (
              <div className="mt-4 space-y-4">
                {isAddingLog && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rating</label>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => setNewLog(prev => ({ ...prev, rating }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                rating <= newLog.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        value={newLog.notes}
                        onChange={e => setNewLog(prev => ({ ...prev, notes: e.target.value }))}
                        className="mt-1 block w-full border rounded-md shadow-sm p-2"
                        rows={3}
                        placeholder="How was it? Any modifications?"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleAddLog}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                      >
                        Add Log Entry
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingLog(false);
                          setNewLog({ rating: 5, notes: '' });
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {logs.length > 0 ? (
                  <div className="space-y-4">
                    {logs.map(log => (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-1">
                              {[...Array(log.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            {log.notes && (
                              <p className="mt-2 text-gray-700">{log.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 mt-4">
                    No logs yet. Add an entry when you make this cocktail!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 mt-4">
                Sign in to log when you make this cocktail!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
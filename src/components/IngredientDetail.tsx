import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GlassWater, Edit, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCocktailStore } from '../store/cocktailStore';
import type { Ingredient, Cocktail, CocktailIngredient, IngredientBrand } from '../types';

export default function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { ingredients } = useCocktailStore();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [brands, setBrands] = useState<IngredientBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: ''
  });

  const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));
  const currentIndex = sortedIngredients.findIndex(i => i.id === id);
  const prevIngredient = currentIndex > 0 ? sortedIngredients[currentIndex - 1] : null;
  const nextIngredient = currentIndex < sortedIngredients.length - 1 ? sortedIngredients[currentIndex + 1] : null;

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      setLoading(true);
      try {
        const { data: ingredientData } = await supabase
          .from('ingredients')
          .select('*')
          .eq('id', id)
          .single();

        const { data: cocktailIngredients } = await supabase
          .from('cocktail_ingredients')
          .select(`
            amount,
            unit,
            cocktail:cocktails (
              id,
              name,
              description
            )
          `)
          .eq('ingredient_id', id);

        const { data: brandsData } = await supabase
          .from('ingredient_brands')
          .select('*')
          .eq('ingredient_id', id)
          .order('name');

        setIngredient(ingredientData);
        setCocktails(
          cocktailIngredients
            ?.map(ci => ({
              ...ci.cocktail,
              amount: ci.amount,
              unit: ci.unit
            }))
            .filter(Boolean) || []
        );
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Error fetching ingredient details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleAddBrand = async () => {
    if (!id || !newBrand.name.trim()) return;

    try {
      const { error } = await supabase
        .from('ingredient_brands')
        .insert({
          ingredient_id: id,
          name: newBrand.name.trim(),
          description: newBrand.description.trim() || null
        });

      if (error) throw error;

      const { data } = await supabase
        .from('ingredient_brands')
        .select('*')
        .eq('ingredient_id', id)
        .order('name');

      setBrands(data || []);
      setIsAddingBrand(false);
      setNewBrand({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding brand:', error);
      alert('Failed to add brand');
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      const { error } = await supabase
        .from('ingredient_brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;

      setBrands(prev => prev.filter(b => b.id !== brandId));
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
    }
  };

  const handleDeleteIngredient = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/ingredients');
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Ingredient not found
      </div>
    );
  }

  const NavigationControls = () => (
    <div className="flex justify-between items-center py-4">
      <button
        onClick={() => navigate('/ingredients')}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to List
      </button>
      <div className="flex gap-4">
        {prevIngredient && (
          <Link
            to={`/ingredient/${prevIngredient.id}`}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            ← {prevIngredient.name}
          </Link>
        )}
        {nextIngredient && (
          <Link
            to={`/ingredient/${nextIngredient.id}`}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            {nextIngredient.name} →
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <NavigationControls />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{ingredient.name}</h1>
            <div className="mt-2 text-purple-600 dark:text-purple-400 font-medium">{ingredient.category}</div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to={`/ingredient/${id}/edit`}
              className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Edit className="w-5 h-5 mr-1" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="w-5 h-5 mr-1" />
              Delete
            </button>
          </div>
        </div>
        {ingredient.description && (
          <p className="mt-4 text-gray-600 dark:text-gray-300">{ingredient.description}</p>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Ingredient
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete {ingredient.name}? This will also remove it from all cocktails that use it.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteIngredient}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {(brands.length > 0 || isAddingBrand) && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suggested Brands</h2>
              {session && !isAddingBrand && (
                <button
                  onClick={() => setIsAddingBrand(true)}
                  className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add Brand
                </button>
              )}
            </div>

            {isAddingBrand && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand Name</label>
                    <input
                      type="text"
                      value={newBrand.name}
                      onChange={e => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                    <textarea
                      value={newBrand.description}
                      onChange={e => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-600 dark:text-white"
                      rows={2}
                      placeholder="Add any notes about this brand"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddBrand}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                      Add Brand
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingBrand(false);
                        setNewBrand({ name: '', description: '' });
                      }}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {brands.length > 0 && (
              <div className="space-y-4">
                {brands.map(brand => (
                  <div key={brand.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{brand.name}</h3>
                        {brand.description && (
                          <p className="mt-1 text-gray-600 dark:text-gray-300">{brand.description}</p>
                        )}
                      </div>
                      {session && (
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Cocktails Using {ingredient.name}
        </h2>
        
        {cocktails.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-600 dark:text-gray-400">
            No cocktails use this ingredient yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cocktails.map(cocktail => (
              <Link
                key={cocktail.id}
                to={`/cocktail/${cocktail.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {cocktail.name}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 mt-1">
                    Uses {cocktail.amount} {cocktail.unit}
                  </p>
                  {cocktail.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {cocktail.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NavigationControls />
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCocktailStore } from '../store/cocktailStore';
import type { Ingredient, Cocktail } from '../types';

interface IngredientAmount {
  id?: string;
  ingredient_id: string;
  amount: number;
  unit: string;
}

const UNITS = [
  { value: '', label: 'Select unit' },
  { value: 'oz', label: 'oz' },
  { value: 'ml', label: 'ml' },
  { value: 'dash', label: 'dash' },
  { value: 'piece', label: 'piece' },
  { value: 'leaves', label: 'leaves' },
  { value: 'tbsp', label: 'tbsp(s)' },
  { value: 'tsp', label: 'tsp(s)' },
  { value: 'cup', label: 'cup(s)' }
];

export default function EditCocktail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ingredients, fetchIngredients } = useCocktailStore();
  const [formData, setFormData] = useState<Partial<Cocktail>>({
    name: '',
    description: '',
    instructions: '',
    is_jesse_original: false,
    is_hall_of_fame: false,
    author: ''
  });
  const [ingredientAmounts, setIngredientAmounts] = useState<IngredientAmount[]>([]);

  useEffect(() => {
    fetchIngredients();
    if (id) {
      fetchCocktailData();
    }
  }, [id, fetchIngredients]);

  const fetchCocktailData = async () => {
    const { data: cocktail } = await supabase
      .from('cocktails')
      .select('*')
      .eq('id', id)
      .single();

    const { data: cocktailIngredients } = await supabase
      .from('cocktail_ingredients')
      .select('*')
      .eq('cocktail_id', id);

    if (cocktail) {
      setFormData(cocktail);
    }
    if (cocktailIngredients) {
      setIngredientAmounts(cocktailIngredients);
    }
  };

  const addIngredient = () => {
    setIngredientAmounts(prev => [
      ...prev,
      { ingredient_id: '', amount: 0, unit: '' }
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredientAmounts(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredientAmount = (index: number, field: keyof IngredientAmount, value: string | number) => {
    setIngredientAmounts(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (id) {
        // Update existing cocktail
        await supabase
          .from('cocktails')
          .update({
            ...formData,
            author: formData.author?.trim() || null // Convert empty string to null
          })
          .eq('id', id);

        // Delete existing ingredients and add new ones
        await supabase
          .from('cocktail_ingredients')
          .delete()
          .eq('cocktail_id', id);

        await supabase
          .from('cocktail_ingredients')
          .insert(
            ingredientAmounts.map(ia => ({
              cocktail_id: id,
              ...ia
            }))
          );
      }

      navigate(`/cocktail/${id}`);
    } catch (error) {
      console.error('Error updating cocktail:', error);
      alert('Error updating cocktail');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Edit Cocktail</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author
          </label>
          <input
            type="text"
            id="author"
            value={formData.author || ''}
            onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isJesseOriginal"
              checked={formData.is_jesse_original}
              onChange={e => setFormData(prev => ({ ...prev, is_jesse_original: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label htmlFor="isJesseOriginal" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Jesse Original
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isHallOfFame"
              checked={formData.is_hall_of_fame}
              onChange={e => setFormData(prev => ({ ...prev, is_hall_of_fame: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label htmlFor="isHallOfFame" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Hall of Fame
            </label>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ingredients
            </label>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {ingredientAmounts.map((ia, index) => (
              <div key={index} className="space-y-2 sm:space-y-0 sm:flex sm:items-start sm:space-x-2">
                <div className="flex-1">
                  <select
                    required
                    value={ia.ingredient_id}
                    onChange={e => updateIngredientAmount(index, 'ingredient_id', e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  >
                    <option value="">Select ingredient</option>
                    {ingredients.map(ingredient => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 sm:contents">
                  <div className="flex-1 sm:w-20">
                    <input
                      type="number"
                      required
                      step="0.25"
                      value={ia.amount || ''}
                      onChange={e => updateIngredientAmount(index, 'amount', parseFloat(e.target.value))}
                      placeholder="Amount"
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex-1 sm:w-28">
                    <select
                      required
                      value={ia.unit}
                      onChange={e => updateIngredientAmount(index, 'unit', e.target.value)}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    >
                      {UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructions
          </label>
          <textarea
            id="instructions"
            required
            value={formData.instructions}
            onChange={e => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            rows={4}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
            placeholder="Enter step-by-step instructions for making the cocktail..."
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 text-sm sm:text-base rounded-md hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
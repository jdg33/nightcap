import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCocktailStore } from '../store/cocktailStore';
import type { Ingredient } from '../types';

interface IngredientAmount {
  ingredient_id: string;
  amount: number;
  unit: string;
}

export default function CreateCocktail() {
  const navigate = useNavigate();
  const { ingredients, fetchIngredients } = useCocktailStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    is_jesse_original: false,
    is_hall_of_fame: false
  });
  const [ingredientAmounts, setIngredientAmounts] = useState<IngredientAmount[]>([]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Sort ingredients alphabetically
  const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));

  const addIngredient = () => {
    setIngredientAmounts(prev => [
      ...prev,
      { ingredient_id: '', amount: 0, unit: 'oz' }
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
    
    // Insert cocktail
    const { data: cocktail, error: cocktailError } = await supabase
      .from('cocktails')
      .insert([formData])
      .select()
      .single();

    if (cocktailError) {
      alert('Error creating cocktail: ' + cocktailError.message);
      return;
    }

    // Insert ingredients
    const { error: ingredientsError } = await supabase
      .from('cocktail_ingredients')
      .insert(
        ingredientAmounts.map(ia => ({
          cocktail_id: cocktail.id,
          ...ia
        }))
      );

    if (ingredientsError) {
      alert('Error adding ingredients: ' + ingredientsError.message);
      return;
    }

    navigate(`/cocktail/${cocktail.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Cocktail</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isJesseOriginal"
              checked={formData.is_jesse_original}
              onChange={e => setFormData(prev => ({ ...prev, is_jesse_original: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isJesseOriginal" className="ml-2 block text-sm text-gray-700">
              Jesse Original
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isHallOfFame"
              checked={formData.is_hall_of_fame}
              onChange={e => setFormData(prev => ({ ...prev, is_hall_of_fame: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isHallOfFame" className="ml-2 block text-sm text-gray-700">
              Hall of Fame
            </label>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center text-sm text-purple-600 hover:text-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Ingredient
            </button>
          </div>
          
          <div className="space-y-4">
            {ingredientAmounts.map((ia, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-1">
                  <select
                    required
                    value={ia.ingredient_id}
                    onChange={e => updateIngredientAmount(index, 'ingredient_id', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="">Select ingredient</option>
                    {sortedIngredients.map(ingredient => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    required
                    step="0.25"
                    value={ia.amount || ''}
                    onChange={e => updateIngredientAmount(index, 'amount', parseFloat(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="w-24">
                  <select
                    required
                    value={ia.unit}
                    onChange={e => updateIngredientAmount(index, 'unit', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="oz">oz</option>
                    <option value="ml">ml</option>
                    <option value="dash">dash</option>
                    <option value="piece">piece</option>
                    <option value="leaves">leaves</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
            Instructions
          </label>
          <textarea
            id="instructions"
            required
            value={formData.instructions}
            onChange={e => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            placeholder="Enter step-by-step instructions for making the cocktail..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Create Cocktail
          </button>
        </div>
      </form>
    </div>
  );
}
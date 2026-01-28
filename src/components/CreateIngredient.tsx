import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { IngredientBrand } from '../types';

const SPIRIT_SUBTYPES = {
  Whiskey: [
    'Rye',
    'Bourbon',
    'Scotch (Blended)',
    'Scotch (Single Malt)',
    'Irish'
  ],
  Tequila: [
    'Blanco',
    'Reposado',
    'Añejo'
  ]
};

export default function CreateIngredient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    subtype: ''
  });
  const [brands, setBrands] = useState<IngredientBrand[]>([]);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If a subtype is selected, include it in the name
      const finalName = formData.subtype 
        ? `${formData.subtype} ${formData.name}`
        : formData.name;

      // Insert ingredient
      const { data: ingredient, error: ingredientError } = await supabase
        .from('ingredients')
        .insert({
          name: finalName,
          category: formData.category,
          description: formData.description
        })
        .select()
        .single();

      if (ingredientError) throw ingredientError;

      // Insert brands if any exist
      if (brands.length > 0 && ingredient) {
        const { error: brandsError } = await supabase
          .from('ingredient_brands')
          .insert(
            brands.map(brand => ({
              ingredient_id: ingredient.id,
              name: brand.name,
              description: brand.description
            }))
          );

        if (brandsError) throw brandsError;
      }

      navigate('/ingredients');
    } catch (error) {
      console.error('Error creating ingredient:', error);
      alert('Error creating ingredient. Please try again.');
    }
  };

  const handleAddBrand = () => {
    if (!newBrand.name.trim()) return;

    setBrands(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newBrand.name.trim(),
      description: newBrand.description.trim() || null,
      ingredient_id: '', // Will be set after ingredient creation
      created_at: new Date().toISOString()
    }]);
    setNewBrand({ name: '', description: '' });
    setIsAddingBrand(false);
  };

  const handleRemoveBrand = (brandId: string) => {
    setBrands(prev => prev.filter(b => b.id !== brandId));
  };

  // Determine if the current spirit type has subtypes
  const showSubtypes = formData.name.toLowerCase() === 'whiskey' || 
                      formData.name.toLowerCase() === 'tequila';
  
  const currentSubtypes = formData.name.toLowerCase() === 'whiskey' 
    ? SPIRIT_SUBTYPES.Whiskey 
    : formData.name.toLowerCase() === 'tequila'
      ? SPIRIT_SUBTYPES.Tequila
      : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Ingredient</h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {showSubtypes && (
          <div>
            <label htmlFor="subtype" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              id="subtype"
              required
              value={formData.subtype}
              onChange={e => setFormData(prev => ({ ...prev, subtype: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a type</option>
              {currentSubtypes.map(subtype => (
                <option key={subtype} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a category</option>
            <option value="Spirit">Spirit</option>
            <option value="Liqueur">Liqueur</option>
            <option value="Mixer">Mixer</option>
            <option value="Juice">Juice</option>
            <option value="Garnish">Garnish</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Suggested Brands Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suggested Brands</h2>
            {!isAddingBrand && (
              <button
                type="button"
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
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                  <textarea
                    value={newBrand.description}
                    onChange={e => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    rows={2}
                    placeholder="Add any notes about this brand"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Add Brand
                  </button>
                  <button
                    type="button"
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
                    <button
                      type="button"
                      onClick={() => handleRemoveBrand(brand.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Create Ingredient
          </button>
        </div>
      </form>
    </div>
  );
}
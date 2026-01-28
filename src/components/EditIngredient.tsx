import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Ingredient, IngredientBrand } from '../types';

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

export default function EditIngredient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    category: '',
    description: ''
  });
  const [baseSpirit, setBaseSpirit] = useState('');
  const [subtype, setSubtype] = useState('');
  const [brands, setBrands] = useState<IngredientBrand[]>([]);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (id) {
      fetchIngredientData();
    }
  }, [id]);

  const fetchIngredientData = async () => {
    try {
      // Fetch ingredient details
      const { data: ingredientData } = await supabase
        .from('ingredients')
        .select('*')
        .eq('id', id)
        .single();

      if (ingredientData) {
        // Check if the name includes a subtype
        const name = ingredientData.name;
        let baseName = name;
        let detectedSubtype = '';

        // Check for whiskey subtypes
        for (const subtype of SPIRIT_SUBTYPES.Whiskey) {
          if (name.startsWith(subtype)) {
            baseName = 'Whiskey';
            detectedSubtype = subtype;
            break;
          }
        }

        // Check for tequila subtypes
        for (const subtype of SPIRIT_SUBTYPES.Tequila) {
          if (name.startsWith(subtype)) {
            baseName = 'Tequila';
            detectedSubtype = subtype;
            break;
          }
        }

        setFormData({
          ...ingredientData,
          name: baseName
        });
        setBaseSpirit(baseName);
        setSubtype(detectedSubtype);
      }

      // Fetch brands
      const { data: brandsData } = await supabase
        .from('ingredient_brands')
        .select('*')
        .eq('ingredient_id', id)
        .order('name');

      setBrands(brandsData || []);
    } catch (error) {
      console.error('Error fetching ingredient data:', error);
      alert('Error loading ingredient data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If a subtype is selected, include it in the name
      const finalName = subtype 
        ? `${subtype} ${formData.name}`
        : formData.name;

      await supabase
        .from('ingredients')
        .update({
          ...formData,
          name: finalName
        })
        .eq('id', id);

      navigate(`/ingredient/${id}`);
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Error updating ingredient');
    }
  };

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

      // Refresh brands
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

  const handleUpdateBrand = async (brandId: string) => {
    try {
      const brand = brands.find(b => b.id === brandId);
      if (!brand) return;

      const { error } = await supabase
        .from('ingredient_brands')
        .update({
          name: brand.name.trim(),
          description: brand.description?.trim() || null
        })
        .eq('id', brandId);

      if (error) throw error;

      setEditingBrand(null);
      await fetchIngredientData();
    } catch (error) {
      console.error('Error updating brand:', error);
      alert('Failed to update brand');
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

  // Determine if the current spirit type has subtypes
  const showSubtypes = formData.name?.toLowerCase() === 'whiskey' || 
                      formData.name?.toLowerCase() === 'tequila';
  
  const currentSubtypes = formData.name?.toLowerCase() === 'whiskey' 
    ? SPIRIT_SUBTYPES.Whiskey 
    : formData.name?.toLowerCase() === 'tequila'
      ? SPIRIT_SUBTYPES.Tequila
      : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Ingredient</h1>
      
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
            onChange={e => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              setSubtype(''); // Reset subtype when name changes
            }}
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
              value={subtype}
              onChange={e => setSubtype(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a type</option>
              {currentSubtypes.map(type => (
                <option key={type} value={type}>
                  {type}
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
            value={formData.description || ''}
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
                  {editingBrand === brand.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand Name</label>
                        <input
                          type="text"
                          value={brand.name}
                          onChange={e => setBrands(prev =>
                            prev.map(b => b.id === brand.id ? { ...b, name: e.target.value } : b)
                          )}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                          value={brand.description || ''}
                          onChange={e => setBrands(prev =>
                            prev.map(b => b.id === brand.id ? { ...b, description: e.target.value } : b)
                          )}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                          rows={2}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => handleUpdateBrand(brand.id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBrand(null)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{brand.name}</h3>
                        {brand.description && (
                          <p className="mt-1 text-gray-600 dark:text-gray-300">{brand.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingBrand(brand.id)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
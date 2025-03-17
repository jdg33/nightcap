import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlassWater, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Ingredient, Cocktail, CocktailIngredient } from '../types';

export default function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch ingredient details
        const { data: ingredientData } = await supabase
          .from('ingredients')
          .select('*')
          .eq('id', id)
          .single();

        // Fetch all cocktails that use this ingredient
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
      } catch (error) {
        console.error('Error fetching ingredient details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="text-center text-gray-600">
        Ingredient not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{ingredient.name}</h1>
            <div className="mt-2 text-purple-600 font-medium">{ingredient.category}</div>
          </div>
          <Link
            to={`/ingredient/${id}/edit`}
            className="flex items-center text-purple-600 hover:text-purple-700"
          >
            <Edit className="w-5 h-5 mr-1" />
            Edit
          </Link>
        </div>
        {ingredient.description && (
          <p className="mt-4 text-gray-600">{ingredient.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cocktails Using {ingredient.name}
        </h2>
        
        {cocktails.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
            No cocktails use this ingredient yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cocktails.map(cocktail => (
              <Link
                key={cocktail.id}
                to={`/cocktail/${cocktail.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {cocktail.name}
                  </h3>
                  <p className="text-purple-600 mt-1">
                    Uses {cocktail.amount} {cocktail.unit}
                  </p>
                  {cocktail.description && (
                    <p className="mt-2 text-gray-600 line-clamp-2">
                      {cocktail.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
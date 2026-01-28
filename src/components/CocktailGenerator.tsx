import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCocktailStore } from '../store/cocktailStore';

interface GeneratedCocktail {
  name: string;
  description: string;
  instructions: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function CocktailGenerator() {
  const navigate = useNavigate();
  const { ingredients, fetchIngredients } = useCocktailStore();
  const [generatedCocktail, setGeneratedCocktail] = useState<GeneratedCocktail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const generateCocktail = async () => {
    setIsGenerating(true);
    setError(null);

    if (!GEMINI_API_KEY) {
      setError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
      setIsGenerating(false);
      return;
    }

    try {
      const availableIngredients = ingredients.map(ing => ing.name).join(', ');
      
      const prompt = `Create a well-balanced cocktail recipe. The recipe should follow proper mixology ratios and be actually drinkable.

Available ingredients in the database: ${availableIngredients}

Please respond with a JSON object in this exact format:
{
  "name": "Cocktail Name",
  "description": "A brief description of the flavor profile and mood (2-3 sentences)",
  "instructions": "Step-by-step preparation instructions with proper technique",
  "ingredients": [
    {
      "name": "Ingredient Name",
      "amount": 2,
      "unit": "oz"
    }
  ]
}

Requirements:
- Use only ingredients from the available list above, or common garnishes like "Orange Peel", "Lemon Twist", "Cherry", "Lime Wheel"
- Follow standard cocktail ratios (the sour, the fizz, the spirit-forward, the tiki, the sparkling, the highballs, etc.)
- Use appropriate units: "oz" for spirits/liqueurs, "dash" for bitters, "piece" for garnishes
- Include 3-6 ingredients total
- Make it balanced and actually tasty
- Give it a creative but appropriate name
- Provide clear, professional instructions

Return only the JSON object, no other text.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to generate cocktail recipe: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Clean up the response to extract JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const cocktailData = JSON.parse(jsonMatch[0]);
      setGeneratedCocktail(cocktailData);
    } catch (error) {
      console.error('Error generating cocktail:', error);
      setError('Failed to generate cocktail recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addToLibrary = async () => {
    if (!generatedCocktail) return;

    setIsAdding(true);
    setError(null);

    try {
      // Insert the cocktail
      const { data: cocktail, error: cocktailError } = await supabase
        .from('cocktails')
        .insert([{
          name: generatedCocktail.name,
          description: generatedCocktail.description,
          instructions: generatedCocktail.instructions,
          is_jesse_original: false,
          is_hall_of_fame: false,
          author: 'AI Generated'
        }])
        .select()
        .single();

      if (cocktailError) throw cocktailError;

      // Add ingredients
      const ingredientPromises = generatedCocktail.ingredients.map(async (ing) => {
        // Find or create the ingredient
        let { data: existingIngredient } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ing.name)
          .single();

        if (!existingIngredient) {
          // Create new ingredient if it doesn't exist
          const category = ing.name.includes('Bitters') ? 'Mixer' : 
                          ing.name.includes('Peel') || ing.name.includes('Twist') || ing.name.includes('Cherry') || ing.name.includes('Wheel') ? 'Garnish' :
                          ing.name.includes('Syrup') ? 'Mixer' :
                          ing.name.includes('Juice') ? 'Juice' : 'Other';

          const { data: newIngredient, error: ingredientError } = await supabase
            .from('ingredients')
            .insert([{
              name: ing.name,
              category: category,
              description: null
            }])
            .select()
            .single();

          if (ingredientError) throw ingredientError;
          existingIngredient = newIngredient;
        }

        // Create cocktail-ingredient relationship
        return supabase
          .from('cocktail_ingredients')
          .insert([{
            cocktail_id: cocktail.id,
            ingredient_id: existingIngredient.id,
            amount: ing.amount,
            unit: ing.unit
          }]);
      });

      await Promise.all(ingredientPromises);

      // Navigate to the new cocktail
      navigate(`/cocktail/${cocktail.id}`);
    } catch (error) {
      console.error('Error adding cocktail to library:', error);
      setError('Failed to add cocktail to library. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AI Cocktail Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Generate a well-balanced cocktail recipe using AI. Each recipe follows proper mixology ratios and uses realistic ingredients.
        </p>
        
        <button
          onClick={generateCocktail}
          disabled={isGenerating}
          className="flex items-center justify-center mx-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Generate New Cocktail
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {generatedCocktail && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {generatedCocktail.name}
            </h2>
            <button
              onClick={addToLibrary}
              disabled={isAdding}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Library
                </>
              )}
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {generatedCocktail.description}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {generatedCocktail.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Instructions
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {generatedCocktail.instructions}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated by AI • Click "Add to Library" to save this recipe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
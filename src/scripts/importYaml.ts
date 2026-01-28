import { parse } from 'yaml';
import { supabase } from '../lib/supabase';

async function fetchYamlContent() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/stevana/cocktails/master/data/ingredients.yaml');
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching YAML:', error);
    throw error;
  }
}

async function importIngredients() {
  try {
    console.log('Fetching YAML content...');
    const yamlContent = await fetchYamlContent();
    
    console.log('Parsing YAML...');
    const data = parse(yamlContent);
    
    console.log('Importing ingredients...');
    for (const [category, ingredients] of Object.entries(data)) {
      if (typeof ingredients === 'object' && ingredients !== null) {
        for (const [name, description] of Object.entries(ingredients)) {
          // Check if ingredient already exists
          const { data: existingIngredient } = await supabase
            .from('ingredients')
            .select('id')
            .eq('name', name)
            .single();

          if (!existingIngredient) {
            const { error } = await supabase
              .from('ingredients')
              .insert({
                name,
                category,
                description: typeof description === 'string' ? description : null
              });

            if (error) {
              console.error(`Error importing ingredient ${name}:`, error);
              continue;
            }
            console.log(`Imported: ${name} (${category})`);
          } else {
            console.log(`Ingredient already exists: ${name}`);
          }
        }
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importIngredients();
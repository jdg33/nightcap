import { supabase } from '../lib/supabase';

interface Ingredient {
  name: string;
  category: string;
  description: string | null;
}

interface CocktailIngredient {
  name: string;
  amount: number;
  unit: string;
}

interface Cocktail {
  name: string;
  description: string | null;
  instructions: string;
  ingredients: CocktailIngredient[];
  isJesseOriginal: boolean;
  isHallOfFame: boolean;
}

const ingredients: Ingredient[] = [
  { name: "Gin", category: "Spirit", description: "A clear spirit flavored with juniper berries and other botanicals" },
  { name: "Sweet Vermouth", category: "Liqueur", description: "A fortified wine flavored with various herbs and spices" },
  { name: "Campari", category: "Liqueur", description: "A bright red Italian bitter aperitif" },
  { name: "Bourbon", category: "Spirit", description: "American whiskey made primarily from corn" },
  { name: "Angostura Bitters", category: "Mixer", description: "A concentrated bitter flavoring agent" },
  { name: "Sugar Cube", category: "Other", description: "Compressed cube of granulated sugar" },
  { name: "Orange Peel", category: "Garnish", description: "Outer skin of an orange, used for garnish and aromatics" },
  { name: "Rye Whiskey", category: "Spirit", description: "American whiskey made primarily from rye grain" },
  { name: "Dry Vermouth", category: "Liqueur", description: "A dry fortified wine flavored with herbs" },
  { name: "Green Olive", category: "Garnish", description: "Brined olive used for garnish" },
  { name: "London Dry Gin", category: "Spirit", description: "Traditional style of gin with prominent juniper flavor" },
  { name: "Vodka", category: "Spirit", description: "Clear, neutral spirit" },
  { name: "Kahlua", category: "Liqueur", description: "Coffee-flavored liqueur" },
  { name: "Heavy Cream", category: "Mixer", description: "High-fat dairy cream" },
  { name: "Tequila", category: "Spirit", description: "Mexican spirit made from blue agave" },
  { name: "Triple Sec", category: "Liqueur", description: "Orange-flavored liqueur" },
  { name: "Lime Juice", category: "Juice", description: "Fresh squeezed lime juice" },
  { name: "Salt Rim", category: "Garnish", description: "Salt for rimming glasses" },
  { name: "White Rum", category: "Spirit", description: "Clear rum aged briefly then filtered" },
  { name: "Simple Syrup", category: "Mixer", description: "Equal parts sugar and water, dissolved" },
  { name: "Mint Leaves", category: "Garnish", description: "Fresh mint for muddling and garnish" },
  { name: "Club Soda", category: "Mixer", description: "Carbonated water" }
];

const cocktails: Cocktail[] = [
  {
    name: "Negroni",
    description: "A perfectly balanced classic cocktail",
    instructions: "1. Add all ingredients to a mixing glass with ice\n2. Stir well until chilled\n3. Strain into a rocks glass over fresh ice\n4. Garnish with an orange peel",
    ingredients: [
      { name: "Gin", amount: 1, unit: "oz" },
      { name: "Sweet Vermouth", amount: 1, unit: "oz" },
      { name: "Campari", amount: 1, unit: "oz" },
      { name: "Orange Peel", amount: 1, unit: "piece" }
    ],
    isJesseOriginal: false,
    isHallOfFame: true
  },
  {
    name: "Old Fashioned",
    description: "The original cocktail",
    instructions: "1. Place sugar cube in rocks glass\n2. Add 2-3 dashes Angostura bitters\n3. Add small splash of water and muddle until sugar is mostly dissolved\n4. Add bourbon and stir\n5. Add large ice cube\n6. Garnish with orange peel",
    ingredients: [
      { name: "Bourbon", amount: 2, unit: "oz" },
      { name: "Angostura Bitters", amount: 2, unit: "dash" },
      { name: "Sugar Cube", amount: 1, unit: "piece" },
      { name: "Orange Peel", amount: 1, unit: "piece" }
    ],
    isJesseOriginal: false,
    isHallOfFame: true
  },
  {
    name: "Manhattan",
    description: "A sophisticated whiskey cocktail",
    instructions: "1. Add all ingredients to mixing glass with ice\n2. Stir well until chilled\n3. Strain into a chilled coupe glass\n4. Garnish with orange peel",
    ingredients: [
      { name: "Rye Whiskey", amount: 2, unit: "oz" },
      { name: "Sweet Vermouth", amount: 1, unit: "oz" },
      { name: "Angostura Bitters", amount: 2, unit: "dash" },
      { name: "Orange Peel", amount: 1, unit: "piece" }
    ],
    isJesseOriginal: false,
    isHallOfFame: true
  },
  {
    name: "Martini",
    description: "The king of cocktails",
    instructions: "1. Add gin and vermouth to mixing glass with ice\n2. Stir well until very cold\n3. Strain into chilled martini glass\n4. Garnish with olive",
    ingredients: [
      { name: "London Dry Gin", amount: 2.5, unit: "oz" },
      { name: "Dry Vermouth", amount: 0.5, unit: "oz" },
      { name: "Green Olive", amount: 1, unit: "piece" }
    ],
    isJesseOriginal: false,
    isHallOfFame: true
  },
  {
    name: "White Russian",
    description: "A creamy, coffee-flavored cocktail",
    instructions: "1. Fill a rocks glass with ice\n2. Add vodka and Kahlua\n3. Top with heavy cream\n4. Stir gently to combine",
    ingredients: [
      { name: "Vodka", amount: 2, unit: "oz" },
      { name: "Kahlua", amount: 1, unit: "oz" },
      { name: "Heavy Cream", amount: 1, unit: "oz" }
    ],
    isJesseOriginal: false,
    isHallOfFame: false
  },
  {
    name: "Margarita",
    description: "The perfect balance of sweet, sour, and tequila",
    instructions: "1. Rim a rocks glass with salt\n2. Add all ingredients to shaker with ice\n3. Shake well until chilled\n4. Strain into the prepared glass over fresh ice",
    ingredients: [
      { name: "Tequila", amount: 2, unit: "oz" },
      { name: "Triple Sec", amount: 1, unit: "oz" },
      { name: "Lime Juice", amount: 1, unit: "oz" },
      { name: "Salt Rim", amount: 1, unit: "piece" }
    ],
    isJesseOriginal: false,
    isHallOfFame: true
  },
  {
    name: "Mojito",
    description: "A refreshing Cuban classic",
    instructions: "1. In a highball glass, muddle mint leaves with simple syrup\n2. Add rum and lime juice\n3. Fill glass with crushed ice\n4. Top with club soda\n5. Garnish with mint sprig",
    ingredients: [
      { name: "White Rum", amount: 2, unit: "oz" },
      { name: "Lime Juice", amount: 1, unit: "oz" },
      { name: "Simple Syrup", amount: 0.75, unit: "oz" },
      { name: "Mint Leaves", amount: 6, unit: "piece" },
      { name: "Club Soda", amount: 2, unit: "oz" }
    ],
    isJesseOriginal: false,
    isHallOfFame: false
  }
];

async function importData() {
  try {
    console.log('Starting import...');

    // Import ingredients
    console.log('Importing ingredients...');
    for (const ingredient of ingredients) {
      const { data: existingIngredient } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', ingredient.name)
        .single();

      if (!existingIngredient) {
        const { error } = await supabase
          .from('ingredients')
          .insert(ingredient);

        if (error) {
          console.error(`Error importing ingredient ${ingredient.name}:`, error);
          continue;
        }
        console.log(`Imported ingredient: ${ingredient.name}`);
      } else {
        console.log(`Ingredient already exists: ${ingredient.name}`);
      }
    }

    // Import cocktails
    console.log('\nImporting cocktails...');
    for (const cocktail of cocktails) {
      // Check if cocktail exists
      const { data: existingCocktail } = await supabase
        .from('cocktails')
        .select('id')
        .eq('name', cocktail.name)
        .single();

      if (existingCocktail) {
        console.log(`Cocktail already exists: ${cocktail.name}`);
        continue;
      }

      // Insert cocktail
      const { data: newCocktail, error: cocktailError } = await supabase
        .from('cocktails')
        .insert({
          name: cocktail.name,
          description: cocktail.description,
          instructions: cocktail.instructions,
          is_jesse_original: cocktail.isJesseOriginal,
          is_hall_of_fame: cocktail.isHallOfFame
        })
        .select()
        .single();

      if (cocktailError) {
        console.error(`Error importing cocktail ${cocktail.name}:`, cocktailError);
        continue;
      }

      // Add ingredients
      for (const ingredient of cocktail.ingredients) {
        // Get ingredient ID
        const { data: ingredientData } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ingredient.name)
          .single();

        if (!ingredientData) {
          console.error(`Ingredient not found: ${ingredient.name}`);
          continue;
        }

        // Create cocktail-ingredient relationship
        const { error: relationError } = await supabase
          .from('cocktail_ingredients')
          .insert({
            cocktail_id: newCocktail.id,
            ingredient_id: ingredientData.id,
            amount: ingredient.amount,
            unit: ingredient.unit
          });

        if (relationError) {
          console.error(`Error adding ingredient ${ingredient.name} to ${cocktail.name}:`, relationError);
        }
      }

      console.log(`Imported cocktail: ${cocktail.name}`);
    }

    console.log('\nImport completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importData();
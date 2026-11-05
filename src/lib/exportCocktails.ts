import type { Cocktail, CocktailIngredient, Ingredient } from '../types';

interface ExportData {
  cocktails: Cocktail[];
  cocktailIngredients: CocktailIngredient[];
  ingredients: Ingredient[];
}

export function exportCocktailsToCSV({ cocktails, cocktailIngredients, ingredients }: ExportData) {
  const ingredientMap = new Map(ingredients.map(ing => [ing.id, ing]));

  const maxIngredients = Math.max(
    ...cocktails.map(cocktail =>
      cocktailIngredients.filter(ci => ci.cocktail_id === cocktail.id).length
    )
  );

  const headers = [
    'Cocktail Name',
    'Description',
    'Instructions',
    'Glass Type',
    'Garnish',
    ...Array.from({ length: maxIngredients }, (_, i) => [
      `Ingredient ${i + 1}`,
      `Amount ${i + 1}`,
      `Unit ${i + 1}`
    ]).flat()
  ];

  const rows = cocktails.map(cocktail => {
    const cocktailIngs = cocktailIngredients
      .filter(ci => ci.cocktail_id === cocktail.id)
      .sort((a, b) => a.order - b.order);

    const row = [
      escapeCSV(cocktail.name),
      escapeCSV(cocktail.description || ''),
      escapeCSV(cocktail.instructions || ''),
      escapeCSV(cocktail.glass || ''),
      escapeCSV(cocktail.garnish || ''),
    ];

    cocktailIngs.forEach(ci => {
      const ingredient = ingredientMap.get(ci.ingredient_id);
      row.push(
        escapeCSV(ingredient?.name || ''),
        ci.amount?.toString() || '',
        escapeCSV(ci.unit || '')
      );
    });

    while (row.length < headers.length) {
      row.push('');
    }

    return row;
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `cocktails_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

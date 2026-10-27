
import type {
  Ingredient,
  Meal,
  Recipe,
  ShoppingListItem,
  ShoppingListOptions,
} from '../types/mealPlanner'

export function calculateShoppingList(
  meals: Meal[],
  recipes: Recipe[],
  ingredients: Ingredient[],
  options: ShoppingListOptions,
): ShoppingListItem[] {
  if (!Number.isSafeInteger(options.days) || options.days < 1) {
    throw new Error('Choose a whole number of days greater than zero.')
  }

  const totals = new Map<string, ShoppingListItem>()

  for (const meal of meals) {
    const skipped = options.skippedMeals[meal.id] ?? 0

    if (
      !Number.isSafeInteger(skipped) ||
      skipped < 0 ||
      skipped > options.days
    ) {
      throw new Error(
        `Skipped meals for ${meal.title} must be between 0 and ${options.days}.`,
      )
    }

    const occurrences = options.days - skipped

    if (occurrences === 0) {
      continue
    }

    for (const planned of meal.recipes) {
      const recipe = recipes.find(
        (recipe) => recipe.id === planned.recipeId,
      )

      if (!recipe) {
        throw new Error(`Recipe ${planned.recipeId} is unavailable.`)
      }

      for (const entry of recipe.ingredients) {
        const ingredient = ingredients.find(
          (ingredient) => ingredient.id === entry.ingredientId,
        )

        if (!ingredient) {
          throw new Error(`An ingredient in ${recipe.name} is unavailable.`)
        }

        const amountGrams =
          entry.amountGrams / recipe.servings *
          planned.quantity * occurrences

        const existing = totals.get(ingredient.id)

        if (existing) {
          existing.amountGrams += amountGrams
        } else {
          totals.set(ingredient.id, {
            ingredientId: ingredient.id,
            name: ingredient.name,
            amountGrams,
          })
        }
      }
    }
  }

  return [...totals.values()].sort((first, second) =>
    first.name.localeCompare(second.name),
  )
}

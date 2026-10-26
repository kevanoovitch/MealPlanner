

export type RecipeIngredient = {
  ingredientId: string
  amountGrams: number
}

export type Ingredient = {
  id: string
  name: string
  kcalPer100g: number
  proteinPer100g: number
  sugarPer100g: number
  fatPer100g: number
}

export type Recipe = {
  id: string
  name: string
  servings: number
  ingredients: RecipeIngredient[]
  instructions: string
  imageUrl?: string | null
}

export type PlannedRecipe = {
  recipeId: string
  quantity: number
}

export type Meal = {
  id: string
  title: string
  recipes: PlannedRecipe[]
}

export type ShoppingListOptions = {
  days: number
  skippedMeals: Record<string, number>
}

export type ShoppingListItem = {
  ingredientId: string
  name: string
  amountGrams: number
}




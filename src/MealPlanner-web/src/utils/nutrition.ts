import type { Ingredient, Recipe } from "../data/mockData";

export function calculateRecipeNutrition(
    recipe: Recipe,
    ingredients: Ingredient[],
){
    const totals = {
        calories: 0,
        protein: 0,
        sugar: 0, 
        fat: 0,
    }

    for (const item of recipe.ingredients) {
        const ingredient = ingredients.find(
            (ingredient) => ingredient.id == item.ingredientId,
        )

        if (!ingredient) {
            throw new Error('Unkown ingredient: ${item.ingredientID')
        }

        const factor = item.amountGrams / 100

        totals.calories += ingredient.kcalPer100g * factor
        totals.protein += ingredient.proteinPer100g * factor
        totals.sugar += ingredient.sugarPer100g*factor
        totals.fat += ingredient.fatPer100g * factor
    }

    return totals
}
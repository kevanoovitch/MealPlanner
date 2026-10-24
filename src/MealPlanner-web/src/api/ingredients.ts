import type { Ingredient } from "../types/mealPlanner"

export async function getIngredients(
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch('/api/ingredients', { signal })

  if (!response.ok) {
    throw new Error(
      `Could not load ingredients (${response.status}).`,
    )
  }

  return response.json()
}

export async function createIngredient(
  ingredient: Omit<Ingredient, 'id'>,
): Promise<unknown> {
  const response = await fetch('/api/ingredients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ingredient),
  })

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data === 'string'
        ? data
        : `Could not save ingredient (${response.status}).`,
    )
  }
  return data

}






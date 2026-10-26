
import type { Recipe } from "../types/mealPlanner"

export async function getRecipes(
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch('/api/recipes', { signal })

  if (!response.ok) {
    throw new Error(
      `Could not load recipes (${response.status}).`
    )
  }
  return response.json()
}

export async function createRecipe(
  recipe: Omit<Recipe, 'id'>,
): Promise<unknown> {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  })

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data === 'string'
        ? data
        : `Could not save recipe (${response.status}).`
    )
  }

  return data
}

export async function updateRecipe(
  id: string,
  recipe: Omit<Recipe, 'id'>,
): Promise<unknown> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  })

  const data: unknown = response.status === 404
    ? null
    : await response.json()

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'This recipe no longer exists.'
        : typeof data === 'string'
          ? data
          : `Could not update recipe (${response.status}).`,
    )
  }

  return data
}

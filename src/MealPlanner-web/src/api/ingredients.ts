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

export async function updateIngredient(
  id: string,
  ingredient: Omit<Ingredient, 'id'>,
): Promise<unknown> {
  const response = await fetch(`/api/ingredeints/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ingredient),
  })

  const data: unknown = response.status === 404
    ? null
    : await response.json()

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'This ingredient no longer exists.'
        : typeof data === 'string'
          ? data
          : `Could not update ingredeint (${response.status}).`,
    )
  }

  return data
}

export async function deleteIngredient(id: string): Promise<void> {
  const response = await fetch(`/api/ingredients/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const data: unknown = response.status === 409
      ? await response.json()
      : null

    throw new Error(
      response.status === 404
        ? 'This ingredient no longer exists. Refresh the catalog.'
        : typeof data === 'string'
          ? data
          : `Could not delete ingredient (${response.status}).`,
    )
  }
}






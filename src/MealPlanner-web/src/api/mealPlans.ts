
import type { SavedMealPlan } from "../types/mealPlanner"

export async function getMealPlans(
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch('/api/meal-plans', { signal })

  if (!response.ok) {
    throw new Error(
      `Could not load meal plans (${response.status}).`,
    )

  }
  return response.json()
}

export async function getMealPlan(
  id: string,
  signal?: AbortSignal
): Promise<unknown> {
  const response = await fetch(
    `/api/meal-plans/${encodeURIComponent(id)}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'This meal plan no longer exists.'
        : `Could not load meal plan (${response.status}).`,
    )
  }

  return response.json()
}

export async function createMealPlan(
  plan: Omit<SavedMealPlan, 'id'>,
): Promise<unknown> {
  const response = await fetch('/api/meal-plans', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  })

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data === 'string'
        ? data
        : `Could not save meal plan (${response.status}).`,
    )
  }

  return data
}

export async function updateMealPlan(
  id: string,
  plan: Omit<SavedMealPlan, 'id'>,
): Promise<unknown> {
  const response = await fetch(
    `/api/meal-plans/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify(plan),
    },
  )

  if (response.status === 404) {
    throw new Error('This meal plan no longer exists.')
  }

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : `Could not update meal plan (${response.status})`,
    )
  }

  return data
}

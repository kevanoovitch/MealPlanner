
import { useState } from 'react'
import type {
  Ingredient,
  Meal,
  Recipe,
  ShoppingListItem,
  ShoppingListOptions,
} from '../types/mealPlanner'
import { calculateShoppingList } from '../utils/shoppingList.ts'

type shoppingListProps = {
  meals: Meal[]
  recipes: Recipe[]
  ingredients: Ingredient[]
}

function ShoppingList({ meals, recipes, ingredients }: shoppingListProps) {
  const [days, setDays] = useState('7')
  const [skippedMeals, setSkippedMeals] =
    useState<Record<string, string>>({})

  const options: ShoppingListOptions = {
    days: Number(days),
    skippedMeals: Object.fromEntries(
      meals.map((meal) => [
        meal.id,
        Number(skippedMeals[meal.id] ?? '0'),
      ]),
    ),
  }

  let items: ShoppingListItem[] = []
  let error = ''

  try {
    items = calculateShoppingList(meals, recipes, ingredients, options)
  } catch (caught) {
    error = caught instanceof Error
      ? caught.message
      : 'Could not calculate the shopping list.'
  }

  /* Markdown export */

  function downloadMarkdown() {
    if (error || items.length === 0) {
      return
    }

    const markdown = [
      '# Shopping list',
      '',
      `Planning period: ${options.days} days`,
      '',
      '# Meals included',
      '',
      ...meals.map((meal) => {
        const skipped = options.skippedMeals[meal.id] ?? 0
        const included = options.days - skipped

        return `- ${meal.title}: ${included} included, ${skipped} skipped`
      }),
      '',
      '# Ingredient',
      '',
      ...items.map((item) =>
        `- [ ] ${item.name.replace(/\s+/g, ' ')} - ${item.amountGrams.toFixed(1)} g`,
      ),
      '',
    ].join('\n')

    const file = new Blob([markdown], {
      type: 'text/markdown;charset=utf-8',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')

    link.href = url
    link.download = 'shopping-list.md'
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }




  return (
    <section className='shopping-list'>
      <h2>Shopping list</h2>
      <p>These settings affect groceries only, not your meal plan.</p>

      <label>
        Number of days
        <input
          type='number'
          min="1"
          step="1"
          value={days}
          onChange={(event) => setDays(event.target.value)}
        />
      </label>

      <fieldset>
        <legend>How many times will you skip each meal?</legend>

        {meals.map((meal) => (
          <label key={meal.id}>
            {meal.title}
            <input
              type='number'
              min="0"
              step="1"
              value={skippedMeals[meal.id] ?? '0'}
              onChange={(event) => {
                const value = event.target.value

                setSkippedMeals((current) => ({
                  ...current,
                  [meal.id]: value,
                }))
              }}
            />
          </label>
        ))}
      </fieldset>

      {error ? (
        <p role='alert'>{error}</p>
      ) : items.length === 0 ? (
        <p>No groceries needed for the included meals.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.ingredientId}>
              {item.name} - {item.amountGrams.toFixed(1)} g
            </li>
          ))}
        </ul>
      )}

      { /* Download markdwon button*/}
      <button
        type="button"
        disabled={Boolean(error) || items.length === 0}
        onClick={downloadMarkdown}
      >
        Download markdown
      </button>

    </section>
  )

}

export default ShoppingList

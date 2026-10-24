
import { useState } from 'react'
import type { Ingredient } from '../types/mealPlanner'

type IngredientFromProps = {
  onAdd: (ingredient: Omit<Ingredient, 'id'>) => void | Promise<void>
}

const nutrientFields = [
  { name: 'kcalPer100g', label: 'Calories (kcal)', max: undefined },
  { name: 'proteinPer100g', label: 'Protein (g)', max: 100 },
  { name: 'sugarPer100g', label: 'Sugar (g)', max: 100 },
  { name: 'fatPer100g', label: 'Fat (g)', max: 100 },
] as const

function IngredientForm({ onAdd }: IngredientFromProps) {
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  return (
    <form
      className='ingredient-form'
      onSubmit={async (event) => {
        event.preventDefault()

        if (isSaving) {
          return
        }

        const form = event.currentTarget
        const data = new FormData(form)
        const name = String(data.get('name') ?? '').trim()

        if (!name) {
          setError('Enter an ingredient name.')
          return
        }

        const nutrition = {
          kcalPer100g: Number(data.get('kcalPer100g')),
          proteinPer100g: Number(data.get('proteinPer100g')),
          sugarPer100g: Number(data.get('sugarPer100g')),
          fatPer100g: Number(data.get('fatPer100g')),
        }

        if (
          Object.values(nutrition).some(
            (value) => !Number.isFinite(value) || value < 0,
          )
        ) {
          setError('Enter valid, non-negative nutrition values.')
          return
        }

        setIsSaving(true)
        setError('')

        try {
          await onAdd({ name, ...nutrition })
          form.reset()
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Could not save ingredient',
          )
        } finally {
          setIsSaving(false)
        }
      }
      }
    >
      <h2>New Ingredient</h2>
      <p>Enter nutrition per 100 g from the product label.</p>
      <label>
        Ingredient Name
        <input
          name='name'
          required
          placeholder='Brand and product name'
        />
      </label>

      {
        nutrientFields.map((field) => (
          <label key={field.name}>
            {field.label} per 100 g
            <input
              name={field.name}
              type='number'
              min="0"
              max={field.max}
              step="any"
              required
            />
          </label>
        ))
      }
      {error && <p role='alert'>{error}</p>}

      <button type='submit' disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Add ingredient'}
      </button>
    </form >


  )

}


export default IngredientForm


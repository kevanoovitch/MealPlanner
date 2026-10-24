import { useState } from "react";
import { type Ingredient, type RecipeIngredient, type Recipe, } from "../types/mealPlanner";
import { calculateRecipeNutrition } from "../utils/nutrition";
import IngredientForm from "./IngredientFrom";

type RecipeFromProps = {
  ingredients: Ingredient[]
  onCancel: () => void
  onSave: (recipe: Omit<Recipe, 'id'>) => void
  onCreateIngredient: (
    ingredient: Omit<Ingredient, 'id'>,
  ) => Promise<Ingredient>
  initialRecipe?: Recipe
}

function RecipeFrom({ ingredients, onCancel, onSave, onCreateIngredient, initialRecipe, }: RecipeFromProps) {
  const [name, setName] = useState(initialRecipe?.name ?? '')
  const [servings, setServings] = useState(
    String(initialRecipe?.servings ?? 1),
  )
  const [instructions, setInstructions] = useState(
    initialRecipe?.instructions ?? '',
  )

  const [creatingIngredient, setCreatingIngredient] = useState(false)



  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [amountGrams, setAmountGrams] = useState('')
  const [recipeIngredients, setRecipeIngredient] =
    useState<RecipeIngredient[]>(() =>
      initialRecipe?.ingredients.map((item) => ({ ...item })) ?? [],
    )

  const parsedAmount = Number(amountGrams)
  const canAddIngredient =
    ingredients.some((ingredient) => ingredient.id === selectedIngredientId) &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0

  const parsedServings = Number(servings)
  const validServings =
    Number.isSafeInteger(parsedServings) && parsedServings >= 1

  const draft: Omit<Recipe, 'id'> = {
    name: name.trim(),
    servings: parsedServings,
    instructions: instructions.trim(),
    ingredients: recipeIngredients,
  }

  const canSave =
    draft.name.length > 0 &&
    draft.instructions.length > 0 &&
    validServings &&
    recipeIngredients.length > 0 &&
    recipeIngredients.every((item) => Number.isFinite(item.amountGrams) && item.amountGrams > 0,
    )

  const nutrition = calculateRecipeNutrition(
    { ...draft, id: 'preview' },
    ingredients,
  )


  return (
    <>
      <form
        className="recipe-form"
        onSubmit={(event) => {
          event.preventDefault()

          if (!canSave || creatingIngredient) {
            return
          }

          onSave(draft)

        }}
      >
        <h2>{initialRecipe ? 'Edit recipe' : 'New recipe'}</h2>

        <label>
          Recipe name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Number of servings this recipe makes
          <input
            type="number"
            min="1"
            step="1"
            value={servings}
            onChange={(event) => setServings(event.target.value)}
            required
          />
        </label>

        <label>
          instructions
          <textarea
            rows={5}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            required
          />
        </label>

        <fieldset>
          <legend>Ingredients</legend>

          <label>
            Ingredient
            <select
              value={selectedIngredientId}
              onChange={(event) => setSelectedIngredientId(event.target.value)}
            >

              <option value="">Choose an ingredient...</option>
              {ingredients.map((ingredients) => (
                <option key={ingredients.id} value={ingredients.id}>
                  {ingredients.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Amount for the whole recipe (g)
            <input
              type="number"
              min="0"
              step="any"
              value={amountGrams}
              onChange={(event) => setAmountGrams(event.target.value)}
            />
          </label>

          <button
            type="button"
            disabled={!canAddIngredient}
            onClick={() => {
              setRecipeIngredient((current) => {
                const alreadyAdded = current.some(
                  (item) => item.ingredientId === selectedIngredientId,
                )

                if (alreadyAdded) {
                  return current.map((item) =>
                    item.ingredientId === selectedIngredientId
                      ? { ...item, amountGrams: item.amountGrams + parsedAmount }
                      : item,
                  )
                }

                return [
                  ...current,
                  {
                    ingredientId: selectedIngredientId,
                    amountGrams: parsedAmount,
                  },
                ]
              })
              setSelectedIngredientId('')
              setAmountGrams('')
            }}
          >
            Add to recipe
          </button>

          <button
            type="button"
            onClick={() => setCreatingIngredient(true)}
            disabled={creatingIngredient}
          >Ingredient missing? Create one</button>

          <ul>
            {recipeIngredients.map((item) => {
              const ingredient = ingredients.find(
                (ingredient) => ingredient.id === item.ingredientId,
              )

              return (
                <li key={item.ingredientId}>

                  <label>
                    {ingredient?.name ?? 'Unknown ingredient'} - {item.amountGrams} g
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={item.amountGrams || ''}
                      onChange={(event) => {
                        const amount = Number(event.target.value)

                        setRecipeIngredient((current) =>
                          current.map((entry) =>
                            entry.ingredientId === item.ingredientId
                              ? { ...entry, amountGrams: amount }
                              : entry,

                          ),
                        )
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setRecipeIngredient((current) =>
                        current.filter(
                          (entry) => entry.ingredientId !== item.ingredientId,
                        ),
                      )
                    }
                  >

                    Remove
                  </button>
                </li>
              )



            })}
          </ul>
        </fieldset>

        <section aria-label="Recipe nutrition preview">
          <h3>Nutrition preview</h3>

          <p>
            Whole recipe: {nutrition.calories.toFixed(0)} kcal
            {' . '}
            {nutrition.protein.toFixed(1)} g protein
          </p>

          {validServings && (
            <p>
              Per servings: {(nutrition.calories / parsedServings).toFixed(0)} kcal
              {' . '}
              {(nutrition.protein / parsedServings).toFixed(1)} g protein
            </p>
          )}

        </section>

        {/* Save button */}
        <div className="form-actions">
          <button type="submit" disabled={!canSave || creatingIngredient}>
            Save recipe
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>


      </form>

      {/* add missing ingredients */}

      {
        creatingIngredient && (
          <section aria-label="Create missing ingredient">
            <IngredientForm
              onAdd={async (values) => {
                const created = await onCreateIngredient(values)
                setSelectedIngredientId(created.id)
                setCreatingIngredient(false)
              }}
            />

            <button
              type="button"
              onClick={() => setCreatingIngredient(false)}
            >
              Cancel ingredient creation
            </button>
          </section>
        )
      }
      )
    </>

  )
}

export default RecipeFrom

import "./App.css";
import RecipeCard from './components/RecipeCard.tsx'
import MealColumn from './components/MealColumn.tsx'
import RecipePicker from './components/RecipePicker.tsx'
import IngredientForm from "./components/IngredientFrom.tsx";
import RecipeFrom from "./components/RecipeForm.tsx";

import {
  recipes as mockRecipes,
  ingredients as initialIngredients,
} from "./data/mockData";
import type { Ingredient, Recipe } from "./data/mockData";
import { calculateRecipeNutrition } from "./utils/nutrition";

import { useState, useEffect, useRef } from "react";
import NutritionBar from "./components/NutritionBar.tsx";

type PlannedRecipe = {
  recipeId: string
  quantity: number
}

type Meal = {
  id: string
  title: string
  recipes: PlannedRecipe[]
}
const initialMeals: Meal[] = [
  {
    id: 'Breakfast',
    title: 'Breakfast',
    recipes: [],
  },
  { id: 'snack-1', title: 'Snack 1', recipes: [] },
  { id: 'lunch', title: 'Lunch', recipes: [] },
  { id: 'dinner', title: 'Dinner', recipes: [] },
  { id: 'snack-2', title: 'Snack 2', recipes: [] },

]

const initialTargets = {
  calories: 2500,
  protein: 180,
};


function isMealPlan(value: unknown): value is Meal[] {
  return (
    Array.isArray(value) &&
    value.every(
      (meal) =>
        meal !== null &&
        typeof meal === 'object' &&
        typeof meal.id === 'string' &&
        typeof meal.title === 'string' &&
        Array.isArray(meal.recipes) &&
        meal.recipes.every(
          (item: unknown) =>
            item != null &&
            typeof item === 'object' &&
            'recipeId' in item &&
            typeof item.recipeId === 'string' &&
            'quantity' in item &&
            typeof item.quantity === 'number' &&
            Number.isSafeInteger(item.quantity) &&
            item.quantity >= 1,
        ),
    )
  )
}

function isIngredient(value: unknown): value is Ingredient {
  if (
    value === null ||
    typeof value !== 'object' ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !value.name.trim()
  ) {
    return false
  }

  const fields = [
    'kcalPer100g',
    'proteinPer100g',
    'sugarPer100g',
    'fatPer100g',
  ] as const

  return fields.every((field) => {

    if (!(field in value)) {
      return false
    }

    const amount = (value as Record<string, unknown>)[field]

    return (
      typeof amount === 'number' &&
      Number.isFinite(amount) &&
      amount >= 0 &&
      (field === 'kcalPer100g' || amount <= 100)
    )
  })
}

function isRecipe(value: unknown): value is Recipe {
  if (
    value === null ||
    typeof value !== 'object' ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    !('instructions' in value) ||
    typeof value.instructions !== 'string' ||
    !value.instructions.trim() ||
    !('servings' in value) ||
    typeof value.servings !== 'number' ||
    !Number.isSafeInteger(value.servings) ||
    value.servings < 1 ||
    !('ingredients' in value) ||
    !Array.isArray(value.ingredients) ||
    value.ingredients.length === 0
  ) {
    return false
  }

  if ('imageUrl' in value && typeof value.imageUrl !== 'string') {
    return false
  }

  return value.ingredients.every(
    (item: unknown) =>
      item != null &&
      typeof item === 'object' &&
      'ingredientId' in item &&
      typeof item.ingredientId === 'string' &&
      'amountGrams' in item &&
      typeof item.amountGrams === 'number' &&
      Number.isFinite(item.amountGrams) &&
      item.amountGrams > 0,
  )
}

type ExportedMealPlan = {
  version: 1
  dailyTargets: {
    calories: number
    protein: number
  }
  meals: Meal[]
}

function isExportedMealPlan(value: unknown): value is ExportedMealPlan {
  if (
    value === null ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('dailyTargets' in value) ||
    !('meals' in value)
  ) {
    return false
  }

  const targets = value.dailyTargets

  if (
    targets === null ||
    typeof targets !== 'object' ||
    !('calories' in targets) ||
    typeof targets.calories !== 'number' ||
    !Number.isFinite(targets.calories) ||
    targets.calories <= 0 ||
    !('protein' in targets) ||
    typeof targets.protein !== 'number' ||
    !Number.isFinite(targets.protein) ||
    targets.protein <= 0
  ) {
    return false
  }

  if (!isMealPlan(value.meals)) {
    return false
  }

  const MealsIds = new Set(value.meals.map((meal) => meal.id))

  return (
    value.meals.length === initialMeals.length &&
    MealsIds.size === initialMeals.length &&
    initialMeals.every((meal) => MealsIds.has(meal.id)) &&
    value.meals.every((meal) => {
      const recipeIds = meal.recipes.map((recipe) => recipe.recipeId)

      return (
        meal.title.trim().length > 0 &&
        recipeIds.every((recipeId) => recipeId.trim().length > 0) &&
        new Set(recipeIds).size === recipeIds.length
      )
    })
  )
}


function App() {


  const [activeView, setActiveView] = useState<
    'planner' | 'recipes' | 'ingredients'
  >('planner')

  const [recipeSearch, setRecipeSearch] = useState('')

  const [ingredientSearch, setIngredientSearch] = useState('')

  const [importMessage, setImportMessage] = useState('')

  const [ingredients, setIngredients] =
    useState<Ingredient[]>(() => {
      try {
        const stored = localStorage.getItem('mealplanner.ingredients')

        if (stored !== null) {
          const parsed: unknown = JSON.parse(stored)

          if (Array.isArray(parsed) && parsed.every(isIngredient)) {
            const ids = new Set(parsed.map((ingredient) => ingredient.id))

            const hasUniqueIds = ids.size === parsed.length
            const hasRequiredIngredients = mockRecipes.every((recipe) =>
              recipe.ingredients.every((item) => ids.has(item.ingredientId)),
            )

            if (hasUniqueIds && hasRequiredIngredients) {
              return parsed
            }
          }

        }
      } catch {
        console.warn('Could not load saved ingredients.')
      }
      return initialIngredients
    })

  const [recipeCatalog, setRecipeCatalog] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem('mealplanner.recipes')

      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored)

        if (Array.isArray(parsed) && parsed.every(isRecipe)) {
          const recipeIds = new Set(parsed.map((recipe) => recipe.id))
          const ingredientIds = new Set(
            ingredients.map((ingredient) => ingredient.id),
          )
          const validReferences = parsed.every((recipe) =>
            recipe.ingredients.every((item) =>
              ingredientIds.has(item.ingredientId),
            ),
          )

          if (recipeIds.size === parsed.length && validReferences) {
            return parsed
          }
        }
        console.warn('Saved recipes are invalid; using starter recipes.')
      }
    } catch {
      console.warn('Could not load saved recipes.')
    }
    return mockRecipes
  })


  const [recipeFormOpen, setRecipeFromOpen] = useState(false)


  const recipes = recipeCatalog.map((recipe) => {
    const nutrition = calculateRecipeNutrition(recipe, ingredients);


    return {
      id: recipe.id,
      name: recipe.name,
      calories: nutrition.calories / recipe.servings,
      protein: nutrition.protein / recipe.servings,
    };
  });



  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  const [draggedRecipe, setDraggedRecipe] = useState<{
    mealId: string
    recipeId: string
  } | null>(null)

  const selectedRecipe = recipeCatalog.find(
    (recipe) => recipe.id === selectedRecipeId,
  )
  const [ingredientFormOpen, setIngredientFormOpen] = useState(false)

  const detailsRef = useRef<HTMLDialogElement>(null)

  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const stored = localStorage.getItem('mealplanner.meals')

      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored)

        if (isMealPlan(parsed)) {
          return parsed
        }
      }
    } catch {
      console.warn('Could not load saved meals.')
    }
    return initialMeals
  })

  const [dailyTargets, setDailyTargets] = useState(() => {

    try {
      const stored = localStorage.getItem('mealplanner.targets')

      if (!stored) {
        return initialTargets
      }

      const parsed = JSON.parse(stored)

      if (
        typeof parsed?.calories === 'number' &&
        Number.isFinite(parsed.calories) &&
        parsed.calories > 0 &&
        typeof parsed?.protein === 'number' &&
        Number.isFinite(parsed.protein) &&
        parsed.protein > 0
      ) {
        return {
          calories: parsed.calories,
          protein: parsed.protein,
        }
      }
    } catch {
      // Fall back to defaults if storage is unavailable or invalid
    }
    return initialTargets
  })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const displayedMeals = meals.map((meal) => ({
    ...meal,
    recipes: meal.recipes.flatMap((plannedRecipe) => {
      const recipe = recipes.find(
        (recipe) => recipe.id === plannedRecipe.recipeId,
      )

      if (!recipe) {
        return []
      }

      return [{
        ...recipe,
        quantity: plannedRecipe.quantity,
      }]
    }),
  }))


  useEffect(() => {

    try {
      localStorage.setItem('mealplanner.recipes',
        JSON.stringify(recipeCatalog),
      )
    } catch {
      console.warn('Could not save recipes in this browser.')
    }
  }, [recipeCatalog])

  useEffect(() => {
    try {
      localStorage.setItem('mealplanner.ingredients',
        JSON.stringify(ingredients),
      )
    } catch {
      console.warn('Could not save ingredients in this browser.')
    }
  }, [ingredients])

  useEffect(() => {
    const dialog = detailsRef.current

    if (!dialog) {
      return
    }

    if (selectedRecipe && !dialog.open) {
      dialog.showModal()
    } else if (!selectedRecipe && dialog.open) {
      dialog.close()
    }
  }, [selectedRecipe])

  // ### Change quantity ### 

  function changeQuantity(
    mealId: string,
    recipeId: string,
    change: number
  ) {
    setMeals((currentMeals) => currentMeals.map((meal) => {
      if (meal.id !== mealId) {
        return meal
      }

      return {
        ...meal,
        recipes: meal.recipes.map((recipe) => {
          if (recipe.recipeId !== recipeId) {
            return recipe
          }

          return {
            ...recipe,
            quantity: Math.max(1, recipe.quantity + change),
          }
        }),
      }
    }),)
  }


  // ### Drag move func ### 

  function moveRecipe(
    sourceMealId: string,
    targetMealId: string,
    recipeId: string
  ) {
    if (sourceMealId == targetMealId) {
      return
    }

    setMeals((currentMeals) => {
      const source = currentMeals.find((meal) => meal.id === sourceMealId)
      const movingRecipe = source?.recipes.find(
        (recipe) => recipe.recipeId === recipeId,
      )

      if (
        !movingRecipe ||
        !currentMeals.some((meal) => meal.id === targetMealId)
      ) {
        return currentMeals
      }

      return currentMeals.map((meal) => {
        if (meal.id === sourceMealId) {
          return {
            ...meal,
            recipes: meal.recipes.filter(
              (recipes) => recipes.recipeId !== recipeId,
            ),
          }
        }


        if (meal.id === targetMealId) {
          const alreadyAdded = meal.recipes.some(
            (recipe) => recipe.recipeId === recipeId,
          )

          return {
            ...meal,
            recipes: alreadyAdded
              ? meal.recipes.map((recipe) =>
                recipe.recipeId === recipeId
                  ? {
                    ...recipe,
                    quantity: recipe.quantity + movingRecipe?.quantity,
                  }
                  : recipe,
              )
              : [...meal.recipes, { ...movingRecipe }],
          }
        }

        return meal
      })
    })
  }


  // ### Adding button ### 

  function addRecipe(mealId: string, recipeId: string) {
    // Look up the recipe in the catalog: it has an "id", 
    const recipeToAdd = recipes.find(
      (recipe) => recipe.id === recipeId,
    )

    if (!recipeToAdd) {
      return
    }

    setMeals((currentMeals) =>
      currentMeals.map((meal) => {
        if (meal.id !== mealId) {
          return meal
        }

        // A placement inside a meal has a "recipeId"
        const alreadyAdded = meal.recipes.some(
          (plannedRecipe) => plannedRecipe.recipeId === recipeId,
        )

        if (alreadyAdded) {
          return meal
        }

        return {
          ...meal,
          recipes: [
            ...meal.recipes,
            { recipeId: recipeToAdd.id, quantity: 1 },
          ],
        }
      }),
    )
  }

  // ### Remove button ### 

  function removeRecipe(mealId: string, recipeId: string) {
    setMeals((currentMeals) =>
      currentMeals.map((meal) => {
        if (meal.id !== mealId) {
          return meal
        }

        return {
          ...meal,
          recipes: meal.recipes.filter(
            (recipe) => recipe.recipeId !== recipeId
          ),
        }
      }),
    )
  }

  // ### Export meal plan as JSON ### 

  function exportMealPlan() {
    const plan = {
      version: 1,
      dailyTargets,
      meals,
    }

    const json = JSON.stringify(plan, null, 2)
    const file = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(file)

    const link = document.createElement('a')
    link.href = url
    link.download = 'meal-plan.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // ### Import meal plan as JSON ### 

  async function importMealPlan(file: File) {
    setImportMessage('')

    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)

      if (!isExportedMealPlan(parsed)) {
        setImportMessage('This file is not a supported meal plan.')
        return
      }

      const availableRecipeIds = new Set(
        recipeCatalog.map((recipe) => recipe.id),
      )

      const missingRecipeIds = [
        ...new Set(
          parsed.meals.flatMap((meal) =>
            meal.recipes
              .filter((recipe) => !availableRecipeIds.has(recipe.recipeId))
              .map((recipe) => recipe.recipeId),
          ),
        ),
      ]

      if (missingRecipeIds.length > 0) {
        setImportMessage(
          `Cannot import: these recipes are msising from your catalog: ${missingRecipeIds.join('. ')
          }. Your current plan has not changed. `,
        )
        return
      }
      const confirmed = window.confirm(`Recplace your current meals and saved daily targets with this plan?`,)

      if (!confirmed) {
        setImportMessage(`Import cancelled. Your current plan has not changed.`)
        return
      }

      setMeals(parsed.meals)
      setDailyTargets(parsed.dailyTargets)
      setSettingsOpen(false)
      setImportMessage('Meal plan imported.')
    } catch {
      setImportMessage(
        `Could not read this meal plan. Chose valid JSON export. Your current plan has not changed`
      )
    }
  }




  // ### Totals overhead bar ### 

  const mealColors: Record<string, string> = {
    Breakfast: '#d97706',
    'snack-1': '#7c3aed',
    lunch: '#0281c7',
    dinner: '#059669',
    'snack-2': '#db2777',
  }

  const mealNutrition = displayedMeals.map((meal) => ({
    id: meal.id,
    title: meal.title,
    color: mealColors[meal.id] ?? '#64748b',
    calories: meal.recipes.reduce(
      (total, recipe) => total + recipe.calories * recipe.quantity, 0,),
    protein: meal.recipes.reduce(
      (total, recipe) => total + recipe.protein * recipe.quantity, 0,),
  }))


  const dailyTotals = displayedMeals.reduce(
    (totals, meal) => {
      for (const recipe of meal.recipes) {
        totals.calories += recipe.calories * recipe.quantity;
        totals.protein += recipe.protein * recipe.quantity;
      }

      return totals;
    },
    { calories: 0, protein: 0 },
  );

  const overCalorieBudget = dailyTotals.calories > dailyTargets.calories

  const largestCardCalories = displayedMeals.reduce(
    (largest, meal) =>
      meal.recipes.reduce(
        (mealLargest, recipe) =>
          Math.max(mealLargest, recipe.calories * recipe.quantity),
        largest,
      ),
    0,
  )

  // ### Persistence of top bar values and settings ### 

  useEffect(() => {
    try {
      localStorage.setItem('mealplanner.targets',
        JSON.stringify(dailyTargets),
      )
    } catch {
      console.warn('Could not save targets in this browser')
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('mealplanner.meals', JSON.stringify(meals),)
    } catch {
      console.warn('Could not save meals in this browser.')
    }
  }, [meals])


  function addIngredient(ingredient: Omit<Ingredient, 'id'>): Ingredient {
    const newIngredient = {
      ...ingredient,
      id: crypto.randomUUID(),
    }

    setIngredients((current) => [...current, newIngredient])

    return newIngredient
  }

  function addNewRecipe(recipe: Omit<Recipe, 'id'>) {
    setRecipeCatalog((current) => [
      ...current,
      { ...recipe, id: crypto.randomUUID() },
    ])

    setRecipeFromOpen(false)
  }


  const filteredRecipes = recipes.filter((recipie) =>
    recipie.name.toLowerCase().includes(recipeSearch.trim().toLowerCase()),
  )

  const filteredIngredients = ingredients.filter((ingredient) =>

    ingredient.name.toLocaleLowerCase().includes(
      ingredientSearch.trim().toLowerCase(),
    ),
  )


  // ### App() return ### 

  return (
    <main>
      <h1>Meal Planner</h1>

      <nav aria-label="Main navigation" className="main-nav">
        <button
          type="button"

          aria-current={activeView === 'planner' ? 'page' : undefined}
          onClick={() => setActiveView('planner')}>
          Planner
        </button>
        <button
          type="button"
          aria-current={activeView === 'recipes' ? 'page' : undefined}
          onClick={() => setActiveView('recipes')}>

          Recipes
        </button>
        <button
          type="button"
          aria-current={activeView === 'ingredients' ? 'page' : undefined}
          onClick={() => setActiveView('ingredients')}>
          ingredients
        </button>
      </nav>


      {activeView === 'planner' && (
        <>
          {/* Settings */}

          <button
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
          >
            Settings
          </button>

          {settingsOpen && (
            <>
              <form
                onSubmit={(event) => {
                  event.preventDefault()

                  const formData = new FormData(event.currentTarget)
                  const calories = Number(formData.get('calories'))
                  const protein = Number(formData.get('protein'))

                  if (
                    !Number.isFinite(calories) ||
                    !Number.isFinite(protein) ||
                    calories <= 0 ||
                    protein <= 0
                  ) {
                    return
                  }

                  setDailyTargets({ calories, protein })
                  setSettingsOpen(false)
                }}
              >

                <label>

                  Daily calories (kcal)
                  <input
                    name="calories"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={dailyTargets.calories}
                  />
                </label>

                <label>

                  Daily Protein (g)
                  <input
                    name="protein"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={dailyTargets.protein}
                  />
                </label>
                <button type="submit">Save targets</button>

                <button type="button" onClick={exportMealPlan}>
                  Export plan
                </button>


              </form>

              {/* Import plan fragment */}

              <label>
                Import plan
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ''

                    if (file) {
                      void importMealPlan(file)
                    }
                  }}
                />
              </label>
            </>
          )}

          {importMessage && <p role="status">{importMessage}</p>}

          {/* Nutrition summary Bar */}

          <div className="nutrition-summary">

            <NutritionBar
              label="Calories"
              unit="kcal"
              target={dailyTargets.calories}
              mode="budget"
              segments={mealNutrition.map((meal) => ({
                ...meal,
                value: meal.calories,
              }))}
            />

            <NutritionBar
              label="Protein"
              unit="g"
              target={dailyTargets.protein}
              mode="goal"
              segments={mealNutrition.map((meal) => ({
                ...meal,
                value: meal.protein,
              }))}
            />
          </div>


          <div className="meal-grid">
            {displayedMeals.map((meal) => (
              <MealColumn
                key={meal.id}
                title={meal.title}
                color={mealColors[meal.id] ?? '#64748b'}
                canDrop={draggedRecipe !== null && draggedRecipe.mealId !== meal.id}
                onDrop={(event) => {
                  event.preventDefault()

                  if (draggedRecipe) {
                    moveRecipe(draggedRecipe.mealId, meal.id, draggedRecipe.recipeId)
                    setDraggedRecipe(null)
                  }
                }}
                calories={
                  mealNutrition.find((nutrition) => nutrition.id === meal.id)?.calories ?? 0
                }
                protein={
                  mealNutrition.find((nutrition) => nutrition.id === meal.id)?.protein ?? 0
                }
              >



                {meal.recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    name={recipe.name}
                    quantity={recipe.quantity}
                    calories={recipe.calories}
                    protein={recipe.protein}
                    highlightCalories={
                      overCalorieBudget &&
                      recipe.calories * recipe.quantity === largestCardCalories
                    }
                    dailyCalories={dailyTotals.calories}
                    onRemove={() => removeRecipe(meal.id, recipe.id)}
                    onIncrease={() => changeQuantity(meal.id, recipe.id, 1)}
                    onDecrease={() => changeQuantity(meal.id, recipe.id, -1)}
                    onViewDetails={() => setSelectedRecipeId(recipe.id)}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', recipe.id)
                      setDraggedRecipe({ mealId: meal.id, recipeId: recipe.id })
                    }}
                    onDragEnd={() => setDraggedRecipe(null)}
                  />
                ))}

                <RecipePicker
                  recipes={recipes}
                  selectedRecipeIds={meal.recipes.map((recipe) => recipe.id)}
                  onAdd={(recipeId) => addRecipe(meal.id, recipeId)}
                />

              </MealColumn>
            ))}
          </div>




        </>
      )}

      {activeView === 'recipes' && (
        <section>
          <h2>Recipe catalog</h2>
          <label>
            Search recipe
            <input
              type="search"
              value={recipeSearch}
              onChange={(event) => setRecipeSearch(event.target.value)}
              placeholder="Search by name"
            />
          </label>
          {recipeFormOpen ? (
            <RecipeFrom
              ingredients={ingredients}
              onCancel={() => setRecipeFromOpen(false)}
              onSave={addNewRecipe}
              onCreateIngredient={addIngredient}
            />
          ) : (
            <button type="button" onClick={() => setRecipeFromOpen(true)}>
              New recipe
            </button>
          )}

          <div className="recipe-catalog">
            {filteredRecipes.map((recipe) => (
              <article key={recipe.id}>
                <h3>{recipe.name}</h3>
                <p>
                  {recipe.calories.toFixed(0)} kcal ·{' '}
                  {recipe.protein.toFixed(1)} g protein per serving
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedRecipeId(recipe.id)}
                >
                  Details
                </button>
              </article>
            ))}

          </div>
          {filteredRecipes.length === 0 && <p>No matching recipes.</p>}

        </section>
      )}


      {
        selectedRecipe && (

          <dialog ref={detailsRef} onCancel={() => setSelectedRecipeId(null)} aria-labelledby="recipe-details.title">
            {selectedRecipe && (
              <>

                <h2 id="recipe-details-title">{selectedRecipe.name}</h2>

                <h3>Instructions</h3>
                <p className="recipe-instructions">
                  {selectedRecipe.instructions}
                </p>
                <p>Makes {selectedRecipe.servings} serving(s)</p>

                <ul>
                  {selectedRecipe.ingredients.map((item) => {
                    const ingredient = ingredients.find((ingredient) => ingredient.id === item.ingredientId,
                    )

                    return (
                      <li key={item.ingredientId}>
                        {ingredient?.name ?? 'Unkown ingredient'}: {item.amountGrams} g
                      </li>
                    )
                  }
                  )}
                </ul>

                <button onClick={() => setSelectedRecipeId(null)}>
                  Close details
                </button>
              </>
            )}
          </dialog>
        )
      }


      {activeView === 'ingredients' && (
        <section>
          <button
            type="button"
            onClick={() => setIngredientFormOpen((open) => !open)}
            aria-expanded={ingredientFormOpen}
          >
            {ingredientFormOpen ? 'Cancel' : 'New ingredient'}
          </button>

          {ingredientFormOpen && (
            <IngredientForm
              onAdd={(ingredient) => {
                addIngredient(ingredient)
                setIngredientFormOpen(false)
              }}
            />
          )}

          <h2>Ingredient catalog</h2>

          <label>
            Search Ingredients
            <input
              type="search"
              value={ingredientSearch}
              onChange={(event) => setIngredientSearch(event.target.value)}
              placeholder="Search by product name"
            />
          </label>

          <div className="ingredient-table-container">
            <table className="ingredient-table">
              <caption>Nutrition per 100 g</caption>
              <thead>
                <tr>
                  <th scope="col">Ingredient</th>
                  <th scope="col">Calories (kcal)</th>
                  <th scope="<col>">Proteing (g)</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <th scope="row">{ingredient.name}</th>
                    <td>{ingredient.kcalPer100g.toFixed(0)}</td>
                    <td>{ingredient.proteinPer100g.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredIngredients.length === 0 && <p>No matching ingredients.</p>}
        </section>
      )}


    </main >
  );
}

export default App;

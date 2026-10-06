import "./App.css";
import RecipeCard from './components/RecipeCard.tsx'
import MealColumn from './components/MealColumn.tsx'
import RecipePicker from './components/RecipePicker.tsx'

import { recipes as mockRecipes, ingredients } from "./data/mockData";
import { calculateRecipeNutrition } from "./utils/nutrition";

import { useState, useEffect, useRef } from "react";



const recipes = mockRecipes.map((recipe) => {
  const nutrition = calculateRecipeNutrition(recipe, ingredients);

  return {
    id: recipe.id,
    name: recipe.name,
    calories: nutrition.calories / recipe.servings,
    protein: nutrition.protein / recipe.servings,
  };
});

const initialMeals = [
  {
    id: "Breakfast", title: "Breakfast", recipes: recipes.map((recipe) => ({ ...recipe, quantity: 1, }
    ))
  },
  { id: "snack-1", title: "Snack 1", recipes: [] },
  { id: "lunch", title: "Lunch", recipes: [] },
  { id: "dinner", title: "Dinner", recipes: [] },
  { id: "snack-2", title: "Snack 2", recipes: [] },
];

const initialTargets = {
  calories: 2500,
  protein: 180,
};

function App() {

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)

  const selectedRecipe = mockRecipes.find(
    (recipe) => recipe.id === selectedRecipeId,
  )

  const detailsRef = useRef<HTMLDialogElement>(null)
  const [meals, setMeals] = useState(initialMeals);

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
          if (recipe.id !== recipeId) {
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


  // ### Adding button ### 

  function addRecipe(mealId: string, recipeId: string) {
    const recipeToAdd = recipes.find((recipe) => recipe.id === recipeId);

    if (!recipeToAdd) {
      return;
    }

    setMeals((currentMeals) =>
      currentMeals.map((meal) => {
        if (meal.id !== mealId) {
          return meal;
        }

        if (meal.recipes.some((recipe) => recipe.id === recipeId)) {
          return meal;
        }

        return {
          ...meal,
          recipes: [...meal.recipes, { ...recipeToAdd, quantity: 1 }],
        };
      }),
    );
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
            (recipe) => recipe.id !== recipeId
          ),
        }
      }),
    )
  }

  // ### Totals overhead bar ### 
  const dailyTotals = meals.reduce(
    (totals, meal) => {
      for (const recipe of meal.recipes) {
        totals.calories += recipe.calories * recipe.quantity;
        totals.protein += recipe.protein * recipe.quantity;
      }

      return totals;
    },
    { calories: 0, protein: 0 },
  );

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



  return (
    <main>
      <h1>Meal Planner</h1>

      <button
        onClick={() => setSettingsOpen((open) => !open)}
        aria-expanded={settingsOpen}
      >
        Settings
      </button>

      {settingsOpen && (
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

        </form>
      )}

      <div className="nutrition-summary">
        <label htmlFor="calorie-progress">
          Calories: {dailyTotals.calories.toFixed(0)} / {dailyTargets.calories}{" "}
          kcal
        </label>
        <progress
          id="calorie-progress"
          value={dailyTotals.calories}
          max={dailyTargets.calories}
        />

        <label htmlFor="protein-progress">
          Protein: {dailyTotals.protein.toFixed(1)} / {dailyTargets.protein} g
        </label>
        <progress
          id="protein-progress"
          value={dailyTotals.protein}
          max={dailyTargets.protein}
        />
      </div>


      <div className="meal-grid">
        {meals.map((meal) => (
          <MealColumn key={meal.id} title={meal.title}>
            {meal.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                name={recipe.name}
                quantity={recipe.quantity}
                calories={recipe.calories}
                protein={recipe.protein}
                onRemove={() => removeRecipe(meal.id, recipe.id)}
                onIncrease={() => changeQuantity(meal.id, recipe.id, 1)}
                onDecrease={() => changeQuantity(meal.id, recipe.id, -1)}
                onViewDetails={() => setSelectedRecipeId(recipe.id)}
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


      {selectedRecipe && (

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
      )}


    </main>
  );
}

export default App;

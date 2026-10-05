import "./App.css";
import type { ReactNode } from "react";

import { recipes as mockRecipes, ingredients } from "./data/mockData";
import { calculateRecipeNutrition } from "./utils/nutrition";

import { useState } from "react";

type RecipeCardProps = {
  name: string;
  calories: number;
  protein: number;
  quantity: number;
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
};

function RecipeCard({ name, calories, protein, quantity, onDecrease, onIncrease, onRemove }: RecipeCardProps) {
  return (
    <article>
      <h3>{name}</h3>
      <div>
        <button onClick={onDecrease}
          disabled={quantity <= 1}
          aria-label={"Decrease servings of ${name}"}
        >-</button>
        <span> servings: {quantity} </span>

        <button onClick={onIncrease} aria-label={"Increase servings of ${name}"}>
          +
        </button>
      </div>
      <p>Calories: {calories.toFixed(0)} kcal</p>
      <p>Protein: {protein.toFixed(1)} g</p>
      <button onClick={onRemove}>Remove</button>
    </article>
  );
}

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

type MealColumnProps = {
  title: string;
  children?: ReactNode;
};

function MealColumn({ title, children }: MealColumnProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
const dailyTargets = {
  calories: 2500,
  protein: 180,
};

function App() {

  const [meals, setMeals] = useState(initialMeals);

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




  return (
    <main>
      <h1>Meal Planner</h1>

      <div>
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
          id="proteie-progress"
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
              />
            ))}

            <label>
              Add recipe
              <select value=""
                onChange={(event) => {
                  const recipeId = event.target.value

                  if (recipeId) {
                    addRecipe(meal.id, recipeId)
                  }
                }}
              >
                <option value="" disabled>
                  Choose a recipe...
                </option>

                {recipes.map((recipe) => (
                  <option
                    key={recipe.id}
                    value={recipe.id}
                    disabled={meal.recipes.some(
                      (plannedRecipe) => plannedRecipe.id === recipe.id,
                    )}
                  >
                    {recipe.name}
                  </option>
                ))}
              </select>
            </label>

          </MealColumn>
        ))}
      </div>
    </main>
  );
}

export default App;

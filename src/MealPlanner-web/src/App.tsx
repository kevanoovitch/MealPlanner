import "./App.css";
import type { ReactNode } from "react";

import { recipes as mockRecipes, ingredients } from "./data/mockData";
import { calculateRecipeNutrition } from "./utils/nutrition";

import { useState } from "react";

type RecipeCardProps = {
  name: string;
  calories: number;
  protein: number;
};

function RecipeCard({ name, calories, protein }: RecipeCardProps) {
  return (
    <article>
      <h3>{name}</h3>
      <p>Calories: {calories.toFixed(0)} kcal</p>
      <p>Protein: {protein.toFixed(1)} g</p>
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
  { id: "Breakfast", title: "Breakfast", recipes: recipes },
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
  const toast = mockRecipes.find((recipe) => recipe.id === "cheese-toast");

  const [meals, setMeals] = useState(initialMeals);

  function addToastToLunch() {
    const toast = recipes.find((recipe) => recipe.id === "cheese-toast");

    if (!toast) {
      return;
    }

    setMeals((currentMeals) =>
      currentMeals.map((meal) => {
        if (meal.id !== "lunch") {
          return meal;
        }

        if (meal.recipes.some((recipe) => recipe.id === toast.id)) {
          return meal;
        }

        return {
          ...meal,
          recipes: [...meal.recipes, toast],
        };
      }),
    );
  }

  if (!toast) {
    throw new Error("Mock cheese-toast recipe is missing");
  }

  const dailyTotals = meals.reduce(
    (totals, meal) => {
      for (const recipe of meal.recipes) {
        totals.calories += recipe.calories;
        totals.protein += recipe.protein;
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
          id="protein-progress"
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

      <button onClick={addToastToLunch}>Add cheese toast to lunch</button>

      <div className="meal-grid">
        {meals.map((meal) => (
          <MealColumn key={meal.id} title={meal.title}>
            {meal.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                name={recipe.name}
                calories={recipe.calories}
                protein={recipe.protein}
              />
            ))}
          </MealColumn>
        ))}
      </div>
    </main>
  );
}

export default App;

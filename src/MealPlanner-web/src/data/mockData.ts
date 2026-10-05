

export type RecipeIngredient = {
  ingredientId: string
  amountGrams: number
}

export type Ingredient = {
  id: string
  name: string
  kcalPer100g: number
  proteinPer100g: number
  sugarPer100g: number
  fatPer100g: number
}

export type Recipe = {
  id: string
  name: string
  servings: number
  ingredients: RecipeIngredient[]
  instructions: string
  imageUrl?: string
}


export const recipes: Recipe[] = [
  {
    id: "cheese-toast",
    name: 'cheese toast',
    servings: 1,
    ingredients: [
      { ingredientId: 'bread', amountGrams: 80 },
      { ingredientId: 'cheese', amountGrams: 30 },
    ],
    instructions: 'Place cheese on the bread and toast until melted',
  },
  {
    id: 'bread-and-milk',
    name: 'Bread and milk',
    servings: 1,
    ingredients: [
      { ingredientId: 'bread', amountGrams: 60 },
      { ingredientId: 'milk', amountGrams: 200 },
    ],
    instructions: 'Serve the bread with a glass of milk'
  },
]

export const ingredients: Ingredient[] = [
  {
    id: 'bread',
    name: 'Bread',
    kcalPer100g: 250,
    proteinPer100g: 9,
    sugarPer100g: 5,
    fatPer100g: 3,
  },
  {
    id: 'cheese',
    name: 'cheese',
    kcalPer100g: 350,
    proteinPer100g: 25,
    sugarPer100g: 0,
    fatPer100g: 27,
  },
  {
    id: 'milk',
    name: 'Milk',
    kcalPer100g: 50,
    proteinPer100g: 3.5,
    sugarPer100g: 5,
    fatPer100g: 2,
  },
]

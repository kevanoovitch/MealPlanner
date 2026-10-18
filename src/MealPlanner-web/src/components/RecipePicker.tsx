import { useState } from 'react'

type RecipeOption = {
  id: string
  name: string
}

type RecipePickerProps = {
  recipes: RecipeOption[]
  selectedRecipeIds: string[]
  onAdd: (recipeId: string) => void
}

function RecipePicker({
  recipes,
  selectedRecipeIds,
  onAdd,
}: RecipePickerProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div
      className='recipe-picker'
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }}
    >

      <label>

        Search Recipes
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setIsOpen(true)
          }}
          onClick={() => setIsOpen(true)}
          placeholder="Search by name..."
        />
      </label>

      {isOpen && (
        <ul className='recipe-picker-results'>
          {filteredRecipes.map((recipe) => (
            <li key={recipe.id}>

              <button
                disabled={selectedRecipeIds.includes(recipe.id)}
                onClick={() => {
                  onAdd(recipe.id)
                  setSearch("")
                  setIsOpen(false)
                }
                }
              >
                Add {recipe.name}

              </button>
            </li>
          ))}

          {filteredRecipes.length === 0 && <li>No matching recipes.</li>}
        </ul>
      )}
    </div>
  )
}

export default RecipePicker

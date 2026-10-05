

type RecipeCardProps = {
  name: string;
  calories: number;
  protein: number;
  quantity: number;
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
  onViewDetails: () => void
};

function RecipeCard({ name, calories, protein, quantity, onDecrease, onIncrease, onRemove, onViewDetails }: RecipeCardProps) {
  return (
    <article className="recipe-card">
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
      <p>Calories: {(calories * quantity).toFixed(0)} kcal</p>
      <p>Protein: {(protein * quantity).toFixed(1)} g</p>
      <button onClick={onRemove}>Remove</button>
      <button onClick={onViewDetails}>View recipe</button>
    </article>
  );
}

export default RecipeCard

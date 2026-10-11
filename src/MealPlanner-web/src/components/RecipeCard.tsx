
import type { DragEventHandler } from "react"

type RecipeCardProps = {
  name: string;
  calories: number;
  protein: number;
  quantity: number;
  highlightCalories: boolean;
  dailyCalories: number;
  onRemove: () => void
  onIncrease: () => void
  onDecrease: () => void
  onViewDetails: () => void
  onDragStart: DragEventHandler<HTMLElement>
  onDragEnd: DragEventHandler<HTMLElement>
};

function RecipeCard({ name, calories, protein, quantity, dailyCalories, highlightCalories, onDecrease, onIncrease, onRemove, onViewDetails, onDragStart, onDragEnd }: RecipeCardProps) {

  const cardCalories = calories * quantity;
  const dailyShare =
    dailyCalories > 0 ? (cardCalories / dailyCalories) * 100 : 0

  return (
    <article
      className={
        highlightCalories
          ? 'recipe-card recipe-card-attention'
          : 'recipe-card'
      } draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
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
      <p>
        Calories: {cardCalories.toFixed(0)} kcal
        {' . '}
        {dailyShare.toFixed(0)}% of daily calories

      </p>
      {highlightCalories && (
        <p className="recipe-attention-label">
          Larget calorie contribution
        </p>
      )}
      <p>
        Protein: {(protein * quantity).toFixed(1)} g
      </p>
      <button onClick={onRemove}>Remove</button>
      <button onClick={onViewDetails}>View recipe</button>
    </article>
  );
}

export default RecipeCard

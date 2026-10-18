import type { DragEventHandler, ReactNode } from "react";


type MealColumnProps = {
  title: string;
  children?: ReactNode;
  color: string;
  canDrop: boolean;
  calories: number;
  protein: number;
  onDrop: DragEventHandler<HTMLElement>
};

function MealColumn({
  title,
  children,
  canDrop,
  onDrop,
  color,
  calories,
  protein,
}: MealColumnProps) {
  return (
    <section
      className={canDrop ? 'meal-column drop-target' : 'meal-column'}
      onDragOver={(event) => {
        if (canDrop) {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }
      }}
      onDrop={onDrop}
    >
      <h2 className="meal-heading">
        <span
          className="meal-color"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        {title}
      </h2>
      <p className="meal-subtotal">
        {calories.toFixed(0)} kcal
        {' . '}
        {protein.toFixed(1)} g protein
      </p>
      {children}
    </section>
  )
}

export default MealColumn



type NutritionBarProps = {
  label: string,
  unit: string,
  target: number
  segments: {
    id: string,
    title: string,
    color: string,
    value: number
  }[],
  mode: 'budget' | 'goal'

}

function NutritionBar({
  label,
  unit,
  target,
  segments,
  mode,
}: NutritionBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const scale = Math.max(target, total, 1)
  const overBudget = mode === 'budget' && total > target
  const goalReached = mode === 'goal' && total >= target

  return (
    <section className="nutrition-bar">
      <p>
        <strong>{label}</strong> : {total.toFixed(1)} / {target} {unit}
        {overBudget && (
          <span className="nutrition-over-budget"> - {(total - target).toFixed(1)} {unit} over budget</span>
        )}

        {goalReached && (
          <span className="nutrition-goal-reached"> - Goal reached</span>
        )}
      </p>
      <div className="nutrition-track" aria-hidden="true">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="nutrition-segment"
            style={{
              width: `${(segment.value / scale) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}

        <div
          className={
            overBudget
              ? 'nutrition-target nutrition-target-over'
              : 'nutrition-target'
          }
          style={{ left: `${(target / scale) * 100}%` }}
        />
      </div>

      <ul className="nutrition-legend">
        {segments.map((segment) => (
          <li key={segment.id}>
            <span
              className="nutrition-swatch"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            {segment.title}: {segment.value.toFixed(1)} {unit}
          </li>
        ))}
      </ul>
    </section >
  )
}

export default NutritionBar

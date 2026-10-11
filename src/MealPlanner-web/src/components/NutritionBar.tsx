
type NutritionBarProps = {
  label: string,
  unit: string,
  target: number
  segments: {
    id: string,
    title: string,
    color: string,
    value: number
  }[]
}

function NutritionBar({
  label,
  unit,
  target,
  segments,
}: NutritionBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const scale = Math.max(target, total, 1)
  const overTarget = total > target

  return (
    <section className="nutrition-bar">
      <p>
        <strong>{label}</strong> : {total.toFixed(1)} / {target} {unit} {overTarget && (
          <span> - {(total - target).toFixed(1)} {unit} over target</span>
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
            overTarget
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

import {
  buildSlicePath,
  computeToppingPositions,
} from '../utils/pizzaLayout'

// Circular pizza board. Each slice is a wedge (SVG <path>) of a circle.
// Selected slices get tomato+pepperoni; prefilled slices get herb dots.
// Topping positions are scattered within the slice using a seeded PRNG so
// they look organic but stay stable across re-renders.
function PizzaBoard({
  totalSlices = 4,
  selectedSlices = [],
  prefilledSlices = [],
  onSliceToggle,
}) {
  const isSelected = (index) => selectedSlices.includes(index)
  const isPrefilled = (index) => prefilledSlices.includes(index)

  const handleClick = (index) => {
    if (isPrefilled(index)) return
    if (typeof onSliceToggle === 'function') {
      onSliceToggle(index)
    }
  }

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick(index)
    }
  }

  const hasPrefilled = prefilledSlices.length > 0

  const size = 320
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 14
  const sliceAngle = 360 / totalSlices

  const pepperoniRadius = Math.max(7, Math.min(13, (r * sliceAngle) / 120))
  const herbRadius = Math.max(3, Math.min(5, (r * sliceAngle) / 220))

  // More pepperonis on bigger slices (2 slices → ~4, 8 slices → 2).
  const pepperoniCount = Math.max(2, Math.min(4, Math.round(sliceAngle / 50)))
  const herbCount = Math.max(3, Math.min(6, Math.round(sliceAngle / 30)))

  return (
    <div className="pizza-board">
      <svg
        className="pizza-board__svg"
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label="Pizza slices"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r + 6}
          className="pizza-board__crust"
        />

        {Array.from({ length: totalSlices }).map((_, index) => {
          const prefilled = isPrefilled(index)
          const selected = !prefilled && isSelected(index)

          let className = 'pizza-slice'
          if (prefilled) className += ' pizza-slice--prefilled'
          else if (selected) className += ' pizza-slice--selected'

          let label
          if (prefilled) label = `Slice ${index + 1} (already filled)`
          else if (selected) label = `Slice ${index + 1} (selected)`
          else label = `Slice ${index + 1}`

          const toppings = selected
            ? computeToppingPositions({
                cx,
                cy,
                r,
                index,
                totalSlices,
                toppingRadius: pepperoniRadius,
                count: pepperoniCount,
                seedSalt: 1,
                sizeJitter: 0.22,
              })
            : prefilled
            ? computeToppingPositions({
                cx,
                cy,
                r,
                index,
                totalSlices,
                toppingRadius: herbRadius,
                count: herbCount,
                seedSalt: 2,
                sizeJitter: 0.3,
                separationFactor: 1.6,
              })
            : []

          const toppingClass = selected
            ? 'pizza-topping pizza-topping--pepperoni'
            : 'pizza-topping pizza-topping--herb'

          return (
            <g key={index} className="pizza-slice-group">
              <path
                d={buildSlicePath(cx, cy, r, index, totalSlices)}
                className={className}
                onClick={() => handleClick(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                tabIndex={prefilled ? -1 : 0}
                role="button"
                aria-pressed={selected}
                aria-disabled={prefilled || undefined}
                aria-label={label}
              />
              {toppings.length > 0 && (
                <g pointerEvents="none" className="pizza-toppings">
                  {toppings.map((t, ti) => (
                    <circle
                      key={ti}
                      cx={t.x}
                      cy={t.y}
                      r={t.size}
                      className={toppingClass}
                    />
                  ))}
                </g>
              )}
            </g>
          )
        })}

        <circle
          cx={cx}
          cy={cy}
          r={2.5}
          className="pizza-board__center"
          pointerEvents="none"
        />
      </svg>

      <span className="pizza-board__status" role="status" aria-live="polite">
        {hasPrefilled
          ? `Prefilled: ${prefilledSlices.length} · Added: ${selectedSlices.length} / ${totalSlices}`
          : `Selected: ${selectedSlices.length} / ${totalSlices}`}
      </span>
    </div>
  )
}

export default PizzaBoard

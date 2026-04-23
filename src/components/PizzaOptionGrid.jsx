import {
  buildSlicePath,
  computeToppingPositions,
} from '../utils/pizzaLayout'

// Renders a row of selectable pizza option cards for `equivalent` questions.
// Each option shows a mini circular pizza with wedge slices + scattered
// pepperoni on the "filled" slices; the fraction label is intentionally
// hidden to keep the challenge visual rather than numeric.
function PizzaOptionGrid({ options = [], selectedOptionId, onOptionSelect }) {
  const handleSelect = (optionId) => {
    if (typeof onOptionSelect === 'function') {
      onOptionSelect(optionId)
    }
  }

  return (
    <div
      className="option-grid"
      role="radiogroup"
      aria-label="Pizza options"
    >
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id
        const className =
          'option-card' + (isSelected ? ' option-card--selected' : '')

        return (
          <button
            key={option.id}
            type="button"
            className={className}
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(option.id)}
          >
            <MiniPizza
              numerator={option.numerator}
              denominator={option.denominator}
            />
          </button>
        )
      })}
    </div>
  )
}

function MiniPizza({ numerator, denominator }) {
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6
  const sliceAngle = 360 / denominator

  const pepperoniRadius = Math.max(3, Math.min(6, (r * sliceAngle) / 160))
  const pepperoniCount = Math.max(2, Math.min(4, Math.round(sliceAngle / 50)))

  return (
    <svg
      className="mini-pizza"
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={r + 3} className="pizza-board__crust" />
      {Array.from({ length: denominator }).map((_, index) => {
        const filled = index < numerator
        const cls =
          'pizza-slice pizza-slice--mini' +
          (filled ? ' pizza-slice--selected' : '')

        const toppings = filled
          ? computeToppingPositions({
              cx,
              cy,
              r,
              index,
              totalSlices: denominator,
              toppingRadius: pepperoniRadius,
              count: pepperoniCount,
              seedSalt: 1,
              sizeJitter: 0.25,
              innerMargin: 3,
              outerMargin: 3,
            })
          : []

        return (
          <g key={index}>
            <path d={buildSlicePath(cx, cy, r, index, denominator)} className={cls} />
            {toppings.map((t, ti) => (
              <circle
                key={ti}
                cx={t.x}
                cy={t.y}
                r={t.size}
                className="pizza-topping pizza-topping--pepperoni"
              />
            ))}
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={1.5} className="pizza-board__center" />
    </svg>
  )
}

export default PizzaOptionGrid

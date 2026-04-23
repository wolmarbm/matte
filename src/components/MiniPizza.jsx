import {
  buildSlicePath,
  computeToppingPositions,
} from '../utils/pizzaLayout'

// Small, non-interactive circular pizza used for showing an addend or an
// option preview. Slices 0..numerator-1 are rendered as "filled" (pepperoni);
// the rest stay dough-colored. Size can be overridden for tighter layouts.
function MiniPizza({ numerator, denominator, size = 120 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 6
  const sliceAngle = 360 / denominator

  const pepperoniRadius = Math.max(3, Math.min(6, (r * sliceAngle) / 160))
  const pepperoniCount = Math.max(2, Math.min(4, Math.round(sliceAngle / 50)))

  return (
    <svg
      className="mini-pizza"
      style={{ width: size, height: size }}
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

export default MiniPizza

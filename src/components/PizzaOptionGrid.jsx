import MiniPizza from './MiniPizza'

// Renders a row of selectable pizza option cards.
// Each option shows a mini circular pizza with wedge slices + scattered
// pepperoni on the "filled" slices. For `equivalent` questions the fraction
// label is intentionally hidden to keep the challenge visual; for `compare`
// questions the option's `label` is shown so students can match the prompt's
// named fractions/decimals to the visuals.
//
// When `hideVisuals` is true, the mini pizza is omitted entirely and the card
// shows only a large centered label. This is used for harder compare
// questions that mix decimals and fractions, forcing students to reason
// numerically rather than rely on the visual.
function PizzaOptionGrid({
  options = [],
  selectedOptionId,
  onOptionSelect,
  hideVisuals = false,
}) {
  const handleSelect = (optionId) => {
    if (typeof onOptionSelect === 'function') {
      onOptionSelect(optionId)
    }
  }

  const gridClassName = 'option-grid' + (hideVisuals ? ' option-grid--text' : '')

  return (
    <div
      className={gridClassName}
      role="radiogroup"
      aria-label="Pizza options"
    >
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id
        const className =
          'option-card' +
          (hideVisuals ? ' option-card--text' : '') +
          (isSelected ? ' option-card--selected' : '')

        return (
          <button
            key={option.id}
            type="button"
            className={className}
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(option.id)}
          >
            {hideVisuals ? null : (
              <MiniPizza
                numerator={option.numerator}
                denominator={option.denominator}
              />
            )}
            {option.label ? (
              <span
                className={
                  'option-card__label' +
                  (hideVisuals ? ' option-card__label--large' : '')
                }
              >
                {option.label}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export default PizzaOptionGrid

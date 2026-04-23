// Renders a row of selectable pizza option cards for `equivalent` questions.
// Each option shows a mini pizza visual; the fraction label is intentionally
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
            <div
              className="option-card__pizza"
              style={{
                gridTemplateColumns: `repeat(${Math.min(
                  option.denominator,
                  4
                )}, 1fr)`,
              }}
            >
              {Array.from({ length: option.denominator }).map((_, index) => {
                const filled = index < option.numerator
                const miniClass =
                  'slice slice--mini' + (filled ? ' slice--selected' : '')
                return <span key={index} className={miniClass} aria-hidden="true" />
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PizzaOptionGrid

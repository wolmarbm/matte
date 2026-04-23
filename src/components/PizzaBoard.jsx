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

  const hasPrefilled = prefilledSlices.length > 0

  return (
    <div className="pizza-board">
      <div className="pizza-board__slices">
        {Array.from({ length: totalSlices }).map((_, index) => {
          const prefilled = isPrefilled(index)
          const selected = !prefilled && isSelected(index)

          let className = 'slice'
          if (prefilled) className += ' slice--prefilled'
          else if (selected) className += ' slice--selected'

          return (
            <button
              key={index}
              type="button"
              className={className}
              onClick={() => handleClick(index)}
              aria-pressed={selected}
              aria-disabled={prefilled || undefined}
              disabled={prefilled}
              aria-label={
                prefilled
                  ? `Slice ${index + 1} (already filled)`
                  : `Slice ${index + 1}`
              }
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <p className="pizza-board__status">
        {hasPrefilled
          ? `Prefilled: ${prefilledSlices.length} · Added: ${selectedSlices.length} / ${totalSlices}`
          : `Selected: ${selectedSlices.length} / ${totalSlices}`}
      </p>
    </div>
  )
}

export default PizzaBoard

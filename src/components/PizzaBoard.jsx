function PizzaBoard({ totalSlices = 4, selectedSlices = [], onSliceToggle }) {
  const isSelected = (index) => selectedSlices.includes(index)

  const handleClick = (index) => {
    if (typeof onSliceToggle === 'function') {
      onSliceToggle(index)
    }
  }

  return (
    <div className="pizza-board">
      <div className="pizza-board__slices">
        {Array.from({ length: totalSlices }).map((_, index) => {
          const selected = isSelected(index)
          return (
            <button
              key={index}
              type="button"
              className={'slice' + (selected ? ' slice--selected' : '')}
              onClick={() => handleClick(index)}
              aria-pressed={selected}
              aria-label={`Slice ${index + 1}`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <p className="pizza-board__status">
        Selected: {selectedSlices.length} / {totalSlices}
      </p>
    </div>
  )
}

export default PizzaBoard

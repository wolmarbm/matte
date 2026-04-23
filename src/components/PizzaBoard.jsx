import { useState } from 'react'

function PizzaBoard({ totalSlices = 4, onChange }) {
  const [selected, setSelected] = useState(
    () => Array(totalSlices).fill(false)
  )

  const toggleSlice = (index) => {
    const next = selected.map((isSelected, i) =>
      i === index ? !isSelected : isSelected
    )
    setSelected(next)

    if (typeof onChange === 'function') {
      const selectedIndices = next
        .map((isSelected, i) => (isSelected ? i : -1))
        .filter((i) => i !== -1)
      const selectedCount = selectedIndices.length
      onChange({ selectedCount, selectedIndices })
    }
  }

  const selectedCount = selected.filter(Boolean).length

  return (
    <div className="pizza-board">
      <div className="pizza-board__slices">
        {selected.map((isSelected, index) => (
          <button
            key={index}
            type="button"
            className={
              'slice' + (isSelected ? ' slice--selected' : '')
            }
            onClick={() => toggleSlice(index)}
            aria-pressed={isSelected}
            aria-label={`Slice ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <p className="pizza-board__status">
        Selected: {selectedCount} / {totalSlices}
      </p>
    </div>
  )
}

export default PizzaBoard

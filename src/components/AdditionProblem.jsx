import { Fragment } from 'react'
import MiniPizza from './MiniPizza'

// Visual display of a fraction addition problem: two non-interactive addend
// pizzas joined by a "+" sign, followed by an "=" sign and a "?" placeholder.
// The student uses the separate build PizzaBoard below this to construct the
// answer. All addends must share the same denominator (same-denominator
// addition is the only concept we teach at this stage).
function AdditionProblem({ addends = [] }) {
  if (!Array.isArray(addends) || addends.length === 0) return null

  return (
    <div
      className="addition-problem"
      role="img"
      aria-label={
        addends.map((a) => `${a.numerator}/${a.denominator}`).join(' plus ') +
        ' equals question mark'
      }
    >
      {addends.map((addend, index) => (
        <Fragment key={index}>
          <div className="addition-problem__term">
            <MiniPizza
              numerator={addend.numerator}
              denominator={addend.denominator}
              size={96}
            />
            <span className="addition-problem__label">
              {addend.numerator}/{addend.denominator}
            </span>
          </div>
          {index < addends.length - 1 && (
            <span className="addition-problem__op" aria-hidden="true">
              +
            </span>
          )}
        </Fragment>
      ))}
      <span className="addition-problem__op" aria-hidden="true">
        =
      </span>
      <span className="addition-problem__question" aria-hidden="true">
        ?
      </span>
    </div>
  )
}

export default AdditionProblem

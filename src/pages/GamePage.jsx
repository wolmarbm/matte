import { useState } from 'react'
import { Link } from 'react-router-dom'
import PizzaBoard from '../components/PizzaBoard'

const QUESTION = {
  prompt: 'Build 3/4 of a pizza',
  targetNumerator: 3,
  targetDenominator: 4,
}

const HINT_TEXT =
  'Hint: 3/4 means 3 selected slices out of 4 total slices.'

function GamePage() {
  const [selectedSlices, setSelectedSlices] = useState([])
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const totalSlices = QUESTION.targetDenominator

  const handleSliceToggle = (index) => {
    setSelectedSlices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  const handleCheckAnswer = () => {
    const selectedCount = selectedSlices.length
    setAttempts((prev) => prev + 1)
    if (selectedCount === QUESTION.targetNumerator) {
      setIsCorrect(true)
      setFeedback(
        `Correct — ${QUESTION.targetNumerator} out of ${QUESTION.targetDenominator} slices means ${QUESTION.targetNumerator}/${QUESTION.targetDenominator}.`
      )
    } else {
      setIsCorrect(false)
      setFeedback(
        `Not quite. You selected ${selectedCount} out of ${QUESTION.targetDenominator} slices.`
      )
    }
  }

  const handleHint = () => {
    setShowHint(true)
    setHintUsed(true)
  }

  const handleReset = () => {
    setSelectedSlices([])
    setFeedback('')
    setIsCorrect(null)
  }

  return (
    <main className="page">
      <h1 className="page__title">Student Game</h1>
      <p className="page__subtitle">{QUESTION.prompt}</p>

      <PizzaBoard
        totalSlices={totalSlices}
        selectedSlices={selectedSlices}
        onSliceToggle={handleSliceToggle}
      />

      <p className="attempts" style={{ marginTop: 12 }}>
        Attempts: {attempts}
      </p>

      <div className="actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleCheckAnswer}
        >
          Check Answer
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleHint}
        >
          Hint
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      {feedback && (
        <p
          className="feedback"
          style={{
            marginTop: 16,
            fontWeight: 600,
            color: isCorrect ? 'green' : 'crimson',
          }}
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}

      {isCorrect === true && (
        <p
          className="success-note"
          style={{ marginTop: 8, color: 'green' }}
        >
          Nice job — you got it.
        </p>
      )}

      {showHint && (
        <p
          className="hint"
          style={{ marginTop: 12, fontStyle: 'italic' }}
        >
          {HINT_TEXT}
        </p>
      )}

      {hintUsed && !showHint && (
        <p className="hint-used" style={{ marginTop: 8, fontSize: 12 }}>
          Hint used.
        </p>
      )}

      <div className="actions" style={{ marginTop: 16 }}>
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
        <Link to="/results" className="btn btn--primary">
          See Results
        </Link>
      </div>
    </main>
  )
}

export default GamePage

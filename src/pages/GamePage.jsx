import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PizzaBoard from '../components/PizzaBoard'
import { QUESTIONS } from '../data/questions'
import { computeAccuracy } from '../utils/scoring'
import { loadStudentName, saveSession } from '../utils/storage'

function GamePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const studentName =
    (location.state && location.state.studentName) ||
    loadStudentName() ||
    'Student'

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)

  const [selectedSlices, setSelectedSlices] = useState([])
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // One entry per question id — overwrites prevent duplicate results
  const resultsRef = useRef({})

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const totalSlices = currentQuestion.denominator
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1
  const hintText = `Hint: ${currentQuestion.numerator}/${currentQuestion.denominator} means ${currentQuestion.numerator} selected slices out of ${currentQuestion.denominator} total slices.`

  const resetQuestionState = () => {
    setSelectedSlices([])
    setFeedback('')
    setIsCorrect(null)
    setAttempts(0)
    setHintUsed(false)
    setShowHint(false)
  }

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

    const correct = selectedCount === currentQuestion.numerator

    if (correct && isCorrect !== true) {
      setScore((prev) => prev + 1)
    }

    if (correct) {
      setFeedback(
        `Correct — ${currentQuestion.numerator} out of ${currentQuestion.denominator} slices means ${currentQuestion.numerator}/${currentQuestion.denominator}.`
      )
    } else {
      setFeedback(
        `Not quite. You selected ${selectedCount} out of ${currentQuestion.denominator} slices.`
      )
    }
    setIsCorrect(correct)
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

  const finalizeCurrentQuestionResult = () => {
    // attempts state reflects the most recent check; we add 1 here isn't needed
    // because state was updated via setAttempts already on each check.
    const attemptsCount = attempts
    const result = {
      id: currentQuestion.id,
      prompt: currentQuestion.prompt,
      targetFraction: `${currentQuestion.numerator}/${currentQuestion.denominator}`,
      selectedFraction: `${selectedSlices.length}/${currentQuestion.denominator}`,
      correct: isCorrect === true,
      attempts: attemptsCount,
      hintUsed,
      conceptTag: currentQuestion.conceptTag,
    }
    resultsRef.current[currentQuestion.id] = result
  }

  const buildSession = () => {
    const orderedQuestions = QUESTIONS.map((q) => resultsRef.current[q.id]).filter(
      Boolean
    )
    const finalScore = orderedQuestions.filter((r) => r.correct).length
    const totalQuestions = QUESTIONS.length
    const accuracy = computeAccuracy(orderedQuestions)

    return {
      studentName,
      playedAt: new Date().toISOString(),
      score: finalScore,
      totalQuestions,
      accuracy,
      questions: orderedQuestions,
    }
  }

  const finishGameAndSave = () => {
    finalizeCurrentQuestionResult()
    const session = buildSession()
    saveSession(session)
    navigate('/results', { state: { session } })
  }

  const handleNextQuestion = () => {
    finalizeCurrentQuestionResult()
    if (isLastQuestion) {
      finishGameAndSave()
      return
    }
    resetQuestionState()
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  return (
    <main className="page">
      <h1 className="page__title">Student Game</h1>

      <p className="progress" style={{ marginTop: 4, opacity: 0.8 }}>
        Question {currentQuestionIndex + 1} of {QUESTIONS.length}
      </p>

      <p className="page__subtitle">{currentQuestion.prompt}</p>

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
          {hintText}
        </p>
      )}

      {hintUsed && !showHint && (
        <p className="hint-used" style={{ marginTop: 8, fontSize: 12 }}>
          Hint used.
        </p>
      )}

      {feedback && (
        <div className="actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleNextQuestion}
          >
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </button>
        </div>
      )}

      <div className="actions" style={{ marginTop: 16 }}>
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default GamePage

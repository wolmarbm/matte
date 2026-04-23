import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer'
import PizzaBoard from '../components/PizzaBoard'
import PizzaOptionGrid from '../components/PizzaOptionGrid'
import { QUESTIONS } from '../data/questions'
import { computeAccuracy } from '../utils/scoring'
import { loadStudentName, saveSession } from '../utils/storage'

const MAX_ATTEMPTS = 3

function GamePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const studentName =
    (location.state && location.state.studentName) ||
    loadStudentName() ||
    'Student'

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const [selectedSlices, setSelectedSlices] = useState([])
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const outOfAttempts = wrongAttempts >= MAX_ATTEMPTS && isCorrect !== true

  // One entry per question id — overwrites prevent duplicate results
  const resultsRef = useRef({})

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const questionType = currentQuestion.type || 'build'
  const prefilledSlices =
    questionType === 'complete' ? currentQuestion.prefilledSlices || [] : []
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1

  const progressPct = Math.round(
    ((currentQuestionIndex + 1) / QUESTIONS.length) * 100,
  )

  const getHintText = () => {
    if (questionType === 'complete') {
      return 'Hint: Think about how many more slices are needed to make 1 whole pizza.'
    }
    if (questionType === 'equivalent') {
      return 'Hint: Look for pizzas that show the same amount, even if they are divided into different numbers of slices.'
    }
    return `Hint: ${currentQuestion.numerator}/${currentQuestion.denominator} means ${currentQuestion.numerator} selected slices out of ${currentQuestion.denominator} total slices.`
  }

  const getSelectedOption = () => {
    if (questionType !== 'equivalent') return null
    if (!selectedOptionId) return null
    const options = currentQuestion.options || []
    return options.find((o) => o.id === selectedOptionId) || null
  }

  const getTargetFraction = () => {
    if (questionType === 'equivalent') {
      return currentQuestion.targetFraction || ''
    }
    return `${currentQuestion.numerator}/${currentQuestion.denominator}`
  }

  const getSelectedFraction = () => {
    if (questionType === 'equivalent') {
      const opt = getSelectedOption()
      if (!opt) return '—'
      return `${opt.numerator}/${opt.denominator}`
    }
    return `${selectedSlices.length}/${currentQuestion.denominator}`
  }

  const resetQuestionState = () => {
    setSelectedSlices([])
    setSelectedOptionId(null)
    setFeedback('')
    setIsCorrect(null)
    setAttempts(0)
    setWrongAttempts(0)
    setHintUsed(false)
    setShowHint(false)
  }

  const handleSliceToggle = (index) => {
    // Defense in depth: never toggle a prefilled slice
    if (prefilledSlices.includes(index)) return
    setSelectedSlices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  const computeCorrect = () => {
    if (questionType === 'equivalent') {
      const opt = getSelectedOption()
      return !!(opt && opt.isCorrect)
    }
    // build + complete both check that the student-added slice count
    // matches the question's numerator (for complete, numerator = missing count).
    return selectedSlices.length === currentQuestion.numerator
  }

  const buildFeedback = (correct, nextWrongAttempts) => {
    if (!correct && nextWrongAttempts >= MAX_ATTEMPTS) {
      if (questionType === 'equivalent') {
        return 'Out of attempts. No worries — tap Next Question to keep going.'
      }
      if (questionType === 'complete') {
        return `Out of attempts. The pizza needed ${currentQuestion.numerator} more slice(s) to be whole. Tap Next Question to keep going.`
      }
      return `Out of attempts. The answer was ${currentQuestion.numerator}/${currentQuestion.denominator}. Tap Next Question to keep going.`
    }

    if (questionType === 'equivalent') {
      if (correct) {
        return `Correct — that pizza shows the same amount as ${currentQuestion.targetFraction}.`
      }
      if (!selectedOptionId) {
        return 'Pick an option before checking.'
      }
      return 'Not quite. Try another option.'
    }

    if (questionType === 'complete') {
      if (correct) {
        return `Correct — you added ${currentQuestion.numerator}/${currentQuestion.denominator} to complete the whole pizza.`
      }
      return `Not quite. You added ${selectedSlices.length} slice(s); the pizza needs ${currentQuestion.numerator} more to be whole.`
    }

    // build
    if (correct) {
      return `Correct — ${currentQuestion.numerator} out of ${currentQuestion.denominator} slices means ${currentQuestion.numerator}/${currentQuestion.denominator}.`
    }
    return `Not quite. You selected ${selectedSlices.length} out of ${currentQuestion.denominator} slices.`
  }

  const handleCheckAnswer = () => {
    if (outOfAttempts || isCorrect === true) return

    const correct = computeCorrect()
    const nextWrongAttempts = correct ? wrongAttempts : wrongAttempts + 1

    setAttempts((prev) => prev + 1)
    if (!correct) setWrongAttempts(nextWrongAttempts)

    setFeedback(buildFeedback(correct, nextWrongAttempts))
    setIsCorrect(correct)
  }

  const handleHint = () => {
    setShowHint(true)
    setHintUsed(true)
  }

  const handleReset = () => {
    setSelectedSlices([])
    setSelectedOptionId(null)
    setFeedback('')
    setIsCorrect(null)
  }

  const finalizeCurrentQuestionResult = () => {
    const attemptsCount = attempts
    const result = {
      id: currentQuestion.id,
      type: questionType,
      prompt: currentQuestion.prompt,
      targetFraction: getTargetFraction(),
      selectedFraction: getSelectedFraction(),
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
    <PageContainer variant="student">
      <h1 className="page__title">Student Game</h1>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={QUESTIONS.length}
        aria-valuenow={currentQuestionIndex + 1}
        aria-label={`Question ${currentQuestionIndex + 1} of ${QUESTIONS.length}`}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="progress-bar__label">
        Question {currentQuestionIndex + 1} of {QUESTIONS.length}
      </p>

      <p className="page__subtitle">{currentQuestion.prompt}</p>

      {questionType === 'equivalent' ? (
        <PizzaOptionGrid
          options={currentQuestion.options || []}
          selectedOptionId={selectedOptionId}
          onOptionSelect={setSelectedOptionId}
        />
      ) : (
        <PizzaBoard
          totalSlices={currentQuestion.denominator}
          selectedSlices={selectedSlices}
          prefilledSlices={prefilledSlices}
          onSliceToggle={handleSliceToggle}
        />
      )}

      <div
        className="attempt-tracker"
        role="group"
        aria-label={`Attempts remaining: ${Math.max(0, MAX_ATTEMPTS - wrongAttempts)} of ${MAX_ATTEMPTS}`}
      >
        <span className="attempt-tracker__label">Lives</span>
        <div className="attempt-tracker__crosses">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
            const filled = i < wrongAttempts
            return (
              <span
                key={i}
                className={
                  'attempt-cross' + (filled ? ' attempt-cross--filled' : '')
                }
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="attempt-cross__icon">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </span>
            )
          })}
        </div>
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleCheckAnswer}
          disabled={outOfAttempts || isCorrect === true}
        >
          Check Answer
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleHint}
          disabled={outOfAttempts}
        >
          Hint
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleReset}
          disabled={outOfAttempts}
        >
          Reset
        </button>
      </div>

      {feedback && (
        <p
          className={
            'feedback ' +
            (isCorrect ? 'feedback--correct' : 'feedback--incorrect')
          }
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}

      {showHint && <p className="hint">{getHintText()}</p>}

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
    </PageContainer>
  )
}

export default GamePage

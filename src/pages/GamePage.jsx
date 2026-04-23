import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer'
import AdditionProblem from '../components/AdditionProblem'
import PizzaBoard from '../components/PizzaBoard'
import PizzaOptionGrid from '../components/PizzaOptionGrid'
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

  const [selectedSlices, setSelectedSlices] = useState([])
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [incorrectAttempts, setIncorrectAttempts] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [showHint, setShowHint] = useState(false)

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

  const usesOptions =
    questionType === 'equivalent' ||
    questionType === 'compare' ||
    (questionType === 'add' && currentQuestion.hideVisuals === true)

  const getHintText = () => {
    if (questionType === 'complete') {
      const goal = currentQuestion.targetFraction || '1 whole'
      return `Hint: Count the slices already filled, then add only as many more as you need to reach ${goal}.`
    }
    if (questionType === 'equivalent') {
      return 'Hint: Look for pizzas that show the same amount, even if they are divided into different numbers of slices. Remember 1/2 = 0.5, 1/4 = 0.25, 3/4 = 0.75.'
    }
    if (questionType === 'compare') {
      const target = currentQuestion.comparison === 'smaller' ? 'smaller' : 'larger'
      return `Hint: Compare the total amount covered by each pizza — not the number of slices — to find the ${target} fraction. Remember 1/2 = 0.5, 1/4 = 0.25, 3/4 = 0.75.`
    }
    if (questionType === 'add') {
      const addends = Array.isArray(currentQuestion.addends)
        ? currentQuestion.addends
        : []
      const denominator = currentQuestion.denominator
      const nums = addends.map((a) => a.numerator).join(' + ')
      const sum = addends.reduce((acc, a) => acc + (Number(a.numerator) || 0), 0)
      return `Hint: When the denominators are the same, add only the top numbers and keep the bottom number the same. ${nums} = ${sum}, so the answer is ${sum}/${denominator}.`
    }
    return `Hint: ${currentQuestion.numerator}/${currentQuestion.denominator} means ${currentQuestion.numerator} selected slices out of ${currentQuestion.denominator} total slices.`
  }

  const getSelectedOption = () => {
    if (!usesOptions) return null
    if (!selectedOptionId) return null
    const options = currentQuestion.options || []
    return options.find((o) => o.id === selectedOptionId) || null
  }

  const getCorrectOption = () => {
    if (!usesOptions) return null
    const options = currentQuestion.options || []
    return options.find((o) => o.isCorrect) || null
  }

  const getOptionLabel = (opt) => {
    if (!opt) return '—'
    if (opt.label) return opt.label
    return `${opt.numerator}/${opt.denominator}`
  }

  const getTargetFraction = () => {
    if (questionType === 'equivalent') {
      return currentQuestion.targetFraction || ''
    }
    if (questionType === 'compare') {
      const correct = getCorrectOption()
      const target = currentQuestion.comparison === 'smaller' ? 'smaller' : 'larger'
      return correct ? `${getOptionLabel(correct)} (${target})` : target
    }
    if (questionType === 'complete') {
      return currentQuestion.targetFraction || '1 whole'
    }
    // build + add both use `numerator`/`denominator` as the expected answer
    return `${currentQuestion.numerator}/${currentQuestion.denominator}`
  }

  const getSelectedFraction = () => {
    if (usesOptions) {
      return getOptionLabel(getSelectedOption())
    }
    if (questionType === 'complete') {
      // Show the final pizza amount (prefilled + added), since that's what
      // the student is building toward in a "complete" question.
      const total = selectedSlices.length + prefilledSlices.length
      return `${total}/${currentQuestion.denominator}`
    }
    return `${selectedSlices.length}/${currentQuestion.denominator}`
  }

  const resetQuestionState = () => {
    setSelectedSlices([])
    setSelectedOptionId(null)
    setFeedback('')
    setIsCorrect(null)
    setAttempts(0)
    setIncorrectAttempts(0)
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
    if (usesOptions) {
      const opt = getSelectedOption()
      return !!(opt && opt.isCorrect)
    }
    // build + complete both check that the student-added slice count
    // matches the question's numerator (for complete, numerator = missing count).
    return selectedSlices.length === currentQuestion.numerator
  }

  const buildFeedback = (correct) => {
    if (questionType === 'equivalent') {
      if (correct) {
        return `Correct — that pizza shows the same amount as ${currentQuestion.targetFraction}.`
      }
      if (!selectedOptionId) {
        return 'Pick an option before checking.'
      }
      return 'Not quite. Try another option.'
    }

    if (questionType === 'compare') {
      const correctOpt = getCorrectOption()
      const target = currentQuestion.comparison === 'smaller' ? 'smaller' : 'larger'
      if (correct) {
        return correctOpt
          ? `Correct — ${getOptionLabel(correctOpt)} is the ${target} one.`
          : `Correct — that is the ${target} one.`
      }
      if (!selectedOptionId) {
        return 'Pick an option before checking.'
      }
      return 'Not quite. Try the other option.'
    }

    if (questionType === 'complete') {
      const goal = currentQuestion.targetFraction || '1 whole'
      if (correct) {
        return `Correct — you added ${currentQuestion.numerator}/${currentQuestion.denominator} to build ${goal}.`
      }
      return `Not quite. You added ${selectedSlices.length} slice(s); the pizza needs ${currentQuestion.numerator} more to reach ${goal}.`
    }

    if (questionType === 'add') {
      const answer = `${currentQuestion.numerator}/${currentQuestion.denominator}`
      const addends = Array.isArray(currentQuestion.addends)
        ? currentQuestion.addends
        : []
      const expression = addends
        .map((a) => `${a.numerator}/${a.denominator}`)
        .join(' + ')
      if (correct) {
        return `Correct — ${expression} = ${answer}.`
      }
      if (currentQuestion.hideVisuals === true && !selectedOptionId) {
        return 'Pick an option before checking.'
      }
      return `Not quite. Remember: with the same denominator, add the top numbers and keep the bottom number. ${expression} = ${answer}.`
    }

    // build
    if (correct) {
      return `Correct — ${currentQuestion.numerator} out of ${currentQuestion.denominator} slices means ${currentQuestion.numerator}/${currentQuestion.denominator}.`
    }
    return `Not quite. You selected ${selectedSlices.length} out of ${currentQuestion.denominator} slices.`
  }

  const handleCheckAnswer = () => {
    if (isCorrect === true) return

    const correct = computeCorrect()

    setAttempts((prev) => prev + 1)
    if (!correct) setIncorrectAttempts((prev) => prev + 1)

    setFeedback(buildFeedback(correct))
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
    const gotCorrect = isCorrect === true
    const correctAttempts = gotCorrect ? 1 : 0
    const result = {
      id: currentQuestion.id,
      type: questionType,
      prompt: currentQuestion.prompt,
      targetFraction: getTargetFraction(),
      selectedFraction: getSelectedFraction(),
      correct: gotCorrect,
      attempts,
      correctAttempts,
      incorrectAttempts,
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

      {usesOptions ? (
        <PizzaOptionGrid
          options={currentQuestion.options || []}
          selectedOptionId={selectedOptionId}
          onOptionSelect={setSelectedOptionId}
          hideVisuals={currentQuestion.hideVisuals === true}
        />
      ) : (
        <>
          {questionType === 'add' && (
            <AdditionProblem addends={currentQuestion.addends || []} />
          )}
          <PizzaBoard
            totalSlices={currentQuestion.denominator}
            selectedSlices={selectedSlices}
            prefilledSlices={prefilledSlices}
            onSliceToggle={handleSliceToggle}
            hideTotal={questionType === 'build'}
          />
        </>
      )}

      <div
        className="attempt-counter"
        role="status"
        aria-live="polite"
        aria-label={`Attempts so far: ${attempts}. Incorrect attempts: ${incorrectAttempts}.`}
      >
        <span className="attempt-counter__item">
          <span className="attempt-counter__label">Attempts</span>
          <span className="attempt-counter__value">{attempts}</span>
        </span>
        <span className="attempt-counter__item attempt-counter__item--incorrect">
          <span className="attempt-counter__label">Incorrect</span>
          <span className="attempt-counter__value">{incorrectAttempts}</span>
        </span>
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleCheckAnswer}
          disabled={isCorrect === true}
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

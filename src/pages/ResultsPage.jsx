import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer'
import SummaryCard from '../components/ui/SummaryCard'
import SectionCard from '../components/ui/SectionCard'
import { getConceptLabel } from '../utils/analytics'
import { getSessionAccuracy } from '../utils/scoring'
import { loadLatestSession } from '../utils/storage'

function formatPlayedAt(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function getEncouragement(accuracy) {
  if (!Number.isFinite(accuracy)) return 'Nice work — keep practicing fractions.'
  if (accuracy >= 80) return 'Great job! You really know your fractions.'
  if (accuracy >= 50) return 'Nice work — keep practicing fractions.'
  return "Keep going — you'll get it with a little more practice."
}

function ResultsPage() {
  const location = useLocation()
  const session = useMemo(() => {
    return (location.state && location.state.session) || loadLatestSession()
  }, [location.state])

  if (!session) {
    return (
      <PageContainer variant="student">
        <h1 className="page__title">Session Results</h1>
        <p className="page__subtitle">
          No completed sessions yet. Play a round to see your results here.
        </p>
        <div className="actions">
          <Link to="/" className="btn btn--secondary">
            Back to Home
          </Link>
          <Link to="/play" className="btn btn--primary">
            Play Now
          </Link>
        </div>
      </PageContainer>
    )
  }

  const {
    studentName,
    playedAt,
    score,
    totalQuestions,
    questions = [],
  } = session
  const accuracy = getSessionAccuracy(session)

  return (
    <PageContainer variant="student">
      <h1 className="page__title">Session Results</h1>
      <p className="page__subtitle">Here is how you did this round.</p>

      <section className="summary-grid" aria-label="Session summary">
        <SummaryCard label="Student" value={studentName || 'Student'} />
        <SummaryCard
          label="Score"
          value={`${score} / ${totalQuestions}`}
          hint={`${totalQuestions} question${totalQuestions === 1 ? '' : 's'} total`}
        />
        <SummaryCard label="Accuracy" value={`${accuracy}%`} />
        <SummaryCard label="Played" value={formatPlayedAt(playedAt)} />
      </section>

      <p className="encouragement">{getEncouragement(accuracy)}</p>

      <SectionCard title="Question breakdown" ariaLabel="Question breakdown">
        {questions.length === 0 ? (
          <p>No question details available.</p>
        ) : (
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {questions.map((q, index) => (
              <li
                key={q.id || index}
                className="question-card"
                style={{ listStylePosition: 'inside' }}
              >
                <p className="question-card__prompt">{q.prompt}</p>
                <div className="badge-row">
                  <span
                    className={
                      'badge ' +
                      (q.correct ? 'badge--correct' : 'badge--incorrect')
                    }
                  >
                    {q.correct ? 'Correct' : 'Incorrect'}
                  </span>
                  {q.conceptTag ? (
                    <span className="badge badge--concept">
                      {getConceptLabel(q.conceptTag)}
                    </span>
                  ) : null}
                </div>
                <p className="question-card__row">
                  Target: <strong>{q.targetFraction}</strong>
                </p>
                <p className="question-card__row">
                  Your answer: <strong>{q.selectedFraction}</strong>
                </p>
                <p className="question-card__meta">
                  Attempts: {q.attempts ?? 0} · Incorrect:{' '}
                  {q.incorrectAttempts ??
                    Math.max(0, (q.attempts ?? 0) - (q.correct ? 1 : 0))}{' '}
                  · Hint used: {q.hintUsed ? 'Yes' : 'No'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <div className="actions">
        <Link to="/play" className="btn btn--primary">
          Play Again
        </Link>
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
      </div>
    </PageContainer>
  )
}

export default ResultsPage

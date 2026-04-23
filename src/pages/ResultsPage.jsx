import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

function ResultsPage() {
  const location = useLocation()
  const session = useMemo(() => {
    return (location.state && location.state.session) || loadLatestSession()
  }, [location.state])

  if (!session) {
    return (
      <main className="page">
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
      </main>
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
    <main className="page">
      <h1 className="page__title">Session Results</h1>

      <section
        className="summary-card"
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
        aria-label="Student summary"
      >
        <h2 style={{ marginTop: 0 }}>{studentName || 'Student'}</h2>
        <p style={{ margin: '4px 0', opacity: 0.8 }}>
          Played: {formatPlayedAt(playedAt)}
        </p>
        <p style={{ margin: '4px 0', fontWeight: 600 }}>
          Score: {score} / {totalQuestions}
        </p>
        <p style={{ margin: '4px 0' }}>Accuracy: {accuracy}%</p>
      </section>

      <section
        className="breakdown"
        style={{ marginTop: 24 }}
        aria-label="Question breakdown"
      >
        <h2>Question breakdown</h2>
        {questions.length === 0 ? (
          <p>No question details available.</p>
        ) : (
          <ol style={{ paddingLeft: 20 }}>
            {questions.map((q, index) => (
              <li
                key={q.id || index}
                style={{
                  marginBottom: 12,
                  padding: 12,
                  border: '1px solid #eee',
                  borderRadius: 6,
                }}
              >
                <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>
                  {q.prompt}
                </p>
                <p style={{ margin: '2px 0' }}>
                  Target: <strong>{q.targetFraction}</strong>
                </p>
                <p style={{ margin: '2px 0' }}>
                  Your answer: <strong>{q.selectedFraction}</strong>
                </p>
                <p
                  style={{
                    margin: '2px 0',
                    color: q.correct ? 'green' : 'crimson',
                    fontWeight: 600,
                  }}
                >
                  {q.correct ? 'Correct' : 'Incorrect'}
                </p>
                <p style={{ margin: '2px 0', fontSize: 14 }}>
                  Attempts: {q.attempts} · Hint used: {q.hintUsed ? 'Yes' : 'No'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="actions" style={{ marginTop: 16 }}>
        <Link to="/play" className="btn btn--primary">
          Play Again
        </Link>
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default ResultsPage

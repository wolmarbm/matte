import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer'
import SummaryCard from '../components/ui/SummaryCard'
import SectionCard from '../components/ui/SectionCard'
import { getSessionAccuracy } from '../utils/scoring'
import { clearSessions, loadSessions } from '../utils/storage'
import {
  getAverageAccuracy,
  getCommonMistakeSummary,
  getConceptBreakdown,
  getConceptLabel,
  getMostMissedConcept,
} from '../utils/analytics'

const TEACHER_PASSWORD = 'magma'

const MISCONCEPTION_HINTS = {
  'parts-of-whole': 'Needs support with numerator/denominator meaning.',
  'equivalent-fractions': 'Missed equivalent fraction relationship.',
  'compare-fractions': 'Needs practice comparing fraction sizes.',
  'add-fractions':
    'Needs practice adding fractions with the same denominator (add numerators, keep denominator).',
}

function formatPlayedAt(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function getSessionId(session, index) {
  return session.playedAt || `session-${index}`
}

function TeacherPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [sessions, setSessions] = useState(() => loadSessions())
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  const sortedSessions = useMemo(() => {
    return [...sessions]
      .map((s) => ({ ...s, accuracy: getSessionAccuracy(s) }))
      .sort((a, b) => {
        const aTime = a.playedAt ? new Date(a.playedAt).getTime() : 0
        const bTime = b.playedAt ? new Date(b.playedAt).getTime() : 0
        return bTime - aTime
      })
  }, [sessions])

  const totalSessions = sortedSessions.length
  const avgAccuracy = useMemo(() => getAverageAccuracy(sessions), [sessions])
  const conceptBreakdown = useMemo(
    () => getConceptBreakdown(sessions),
    [sessions],
  )
  const mostMissed = useMemo(() => getMostMissedConcept(sessions), [sessions])
  const commonMistake = useMemo(
    () => getCommonMistakeSummary(sessions),
    [sessions],
  )

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (password === TEACHER_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  const handleToggleDetails = (id) => {
    setSelectedSessionId((current) => (current === id ? null : id))
  }

  const handleClearAll = () => {
    const confirmed = window.confirm(
      'Delete all saved student sessions? This cannot be undone.',
    )
    if (!confirmed) return
    clearSessions()
    setSessions([])
    setSelectedSessionId(null)
  }

  if (!isAuthenticated) {
    return (
      <PageContainer variant="student">
        <h1 className="page__title">Teacher Access</h1>
        <p className="page__subtitle">
          Enter the teacher password to continue.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="form__label" htmlFor="teacherPassword">
            Password
          </label>
          <input
            id="teacherPassword"
            type="password"
            className="form__input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="form__error">{error}</p>}
        </form>

        <div className="actions">
          <Link to="/" className="btn btn--secondary">
            Back to Home
          </Link>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
          >
            Unlock
          </button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer variant="teacher">
      <header className="page-header">
        <h1 className="page__title">Teacher Dashboard</h1>
        <p className="page__subtitle">Review saved student sessions.</p>
      </header>

      <section className="summary-grid" aria-label="Dashboard summary">
        <SummaryCard label="Total Sessions" value={totalSessions} />
        <SummaryCard
          label="Average Accuracy"
          value={avgAccuracy === null ? '—' : `${avgAccuracy}%`}
        />
        <SummaryCard
          label="Most Missed Concept"
          value={mostMissed ? mostMissed.label : 'Not enough data yet'}
          hint={mostMissed ? `Accuracy: ${mostMissed.accuracy}%` : undefined}
        />
        <SummaryCard label="Common Mistake" value={commonMistake} />
      </section>

      {conceptBreakdown.length > 0 && (
        <SectionCard
          title="Concept Breakdown"
          ariaLabel="Concept breakdown"
        >
          <p className="concept-table__caption">
            Counts reflect every attempt students made on questions in each
            concept. Accuracy = correct attempts ÷ total attempts.
          </p>
          <table className="concept-table">
            <thead>
              <tr>
                <th>Concept</th>
                <th className="num">Correct attempts</th>
                <th className="num">Incorrect attempts</th>
                <th className="num">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {conceptBreakdown.map((row) => (
                <tr key={row.conceptTag}>
                  <td>{row.label}</td>
                  <td className="num">{row.correct}</td>
                  <td className="num">{row.incorrect}</td>
                  <td className="num" style={{ fontWeight: 600 }}>
                    {row.accuracy}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {totalSessions === 0 ? (
        <section className="empty-state" aria-label="Empty state">
          <p className="empty-state__title">No student sessions yet.</p>
          <p style={{ margin: 0 }}>
            Play a game first to generate teacher review data.
          </p>
        </section>
      ) : (
        <SectionCard title="Recent Sessions" ariaLabel="Session list">
          <ul className="session-list">
            {sortedSessions.map((session, index) => {
              const id = getSessionId(session, index)
              const isOpen = selectedSessionId === id
              const questions = Array.isArray(session.questions)
                ? session.questions
                : []

              return (
                <li key={id} className="session-item">
                  <div className="session-item__header">
                    <div style={{ minWidth: 0 }}>
                      <div className="session-item__name">
                        {session.studentName || 'Unnamed student'}
                      </div>
                      <div className="session-item__meta">
                        {formatPlayedAt(session.playedAt)}
                      </div>
                    </div>
                    <div className="session-item__stats">
                      <div>
                        Score:{' '}
                        <strong>
                          {session.score} / {session.totalQuestions}
                        </strong>
                      </div>
                      <div>
                        Accuracy: <strong>{session.accuracy}%</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn--primary btn--small"
                        onClick={() => handleToggleDetails(id)}
                      >
                        {isOpen ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="session-item__details">
                      <div className="session-detail-grid">
                        <div>
                          <span style={{ color: '#64748b' }}>Student: </span>
                          <strong>
                            {session.studentName || 'Unnamed student'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Played: </span>
                          <strong>{formatPlayedAt(session.playedAt)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Score: </span>
                          <strong>
                            {session.score} / {session.totalQuestions}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Accuracy: </span>
                          <strong>{session.accuracy}%</strong>
                        </div>
                      </div>

                      <h3
                        style={{
                          fontSize: '1rem',
                          margin: '0 0 8px 0',
                          color: '#1f2937',
                        }}
                      >
                        Question breakdown
                      </h3>
                      {questions.length === 0 ? (
                        <p style={{ margin: 0, color: '#64748b' }}>
                          No question details available.
                        </p>
                      ) : (
                        <ol style={{ paddingLeft: 20, margin: 0 }}>
                          {questions.map((q, qIndex) => {
                            const conceptLabel = q.conceptTag
                              ? getConceptLabel(q.conceptTag)
                              : null
                            const misconception =
                              !q.correct && q.conceptTag
                                ? MISCONCEPTION_HINTS[q.conceptTag]
                                : null

                            return (
                              <li
                                key={q.id || qIndex}
                                className="question-card"
                                style={{ background: '#fafafa' }}
                              >
                                <p className="question-card__prompt">
                                  {q.prompt}
                                </p>
                                <div className="badge-row">
                                  <span
                                    className={
                                      'badge ' +
                                      (q.correct
                                        ? 'badge--correct'
                                        : 'badge--incorrect')
                                    }
                                  >
                                    {q.correct ? 'Correct' : 'Incorrect'}
                                  </span>
                                  {conceptLabel ? (
                                    <span className="badge badge--concept">
                                      {conceptLabel}
                                    </span>
                                  ) : null}
                                  {!q.correct ? (
                                    <span className="badge badge--needs-review">
                                      Needs Review
                                    </span>
                                  ) : null}
                                </div>
                                <p className="question-card__row">
                                  Target: <strong>{q.targetFraction}</strong>
                                </p>
                                <p className="question-card__row">
                                  Student answer:{' '}
                                  <strong>{q.selectedFraction ?? '—'}</strong>
                                </p>
                                <p className="question-card__meta">
                                  Attempts: {q.attempts ?? 0} · Incorrect:{' '}
                                  {q.incorrectAttempts ??
                                    Math.max(
                                      0,
                                      (q.attempts ?? 0) - (q.correct ? 1 : 0),
                                    )}{' '}
                                  · Hint used: {q.hintUsed ? 'Yes' : 'No'}
                                </p>
                                {misconception ? (
                                  <p className="question-card__misconception">
                                    {misconception}
                                  </p>
                                ) : null}
                              </li>
                            )
                          })}
                        </ol>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </SectionCard>
      )}

      <div className="actions" style={{ marginTop: 24 }}>
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
        {totalSessions === 0 ? (
          <Link to="/play" className="btn btn--primary">
            Play Now
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleClearAll}
          >
            Clear All Sessions
          </button>
        )}
      </div>
    </PageContainer>
  )
}

export default TeacherPage

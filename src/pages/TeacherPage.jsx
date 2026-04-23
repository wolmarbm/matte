import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
    e.preventDefault()
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
      <main className="page">
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
      </main>
    )
  }

  return (
    <main className="page" style={{ maxWidth: 720, textAlign: 'left' }}>
      <h1 className="page__title" style={{ textAlign: 'left' }}>
        Teacher Dashboard
      </h1>
      <p className="page__subtitle" style={{ textAlign: 'left' }}>
        Review saved student sessions.
      </p>

      <section
        aria-label="Dashboard summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: 14,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <div style={{ fontSize: 13, color: '#555' }}>Total Sessions</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#111' }}>
            {totalSessions}
          </div>
        </div>
        <div
          style={{
            padding: 14,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <div style={{ fontSize: 13, color: '#555' }}>Average Accuracy</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#111' }}>
            {avgAccuracy === null ? '—' : `${avgAccuracy}%`}
          </div>
        </div>
        <div
          style={{
            padding: 14,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <div style={{ fontSize: 13, color: '#555' }}>Most Missed Concept</div>
          {mostMissed ? (
            <>
              <div
                style={{ fontSize: 18, fontWeight: 600, color: '#111' }}
              >
                {mostMissed.label}
              </div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>
                Accuracy: {mostMissed.accuracy}%
              </div>
            </>
          ) : (
            <div style={{ fontSize: 15, color: '#111', marginTop: 2 }}>
              Not enough data yet
            </div>
          )}
        </div>
        <div
          style={{
            padding: 14,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <div style={{ fontSize: 13, color: '#555' }}>Common Mistake</div>
          <div
            style={{
              fontSize: 15,
              color: '#111',
              marginTop: 2,
              lineHeight: 1.35,
            }}
          >
            {commonMistake}
          </div>
        </div>
      </section>

      {conceptBreakdown.length > 0 && (
        <section aria-label="Concept breakdown" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}>
            Concept Breakdown
          </h2>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#fff',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      color: '#111',
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    Concept
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '8px 12px',
                      color: '#111',
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    Correct
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '8px 12px',
                      color: '#111',
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    Incorrect
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '8px 12px',
                      color: '#111',
                      fontWeight: 600,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody>
                {conceptBreakdown.map((row, index) => (
                  <tr
                    key={row.conceptTag}
                    style={{
                      background: index % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '8px 12px', color: '#111' }}>
                      {row.label}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        color: '#111',
                      }}
                    >
                      {row.correct}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        color: '#111',
                      }}
                    >
                      {row.incorrect}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        color: '#111',
                        fontWeight: 600,
                      }}
                    >
                      {row.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {totalSessions === 0 ? (
        <section
          aria-label="Empty state"
          style={{
            padding: 24,
            border: '1px dashed #d1d5db',
            borderRadius: 8,
            background: '#fff',
            textAlign: 'center',
            color: '#555',
            marginBottom: 24,
          }}
        >
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#111' }}>
            No student sessions yet.
          </p>
          <p style={{ margin: 0 }}>
            Play a game first to generate teacher review data.
          </p>
        </section>
      ) : (
        <section aria-label="Session list">
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}>
            Recent Sessions
          </h2>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {sortedSessions.map((session, index) => {
              const id = getSessionId(session, index)
              const isOpen = selectedSessionId === id
              const questions = Array.isArray(session.questions)
                ? session.questions
                : []

              return (
                <li
                  key={id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: '#fff',
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: '#111',
                        }}
                      >
                        {session.studentName || 'Unnamed student'}
                      </div>
                      <div style={{ fontSize: 13, color: '#555' }}>
                        {formatPlayedAt(session.playedAt)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ fontSize: 14, color: '#111' }}>
                        Score:{' '}
                        <strong>
                          {session.score} / {session.totalQuestions}
                        </strong>
                      </div>
                      <div style={{ fontSize: 14, color: '#111' }}>
                        Accuracy: <strong>{session.accuracy}%</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => handleToggleDetails(id)}
                        style={{ padding: '6px 12px', fontSize: 14 }}
                      >
                        {isOpen ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: '1px solid #e5e7eb',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 8,
                          marginBottom: 12,
                          fontSize: 14,
                          color: '#333',
                        }}
                      >
                        <div>
                          <span style={{ color: '#555' }}>Student: </span>
                          <strong>
                            {session.studentName || 'Unnamed student'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#555' }}>Played: </span>
                          <strong>{formatPlayedAt(session.playedAt)}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#555' }}>Score: </span>
                          <strong>
                            {session.score} / {session.totalQuestions}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#555' }}>Accuracy: </span>
                          <strong>{session.accuracy}%</strong>
                        </div>
                      </div>

                      <h3
                        style={{
                          fontSize: '1rem',
                          margin: '0 0 8px 0',
                          color: '#111',
                        }}
                      >
                        Question breakdown
                      </h3>
                      {questions.length === 0 ? (
                        <p style={{ margin: 0, color: '#555' }}>
                          No question details available.
                        </p>
                      ) : (
                        <ol style={{ paddingLeft: 20, margin: 0 }}>
                          {questions.map((q, qIndex) => (
                            <li
                              key={q.id || qIndex}
                              style={{
                                marginBottom: 10,
                                padding: 10,
                                border: '1px solid #eee',
                                borderRadius: 6,
                                background: '#fafafa',
                              }}
                            >
                              <p
                                style={{
                                  margin: '0 0 6px 0',
                                  fontWeight: 600,
                                  color: '#111',
                                }}
                              >
                                {q.prompt}
                              </p>
                              <p
                                style={{
                                  margin: '2px 0',
                                  fontSize: 14,
                                  color: '#333',
                                }}
                              >
                                Target: <strong>{q.targetFraction}</strong>
                              </p>
                              <p
                                style={{
                                  margin: '2px 0',
                                  fontSize: 14,
                                  color: '#333',
                                }}
                              >
                                Student answer:{' '}
                                <strong>{q.selectedFraction ?? '—'}</strong>
                              </p>
                              <p
                                style={{
                                  margin: '2px 0',
                                  fontSize: 14,
                                  color: q.correct ? '#166534' : '#991b1b',
                                  fontWeight: 600,
                                }}
                              >
                                {q.correct ? 'Correct' : 'Incorrect'}
                              </p>
                              <p
                                style={{
                                  margin: '2px 0',
                                  fontSize: 13,
                                  color: '#555',
                                }}
                              >
                                Attempts: {q.attempts ?? 0} · Hint used:{' '}
                                {q.hintUsed ? 'Yes' : 'No'}
                              </p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div
        className="actions"
        style={{ marginTop: 24, justifyContent: 'flex-start' }}
      >
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
    </main>
  )
}

export default TeacherPage

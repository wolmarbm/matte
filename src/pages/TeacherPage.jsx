import { useState } from 'react'
import { Link } from 'react-router-dom'

const TEACHER_PASSWORD = 'magma'

function TeacherPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === TEACHER_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
    }
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
    <main className="page">
      <h1 className="page__title">Teacher Dashboard</h1>
      <p className="page__subtitle">
        This page will show saved student sessions and performance summaries.
      </p>

      <div className="actions">
        <Link to="/" className="btn btn--secondary">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default TeacherPage

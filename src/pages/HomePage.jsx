import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function HomePage() {
  const [studentName, setStudentName] = useState('')
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/play')
  }

  return (
    <main className="page page--home">
      <h1 className="page__title">Pizza Fractions</h1>
      <p className="page__subtitle">Build pizzas to learn fractions.</p>

      <div className="form">
        <label className="form__label" htmlFor="studentName">
          Student name
        </label>
        <input
          id="studentName"
          type="text"
          className="form__input"
          placeholder="Enter your name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
      </div>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleStart}>
          Start Playing
        </button>
        <Link to="/teacher" className="btn btn--secondary">
          Teacher View
        </Link>
      </div>
    </main>
  )
}

export default HomePage

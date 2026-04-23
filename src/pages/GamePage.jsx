import { Link } from 'react-router-dom'

function GamePage() {
  return (
    <main className="page">
      <h1 className="page__title">Student Game</h1>
      <p className="page__subtitle">
        This is where the pizza fraction challenges will appear.
      </p>

      <div className="actions">
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

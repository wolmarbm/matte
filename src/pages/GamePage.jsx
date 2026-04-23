import { Link } from 'react-router-dom'
import PizzaBoard from '../components/PizzaBoard'

function GamePage() {
  return (
    <main className="page">
      <h1 className="page__title">Student Game</h1>
      <p className="page__subtitle">Build 3/4 of a pizza</p>

      <PizzaBoard totalSlices={4} />

      <div className="actions" style={{ marginTop: 24 }}>
        <button type="button" className="btn btn--primary" disabled>
          Check Answer
        </button>
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
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
